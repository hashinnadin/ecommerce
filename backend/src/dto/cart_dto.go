package dto

type AddToCartInput struct {
	ProductID string `json:"product_id" binding:"required,uuid"`
	Quantity  int    `json:"quantity" binding:"required,gte=1"`
}

type UpdateCartInput struct {
	Quantity int `json:"quantity" binding:"required,gte=1"`
}
