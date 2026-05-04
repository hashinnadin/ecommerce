package services

import (
	"errors"
	"myapp/internal/cache"
	"myapp/src/schema"
	
	"myapp/src/repository"
	"myapp/utils/email"
	"myapp/utils/jwt"
	"myapp/utils/logger"
	"myapp/utils/otp"
	"myapp/utils/password"
	"strings"
	"time"

	"github.com/google/uuid"
)

type AuthService struct {
	Repo         repository.PgSQLRepository
	Redis        *cache.Redis
	JwtManager   *jwt.Manager
	cfg          *schema.Config
	emailService *email.Service
}

func NewAuthService(
	repo repository.PgSQLRepository,
	jwt *jwt.Manager,
	email *email.Service,
	redis *cache.Redis,
	cfg *schema.Config,
) *AuthService {
	return &AuthService{
		Repo:         repo,
		JwtManager:   jwt,
		emailService: email,
		Redis:        redis,
		cfg:          cfg,
	}
}

func (a *AuthService) Signup(username, email, passwordStr string) error {
	email = strings.ToLower(strings.TrimSpace(email))
	var exist schema.User
	err := a.Repo.FindOneWhere(&exist, "email=?", email)
	if err == nil {
		return errors.New("email already exist")
	}
	otpCode, err := otp.GenerateOTP()
	if err != nil {
		return err
	}
	hashOTP, err := password.HashPassword(otpCode)
	if err != nil {
		return err
	}
	if err := a.emailService.SendOTP(email, otpCode); err != nil {
		return err
	}
	hashed, err := password.HashPassword(passwordStr)
	if err != nil {
		return err
	}

	key := "otp:verify:" + email
	err = a.Redis.Client.Set(
		cache.Ctx,
		key,
		hashOTP,
		time.Duration(a.cfg.OTP.ExpiryMinutes)*time.Minute,
	).Err()
	if err != nil {
		logger.Log.Error("Failed to save OTP to Redis: ", err)
		return errors.New("failed to generate OTP, please try again")
	}

	user := schema.User{
		Name:       username,
		Email:      email,
		Password:   hashed,
		IsVerified: false,
	}
	if err := a.Repo.Insert(&user); err != nil {
		// Cleanup the OTP from Redis if DB insert fails
		a.Redis.Client.Del(cache.Ctx, key)
		return err
	}

	logger.Log.Infof("OTP sent to %s", email)
	return nil

}

// verify otp

func (s *AuthService) VerifyOTP(emailStr, otpCode string) error {
	emailStr = strings.ToLower(strings.TrimSpace(emailStr))
	var user schema.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		return errors.New("user not found")
	}
	if user.IsVerified {
		return errors.New("already verified")
	}
	key := "otp:verify:" + emailStr
	storedOTP, err := s.Redis.Client.Get(cache.Ctx, key).Result()
	if err != nil {
		logger.Log.Error("Redis Get error: ", err)
		return errors.New("OTP expired or invalid")
	}
	if !password.ComparePassword(storedOTP, otpCode) {
		return errors.New("invalid OTP")
	}
	updates := map[string]interface{}{
		"is_verified": true,
	}
	if err := s.Repo.UpdateByFields(&schema.User{}, user.ID, updates); err != nil {
		return err
	}
	s.Redis.Client.Del(cache.Ctx, key)
	return nil
}

func (s *AuthService) ResendOTP(emailStr string) error {
	emailStr = strings.ToLower(strings.TrimSpace(emailStr))
	var user schema.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		return errors.New("user not found")
	}
	if user.IsVerified {
		return errors.New("already verified")
	}

	otpcode, err := otp.GenerateOTP()
	if err != nil {
		return err
	}
	hashedOTP, err := password.HashPassword(otpcode)
	if err != nil {
		return err
	}
	if err := s.emailService.SendOTP(emailStr, otpcode); err != nil {
		return err
	}

	key := "otp:verify:" + emailStr
	err = s.Redis.Client.Set(
		cache.Ctx,
		key,
		hashedOTP,
		time.Duration(s.cfg.OTP.ExpiryMinutes)*time.Minute,
	).Err()
	if err != nil {
		logger.Log.Error("Failed to save OTP to Redis: ", err)
		return errors.New("failed to resend OTP, please try again")
	}
	logger.Log.Infof("OTP resent to %s", emailStr)
	return nil
}

