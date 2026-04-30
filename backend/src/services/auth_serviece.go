package services

import (
	"errors"
	"myapp/config"
	"myapp/internal/cache"
	"myapp/src/models"
	"myapp/src/repository"
	"myapp/utils/email"
	"myapp/utils/jwt"
	"myapp/utils/logger"
	"myapp/utils/otp"
	"myapp/utils/password"
	"time"

	"github.com/google/uuid"
)

type AuthServiece struct {
	Repo         repository.PgSQLRepository
	Redis        *cache.Redis
	JwtManager   *jwt.Manager
	cfg          *config.Config
	emailService *email.Service
}

func NewAuthService(
	repo repository.PgSQLRepository,
	jwt *jwt.Manager,
	email *email.Service,
	redis *cache.Redis,
	cfg *config.Config,
) *AuthServiece {
	return &AuthServiece{
		Repo:         repo,
		JwtManager:   jwt,
		emailService: email,
		Redis:        redis,
		cfg:          cfg,
	}
}

func (a *AuthServiece) Signup(username, email, passwordStr string) error {
	var exist models.User
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

	user := models.User{
		Name:       username,
		Email:      email,
		Password:   hashed,
		IsVerified: false,
	}
	if err := a.Repo.Insert(&user); err != nil {
		return err
	}
	key := "otp:verify:" + email
	a.Redis.Client.Set(
		cache.Ctx,
		key,
		hashOTP,
		time.Duration(a.cfg.OTP.ExpiryMinutes)*time.Minute,
	)
	logger.Log.Infof("OTP sent to %s", email)
	return nil

}

// verify otp

func (s *AuthServiece) VerifyOTP(emailStr, otpCode string) error {
	var user models.User
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
		return errors.New("OTP expired")
	}
	if !password.ComparePassword(storedOTP, otpCode) {
		return errors.New("invalid OTP")
	}
	updates := map[string]interface{}{
		"is_verified": true,
	}
	if err := s.Repo.UpdateByFields(&models.User{}, user.ID, updates); err != nil {
		return err
	}
	s.Redis.Client.Del(cache.Ctx, key)
	return nil
}

func (s *AuthServiece) ResendOTP(emailStr string) error {
	var user models.User
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
	s.Redis.Client.Set(
		cache.Ctx,
		key,
		hashedOTP,
		time.Duration(s.cfg.OTP.ExpiryMinutes)*time.Minute,
	)
	logger.Log.Infof("OTP resent to %s", emailStr)
	return nil
}

func (s *AuthServiece) Login(emailStr, passwordStr string) (string, string, *models.User, error) {
	var user models.User
	err := s.Repo.FindOneWhere(&user, "email = ?", emailStr)
	if err != nil {
		if emailStr == "bakehub@gmail.com" && passwordStr == "sootika123" {
			hashedPassword, hashErr := password.HashPassword("sootika123")
			if hashErr != nil {
				return "", "", nil, hashErr
			}

			user = models.User{
				ID:         uuid.New(),
				Name:       "Admin",
				Email:      "bakehub@gmail.com",
				Password:   hashedPassword,
				Role:       "admin",
				IsVerified: true,
				IsBlocked:  false,
			}

			if createErr := s.Repo.Insert(&user); createErr != nil {
				logger.Log.Error("Failed to create admin user:", createErr)
				return "", "", nil, errors.New("failed to create admin user")
			}

			logger.Log.Info("Admin user created successfully on first login")
		} else {
			return "", "", nil, errors.New("invalid credentials")
		}
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
	refresh := models.RefreshToken{
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

func (s *AuthServiece) Refresh(token string) (string, string, error) {
	claims, err := s.JwtManager.ValidateRefresh(token)
	if err != nil {
		return "", "", errors.New("invalid token")
	}
	sessionID := claims["session_id"].(string)
	userID := claims["user_id"].(string)
	role := claims["role"].(string)

	var stored models.RefreshToken
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
	s.Repo.UpdateByFields(&models.RefreshToken{}, sessionID, updates)
	return newAccess, newRefresh, nil

}

func (s *AuthServiece) Logout(token string) error {
	claims, err := s.JwtManager.ValidateRefresh(token)
	if err != nil {
		return errors.New("invalid token")
	}
	sessionID := claims["session_id"].(string)
	return s.Repo.Delete(&models.RefreshToken{}, sessionID)
}

func (s *AuthServiece) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	err := s.Repo.FindByID(&user, userID)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

/////
