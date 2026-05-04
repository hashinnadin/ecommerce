package services

import (
	"errors"
	"myapp/src/schema"
	"myapp/src/dto"
	"myapp/src/repository"
)

type ProductService struct {
	Repo repository.PgSQLRepository
}

func NewProductService(repo repository.PgSQLRepository) *ProductService {
	return &ProductService{
		Repo: repo,
	}
}

func (s *ProductService) CreateProduct(req dto.CreateProductRequest) (*schema.Product, error) {
	product := schema.Product{
		Name:        req.Name,
		Price:       req.Price,
		Category:    req.Category,
		Description: req.Description,
		Image:       req.Image,
		Rating:      0.0, // Default rating
	}

	if err := s.Repo.Insert(&product); err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) GetAllProducts() ([]schema.Product, error) {
	var products []schema.Product
	if err := s.Repo.FindAll(&products); err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetProductByID(id uint) (*schema.Product, error) {
	var product schema.Product
	if err := s.Repo.FindByID(&product, id); err != nil {
		return nil, errors.New("product not found")
	}
	return &product, nil
}

func (s *ProductService) UpdateProduct(id uint, req dto.UpdateProductRequest) (*schema.Product, error) {
	// First check if it exists
	_, err := s.GetProductByID(id)
	if err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Price > 0 {
		updates["price"] = req.Price
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}

	if len(updates) > 0 {
		if err := s.Repo.UpdateByFields(&schema.Product{}, id, updates); err != nil {
			return nil, err
		}
	}

	return s.GetProductByID(id)
}

func (s *ProductService) DeleteProduct(id uint) error {
	var product schema.Product
	if err := s.Repo.FindByID(&product, id); err != nil {
		return errors.New("product not found")
	}
	return s.Repo.Delete(&schema.Product{}, id)
}
