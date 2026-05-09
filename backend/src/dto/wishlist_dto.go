package dto

import "github.com/google/uuid"

type AddToWishlistInput struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
}
