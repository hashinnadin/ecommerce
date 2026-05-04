package routes

import (
	"myapp/internal/cache"
	"myapp/middleware"
	"myapp/src/controller"
	"myapp/src/repository"
	"myapp/utils/jwt"

	"github.com/gin-gonic/gin"
)

func SetUpRoutes(
	r *gin.Engine,
	authController *controller.AuthController,
	productController *controller.ProductController,
	jwtManager *jwt.Manager,
	repo *repository.Repository,
	redisClient *cache.Redis,
) {

	auth := r.Group("/auth")
	{
		auth.POST("/signup", authController.Signup)
		auth.POST("/verify", authController.VerifyOTP)
		auth.POST("/resend-otp", authController.ResendOTP)
		auth.POST("/login", authController.Login)
		auth.POST("/refresh", authController.Refresh)
		auth.POST("/logout", authController.Logout)
		auth.POST("/forgot-password", authController.ForgotPassword)
		auth.POST("/reset-password", authController.ResetPassword)
	}

	// User routes
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(jwtManager, redisClient))
	user.GET("/dashboard", authController.Dashboard)

	// Product routes
	products := r.Group("/products")
	{
		products.GET("", productController.GetAllProducts)
		products.GET("/:id", productController.GetProductByID)
	}

	// Admin routes
	admin := r.Group("/admin")
	{
		admin.POST("/products", productController.CreateProduct)
		admin.PUT("/products/:id", productController.UpdateProduct)
		admin.DELETE("/products/:id", productController.DeleteProduct)
	}
}