func (s *AuthService) Login(emailStr, passwordStr string) (string, string, *schema.User, error) {
	emailStr = strings.ToLower(strings.TrimSpace(emailStr))
	var user schema.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		return "", "", nil, errors.New("invalid credentials")
	}
	if !user.IsVerified {
		return "", "", nil, errors.New("user not verified")
	}
	if user.IsBlocked {
		return "", "", nil, errors.New("user blocked")
	}
	if !password.ComparePassword(user.Password, passwordStr) {
		return "", "", nil, errors.New("invalid credentials")
	}
	accessToken, err := s.JwtManager.GenerateAccessToken(user.ID.String(), user.Role)
	if err != nil {
		return "", "", nil, err
	}
	sessionID := uuid.New()
	refreshToken, err := s.JwtManager.GenerateRefreshToken(
		user.ID.String(),
		user.Role,
		sessionID.String(),
	)
	if err != nil {
		return "", "", nil, err
	}
	refresh := schema.RefreshToken{
		ID:        sessionID,
		UserID:    user.ID,
		Token:     password.HashToken(refreshToken),
		ExpiresAt: time.Now().Add(time.Duration(s.cfg.JWT.RefreshTTLHours) * time.Hour),
	}
	if err := s.Repo.Insert(&refresh); err != nil {
		return "", "", nil, err
	}
	return accessToken, refreshToken, &user, nil
}

func (s *AuthService) Refresh(token string) (string, string, error) {
	claims, err := s.JwtManager.ValidateRefresh(token)
	if err != nil {
		return "", "", errors.New("invalid token")
	}
	sessionID := claims["session_id"].(string)
	userID := claims["user_id"].(string)
	role := claims["role"].(string)

	var stored schema.RefreshToken
	err = s.Repo.FindOneWhere(&stored, "id = ?", sessionID)
	if err != nil {
		return "", "", errors.New("token not found")
	}
	if !password.CompareHashToken(token, stored.Token) {
		return "", "", errors.New("invalid token")
	}
	if time.Now().After(stored.ExpiresAt) {
		return "", "", errors.New("token expired")
	}
	newAccess, err := s.JwtManager.GenerateAccessToken(userID, role)
	if err != nil {
		return "", "", err
	}
	newRefresh, err := s.JwtManager.GenerateRefreshToken(userID, role, sessionID)
	if err != nil {
		return "", "", err
	}
	updates := map[string]interface{}{
		"token": password.HashToken(newRefresh),
	}
	s.Repo.UpdateByFields(&schema.RefreshToken{}, sessionID, updates)
	return newAccess, newRefresh, nil

}

func (s *AuthService) Logout(refreshToken string, accessToken string) error {
	claims, err := s.JwtManager.ValidateRefresh(refreshToken)
	if err != nil {
		return errors.New("invalid token")
	}
	sessionID := claims["session_id"].(string)
	
	// Blacklist the access token
	if accessToken != "" {
		accessClaims, err := s.JwtManager.ValidateAccessToken(accessToken)
		if err == nil {
			expFloat, ok := accessClaims["exp"].(float64)
			if ok {
				expTime := time.Unix(int64(expFloat), 0)
				ttl := time.Until(expTime)
				if ttl > 0 {
					key := "blacklist:" + accessToken
					s.Redis.Client.Set(cache.Ctx, key, "true", ttl)
				}
			}
		}
	}

	return s.Repo.Delete(&schema.RefreshToken{}, sessionID)
}

func (s *AuthService) GetUserByID(userID string) (*schema.User, error) {
	var user schema.User
	err := s.Repo.FindByID(&user, userID)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) ForgotPassword(emailStr string) error {
	emailStr = strings.ToLower(strings.TrimSpace(emailStr))
	var user schema.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		return errors.New("user not found")
	}

	otpcode, err := otp.GenerateOTP()
	if err != nil {
		return err
	}
	hashedOTP, err := password.HashPassword(otpcode)
	if err != nil {
		return err
	}
	if err := s.emailService.SendOTP(emailStr, otpcode); err != nil {
		return err
	}

	key := "otp:reset:" + emailStr
	err = s.Redis.Client.Set(
		cache.Ctx,
		key,
		hashedOTP,
		time.Duration(s.cfg.OTP.ExpiryMinutes)*time.Minute,
	).Err()
	if err != nil {
		logger.Log.Error("Failed to save reset OTP to Redis: ", err)
		return errors.New("failed to process request, please try again")
	}
	logger.Log.Infof("Password reset OTP sent to %s", emailStr)
	return nil
}

func (s *AuthService) ResetPassword(emailStr, otpCode, newPassword string) error {
	emailStr = strings.ToLower(strings.TrimSpace(emailStr))
	var user schema.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		return errors.New("user not found")
	}

	key := "otp:reset:" + emailStr
	storedOTP, err := s.Redis.Client.Get(cache.Ctx, key).Result()
	if err != nil {
		logger.Log.Error("Redis Get error: ", err)
		return errors.New("OTP expired or invalid")
	}
	if !password.ComparePassword(storedOTP, otpCode) {
		return errors.New("invalid OTP")
	}

	hashed, err := password.HashPassword(newPassword)
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"password": hashed,
	}
	if err := s.Repo.UpdateByFields(&schema.User{}, user.ID, updates); err != nil {
		return err
	}
	s.Redis.Client.Del(cache.Ctx, key)
	return nil
}
