package middleware

import (
	"myapp/internal/cache"
	"myapp/src/repository"
	"myapp/utils/constant"
	"myapp/utils/jwt"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtManager *jwt.Manager, redisClient *cache.Redis, repo *repository.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}
		token := parts[1]

		// Check if token is blacklisted
		key := "blacklist:" + token
		val, err := redisClient.Client.Get(cache.Ctx, key).Result()
		if err == nil && val == "true" {
			c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Token has been revoked"})
			c.Abort()
			return
		}

		claims, err := jwtManager.ValidateAccessToken(token)
		if err != nil {
			c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}
		userID, ok := claims["user_id"].(string)
		if !ok || userID == "" {
			c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Check if user is blocked in database
		var userStatus struct {
			IsBlocked bool `gorm:"column:is_blocked"`
		}
		if err := repo.DB.Table("users").Select("is_blocked").Where("id = ?", userID).First(&userStatus).Error; err == nil {
			if userStatus.IsBlocked {
				c.JSON(constant.UNAUTHORIZED, gin.H{"error": "Your account has been suspended"})
				c.Abort()
				return
			}
		}

		role, _ := claims["role"].(string)
		c.Set("user_id", userID)
		c.Set("role", role)
		c.Next()
	}
}
