package main

import (
	"context"
	"log"
	"myapp/config"
	"myapp/internal/cache"
	"myapp/internal/routes"
	"myapp/src/controller"
	"myapp/src/database"
	"myapp/src/migration"
	"myapp/src/repository"
	"myapp/src/services"
	"myapp/utils/email"
	"myapp/utils/jwt"
	"myapp/utils/logger"
	"myapp/utils/validation"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()
	logger.InitLogger()
	validation.InitValidation()
	db := database.SetupDatabase(cfg)
	migration.MigrateDatabase(db)
	repo := repository.SetUpRepo(db)
	redis := cache.NewRedis()
	jwtManager := jwt.NewJWTManager(cfg)
	emailService := email.NewEmailService(cfg)

	authService := services.NewAuthService(repo, jwtManager, emailService, redis, cfg)
	authController := controller.NewAuthController(authService)

	productService := services.NewProductService(repo)
	productController := controller.NewProductController(productService)

	userService := services.NewUserService(repo)
	userController := controller.NewUserController(userService)

	cartService := services.NewCartService(repo)
	cartController := controller.NewCartController(cartService)

	wishlistService := services.NewWishlistService(repo)
	wishlistController := controller.NewWishlistController(wishlistService, cartService)

	adminService := services.NewAdminService(repo, redis)
	adminController := controller.NewAdminController(adminService)

	paymentService := services.NewPaymentService(repo, cfg)
	orderService := services.NewOrderService(repo, cartService, paymentService)
	orderController := controller.NewOrderController(orderService)
	paymentController := controller.NewPaymentController(paymentService, orderService, cartService)

	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:  cfg.Server.AllowedOrigins,
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	routes.SetUpRoutes(
		r,
		authController,
		productController,
		cartController,
		wishlistController,
		userController,
		adminController,
		orderController,
		paymentController,
		jwtManager,
		repo,
		redis,
	)

	srv := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: r,
	}

	go func() {
		logger.Log.Info("Server running on port ", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Log.Fatal("Server forced to shutdown: ", err)
	}

	logger.Log.Info("Server exiting")
}
