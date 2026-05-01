package main

import (
	"log"
	"myapp/config"
	"myapp/internal/cache"
	"myapp/internal/routes"
	"myapp/src/controller"
	"myapp/src/database"
	"myapp/src/repository"
	"myapp/src/services"
	"myapp/utils/email"
	"myapp/utils/jwt"
	"myapp/utils/logger"
	"myapp/utils/validation"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()
	logger.InitLogger()
	validation.InitValidation()
	db := database.SetupDatabase(cfg)
	repo := repository.SetUpRepo(db)
	redis := cache.NewRedis()
	jwtManager := jwt.NewJWTManager(cfg)
	emailService := email.NewEmailService(cfg)

	authService := services.NewAuthService(repo, jwtManager, emaliService, redis, cfg)
	authController := controller.NewAuthController(authService)

	r := gin.Default()

	routes.SetUpRoutes(
		r,
		authController,
		jwtManager,
		repo,
	)

	logger.Log.Info("Server running on port", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
