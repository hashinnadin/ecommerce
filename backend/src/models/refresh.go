package models

import (
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type RefreshToken struct {
	ID     uuid.UUID `gorm:"type:uuid;primarykey"`
	UserID uuid.UUID `gorm:"type:uuid"`

	Token     string
	CreatedAt time.Time
}

func (r *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	r.ID = uuid.New()
	return nil
}
