package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name     string    `gorm:"no null"`
	Email    string    `gorm:"uniqueIndex;not null"`
	Password string    `gorm:"not null"`

	Role       string `gorm:"default:user"`
	IsBlocked  bool   `gorm:"default:false"`
	IsVerified bool   `gorm:"default:false"`

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	return nil
}
