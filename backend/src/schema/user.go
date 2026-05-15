package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name     string    `gorm:"not null" json:"name"`
	Email    string    `gorm:"uniqueIndex;not null" json:"email"`
	Password string    `gorm:"not null" json:"-"`

	Role       string `gorm:"default:user" json:"role"`
	IsBlocked  bool   `gorm:"default:false" json:"is_blocked"`
	IsVerified bool   `gorm:"default:false" json:"is_verified"`

	FullName string `json:"fullName"`
	Mobile   string `json:"mobile"`
	House    string `json:"house"`
	Street   string `json:"street"`
	City     string `json:"city"`
	Pincode  string `json:"pincode"`
	State    string `json:"state"`

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	return nil
}
