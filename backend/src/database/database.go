package database

import (
	"fmt"
	"log"
	"myapp/config"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var pgOnce sync.Once

func SetupDatabase(cfg *config.Config) *gorm.DB {
	pgDb := &gorm.DB{}

	pgOnce.Do(func() {
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s",
			cfg.DB.Host,
			cfg.DB.User,
			cfg.DB.Password,
			cfg.DB.Name,
			cfg.DB.Port,
			cfg.DB.SSLMode,
			cfg.DB.TimeZone,
		)
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect database", err)
		}
		sqlDB, err := db.DB()
		if err != nil {
			log.Fatal("failed to get Database instance", err)
		}
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
		pgDb = db
		log.Fatal("Database connected succesfully")
	})
	return pgDb
}
