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
	cartController *controller.CartController,
	wishlistController *controller.WishlistController,
	userController *controller.UserController,
	adminController *controller.AdminController,
	orderController *controller.OrderController,
	paymentController *controller.PaymentController,
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
	user.Use(middleware.AuthMiddleware(jwtManager, redisClient, repo))
	{
		user.GET("/profile", userController.GetProfile)
		user.PUT("/profile", userController.UpdateProfile)
		user.POST("/change-password", userController.ChangePassword)
		user.GET("/dashboard", authController.Dashboard)
	}

	// Cart routes (Protected by user middleware)
	cart := user.Group("/cart")
	{
		cart.GET("", cartController.GetCart)
		cart.POST("", cartController.AddToCart)
		cart.PUT("/:id", cartController.UpdateCartItem)
		cart.DELETE("/:id", cartController.RemoveFromCart)
		cart.DELETE("", cartController.ClearCart)
	}

	// Wishlist routes (Protected by user middleware)
	wishlist := user.Group("/wishlist")
	{
		wishlist.GET("", wishlistController.GetUserWishlist)
		wishlist.POST("", wishlistController.AddToWishlist)
		wishlist.DELETE("/:product_id", wishlistController.RemoveFromWishlist)
		wishlist.POST("/:product_id/cart", wishlistController.MoveToCart)
	}

	// Orders routes (Protected by user middleware)
	orders := user.Group("/orders")
	{
		orders.POST("", orderController.PlaceOrder)
		orders.GET("", orderController.GetUserOrders)
		orders.GET("/:id", orderController.GetUserOrderByID)
	}

	user.POST("/payment/verify", paymentController.VerifyPayment)

	// Product routes
	products := r.Group("/products")
	{
		products.GET("", productController.GetAllProducts)
		products.GET("/:id", productController.GetProductByID)
	}

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(jwtManager, redisClient, repo))
	admin.Use(middleware.AdminMiddleware())
	{
		admin.POST("/products", productController.CreateProduct)
		admin.PUT("/products/:id", productController.UpdateProduct)
		admin.DELETE("/products/:id", productController.DeleteProduct)

		admin.GET("/users", adminController.GetUsers)
		admin.PUT("/users/:id", adminController.UpdateUser)
		admin.PUT("/users/:id/block", adminController.BlockUser)

		admin.GET("/orders", adminController.GetOrders)
		admin.GET("/orders/:id", adminController.GetOrderByID)
		admin.PUT("/orders/:id/status", adminController.UpdateOrderStatus)

		admin.GET("/dashboard", adminController.GetDashboardStats)
	}
}
