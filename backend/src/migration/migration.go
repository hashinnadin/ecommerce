package migration

import (
	"log"
	"myapp/src/schema"

	"gorm.io/gorm"
)

func MigrateDatabase(db *gorm.DB) {
	err := db.AutoMigrate(
		&schema.User{},
		&schema.RefreshToken{},
		&schema.Product{},
		&schema.Cart{},
		&schema.CartItem{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migration completed successfully")
}
