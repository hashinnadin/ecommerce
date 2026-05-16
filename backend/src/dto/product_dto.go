package dto

import "mime/multipart"

type CreateProductInput struct {
	Title       string `form:"title" binding:"required,min=2"`
	Name        string `form:"name" binding:"required,min=2,max=100"`
	Category    string `form:"category" binding:"required"`
	Description string `form:"description" binding:"required,min=5,max=100"`
	Price       int64  `form:"price" binding:"required,gt=0"`
	Stock       int    `form:"stock" binding:"required,gte=0"`
	InStock     *bool  `form:"in_stock"`

	MainImage *multipart.FileHeader `form:"main_image"`
}

type UpdateProductInput struct {
	Title       *string `form:"title" binding:"omitempty,min=2"`
	Name        *string `form:"name" binding:"omitempty,min=2"`
	Category    *string `form:"category" binding:"omitempty"`
	Description *string `form:"description" binding:"omitempty,min=5"`
	Price       *int64  `form:"price" binding:"omitempty,gt=0"`
	Stock       *int    `form:"stock" binding:"omitempty,gte=0"`
	InStock     *bool   `form:"in_stock"`

	MainImage *multipart.FileHeader `form:"image"`
}
