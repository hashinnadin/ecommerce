package services

import (
	"errors"
	"fmt"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"
	"myapp/utils/uploads"
	"strings"

	"github.com/google/uuid"
)

type ProductService struct {
	Repo repository.PgSQLRepository
}

func NewProductService(repo repository.PgSQLRepository) *ProductService {
	return &ProductService{
		Repo: repo,
	}
}

func (s *ProductService) CreateProduct(input *dto.CreateProductInput) (*schema.Product, error) {

	if input == nil {
		return nil, errors.New("invalid input")
	}

	file := input.MainImage

	if file == nil {
		return nil, errors.New("main image required")
	}

	// file size validation (2MB)
	if file.Size > 2*1024*1024 {
		return nil, errors.New("file too large")
	}

	// file type validation
	contentType := file.Header.Get("Content-Type")

	if contentType != "image/jpeg" &&
		contentType != "image/png" &&
		contentType != "image/jpg" {
		return nil, errors.New("only jpg/png images allowed")
	}

	mainFile, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open image: %w", err)
	}
	defer mainFile.Close()

	uploadResult, err := uploads.UploadImageFile(mainFile, file.Filename)
	if err != nil {
		return nil, fmt.Errorf("image upload failed: %w", err)
	}

	product := &schema.Product{
		Title:             input.Title,
		Name:              input.Name,
		Description:       input.Description,
		Category:          input.Category,
		Price:             input.Price,
		Stock:             input.Stock,
		InStock:           input.Stock > 0,
		MainImage:         uploadResult.URL,
		MainImagePublicID: uploadResult.PublicID,
	}

	if err := s.Repo.Insert(product); err != nil {

		uploads.DeleteImage(uploadResult.PublicID)

		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return product, nil
}

func (s *ProductService) GetAllProducts(searchQuery string, category string) ([]schema.Product, error) {

	var products []schema.Product

	query := s.Repo.GetDB().Model(&schema.Product{})

	if searchQuery != "" {

		search := "%" + strings.ToLower(searchQuery) + "%"

		query = query.Where(`
			LOWER(name) LIKE ? OR
			LOWER(title) LIKE ? OR
			LOWER(description) LIKE ?
		`, search, search, search)
	}

	if category != "" {

		query = query.Where(
			"LOWER(category) = LOWER(?)",
			category,
		)
	}

	if err := query.Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil
}

func (s *ProductService) GetProductByID(id uuid.UUID) (*schema.Product, error) {

	var product schema.Product

	if err := s.Repo.FindByID(&product, id); err != nil {
		return nil, errors.New("product not found")
	}

	return &product, nil
}

func (s *ProductService) UpdateProduct(
	id uuid.UUID,
	req *dto.UpdateProductInput,
) (*schema.Product, error) {

	var updatedProduct *schema.Product

	err := s.Repo.Transaction(func(txRepo repository.PgSQLRepository) error {
		var product schema.Product
		if err := txRepo.FindByIDWithLock(&product, id); err != nil {
			return errors.New("product not found")
		}

		updates := map[string]interface{}{}

		if req.Title != nil {
			updates["title"] = *req.Title
		}

		if req.Name != nil {
			updates["name"] = *req.Name
		}

		if req.Description != nil {
			updates["description"] = *req.Description
		}

		if req.Category != nil {
			updates["category"] = *req.Category
		}

		if req.Price != nil {
			if *req.Price <= 0 {
				return errors.New("price must be greater than 0")
			}
			updates["price"] = *req.Price
		}

		if req.Stock != nil {
			if *req.Stock < 0 {
				return errors.New("stock cannot be negative")
			}
			updates["stock"] = *req.Stock
			updates["in_stock"] = *req.Stock > 0
		}

		if len(updates) == 0 {
			return errors.New("no fields provided for update")
		}

		if err := txRepo.UpdateByFields(&schema.Product{}, id, updates); err != nil {
			return err
		}

		if err := txRepo.FindByID(&product, id); err != nil {
			return err
		}

		updatedProduct = &product
		return nil
	})

	if err != nil {
		return nil, err
	}

	return updatedProduct, nil
}

func (s *ProductService) DeleteProduct(id uuid.UUID) error {

	var product schema.Product

	if err := s.Repo.FindByID(&product, id); err != nil {
		return errors.New("product not found")
	}

	if product.MainImagePublicID != "" {

		if err := uploads.DeleteImage(product.MainImagePublicID); err != nil {
			fmt.Println("failed to delete image:", err)
		}
	}

	return s.Repo.Delete(&schema.Product{}, id)
}
