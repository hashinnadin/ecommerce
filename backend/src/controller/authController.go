package controller

import (
	
	"myapp/src/dto"
	"myapp/src/services"
	"myapp/utils/constant"
	"myapp/utils/logger"
	"myapp/utils/validation"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController(service *services.AuthService) *AuthController {
	return &AuthController{authService: service}
}

func (a *AuthController) Signup(c *gin.Context) {
	var req dto.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	logger.Log.Info("Signup:", req.Email, req.Name)
	err := a.authService.Signup(req.Name, req.Email, req.Password)
	if err != nil {
		logger.Log.Error("Signup failed:", err)
		c.JSON(constant.BADREQUEST, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{
		"message": "Signup successful, OTP sent",
	})
}

func (a *AuthController) VerifyOTP(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	err := a.authService.VerifyOTP(req.Email, req.OTP)
	if err != nil {
		logger.Log.Warn("OTP failed:", err)
		c.JSON(constant.BADREQUEST, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{
		"message": "Account verified",
	})
}
func (c *AuthController) ResendOTP(ctx *gin.Context) {
	var req dto.ResendOTPRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	if err := c.authService.ResendOTP(req.Email); err != nil {
		ctx.JSON(constant.BADREQUEST, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(constant.SUCCESS, gin.H{"message": "OTP resent successfully"})
}

func (a *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	access, refresh, user, err := a.authService.Login(req.Email, req.Password)
	if err != nil {
		logger.Log.Error("Login failed:", err)
		c.JSON(constant.UNAUTHORIZED, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"role":          user.Role,
	})
}

func (a *AuthController) Refresh(c *gin.Context) {
	var body dto.TokenRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	newAccess, newRefresh, err := a.authService.Refresh(body.RefreshToken)
	if err != nil {
		logger.Log.Warn("Refresh failed", err)
		c.JSON(constant.UNAUTHORIZED, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{
		"new_access_token":  newAccess,
		"new_refresh_token": newRefresh,
	})
}

func (a *AuthController) Logout(c *gin.Context) {
	var body dto.TokenRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}

	var accessToken string
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			accessToken = parts[1]
		}
	}

	err := a.authService.Logout(body.RefreshToken, accessToken)
	if err != nil {
		logger.Log.Error("Logout failed:", err)
		c.JSON(constant.INTERNALSERVERERROR, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{"message": "Logged out successfully"})
}

func (a *AuthController) Dashboard(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	user, err := a.authService.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(constant.INTERNALSERVERERROR, gin.H{"error": "failed to get user info"})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{
		"message": "Welcome to " + user.Name,
		"user_id": userID,
		"name":    user.Name,
		"role":    role,
	})
}

func (a *AuthController) ForgotPassword(c *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	if err := a.authService.ForgotPassword(req.Email); err != nil {
		c.JSON(constant.BADREQUEST, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{"message": "Password reset OTP sent to your email"})
}

func (a *AuthController) ResetPassword(c *gin.Context) {
	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(constant.BADREQUEST, validation.FormatValidationErrors(err))
		return
	}
	if err := a.authService.ResetPassword(req.Email, req.OTP, req.NewPassword); err != nil {
		c.JSON(constant.BADREQUEST, gin.H{"error": err.Error()})
		return
	}
	c.JSON(constant.SUCCESS, gin.H{"message": "Password reset successfully"})
}
