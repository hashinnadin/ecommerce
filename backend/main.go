package main

import (
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

	cartService := services.NewCartService(repo)
	cartController := controller.NewCartController(cartService)

	wishlistService := services.NewWishlistService(repo)
	wishlistController := controller.NewWishlistController(wishlistService, cartService)

	adminService := services.NewAdminService(repo)
	adminController := controller.NewAdminController(adminService)

	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetUpRoutes(
		r,
		authController,
		productController,
		cartController,
		wishlistController,
		adminController,
		jwtManager,
		repo,
		redis,
	)

	logger.Log.Info("Server running on port", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
