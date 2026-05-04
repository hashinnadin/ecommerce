package schema

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Image       string  `json:"image"`
	Rating      float32 `json:"rating"` // Default: 0.0
}
