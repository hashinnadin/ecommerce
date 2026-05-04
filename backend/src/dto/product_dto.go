package dto

type CreateProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Image       string  `json:"image" binding:"required"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price" binding:"omitempty,gt=0"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Image       string  `json:"image"`
}
