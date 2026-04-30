package routes

import (
	"myapp/middleware"
	controllers "myapp/src/controller"
	"myapp/src/repository"
	"myapp/utils/jwt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetUpRoutes(
	r *gin.Engine,
	authController *controllers.AuthController,
	jwtManager *jwt.Manager,
	repo *repository.Repository,
) {
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true // Allow all origins for development
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.GET("/api/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "backend connected",
		})
	})
	auth := r.Group("/auth")
	{
		auth.POST("/signup", authController.Signup)
		auth.POST("/verify", authController.VerifyOTP)
		auth.POST("/resend-otp", authController.ResendOTP)
		auth.POST("/login", authController.Login)
		auth.POST("/refresh", authController.Refresh)
		auth.POST("/logout", authController.Logout)
	}

	// User routes
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(jwtManager))
	user.GET("/dashboard", authController.Dashboard)
}
