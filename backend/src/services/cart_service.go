package services

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartService struct {
	Repo repository.PgSQLRepository
}

func NewCartService(repo repository.PgSQLRepository) *CartService {
	return &CartService{
		Repo: repo,
	}
}

func (s *CartService) WithRepo(repo repository.PgSQLRepository) *CartService {
	return &CartService{Repo: repo}
}

// GetOrCreateCart retrieves a user's cart, creating one if it doesn't exist
func (s *CartService) GetOrCreateCart(userID uuid.UUID) (*schema.Cart, error) {
	var cart schema.Cart

	err := s.Repo.GetDB().Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create a new cart for the user
			cart = schema.Cart{UserID: userID}
			if err := s.Repo.Insert(&cart); err != nil {
				return nil, err
			}
			return &cart, nil
		}
		return nil, err
	}

	return &cart, nil
}

// AddToCart adds a product to the cart or increments its quantity
func (s *CartService) AddToCart(userID uuid.UUID, input *dto.AddToCartInput) error {
	productID, err := uuid.Parse(input.ProductID)
	if err != nil {
		return errors.New("invalid product ID")
	}

	cart, err := s.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	// 1. Fetch the product to check stock and price
	var product schema.Product
	if err := s.Repo.FindByID(&product, productID); err != nil {
		return errors.New("product not found")
	}

	if product.Stock < input.Quantity {
		return errors.New("not enough stock available")
	}

	// 2. Check if the item is already in the cart, including soft-deleted ones
	var existingItem schema.CartItem
	err = s.Repo.GetDB().Unscoped().Where("cart_id = ? AND product_id = ?", cart.ID, product.ID).First(&existingItem).Error

	if err == nil {
		// Item exists in cart, could be active or deleted
		newQuantity := input.Quantity
		if !existingItem.DeletedAt.Valid {
			// Item is active, update quantity
			newQuantity += existingItem.Quantity
		}

		if product.Stock < newQuantity {
			return errors.New("not enough stock available for the requested total quantity")
		}

		// Update quantity, price, and restore if it was soft-deleted
		return s.Repo.GetDB().Unscoped().Model(&existingItem).Updates(map[string]interface{}{
			"quantity":   newQuantity,
			"price":      product.Price, // Update price to latest
			"deleted_at": nil,
		}).Error
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// Item does not exist in cart, create new
		newItem := schema.CartItem{
			CartID:    cart.ID,
			ProductID: product.ID,
			Quantity:  input.Quantity,
			Price:     product.Price,
		}
		return s.Repo.Insert(&newItem)
	}

	return err
}

// UpdateCartItem updates the quantity of an existing cart item
func (s *CartService) UpdateCartItem(userID uuid.UUID, itemID uuid.UUID, input *dto.UpdateCartInput) error {
	cart, err := s.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	var item schema.CartItem
	if err := s.Repo.GetDB().Where("id = ? AND cart_id = ?", itemID, cart.ID).First(&item).Error; err != nil {
		return errors.New("cart item not found in your cart")
	}

	var product schema.Product
	if err := s.Repo.FindByID(&product, item.ProductID); err != nil {
		return errors.New("product no longer exists")
	}

	if product.Stock < input.Quantity {
		return errors.New("not enough stock available")
	}

	return s.Repo.UpdateByFields(&schema.CartItem{}, item.ID, map[string]interface{}{
		"quantity": input.Quantity,
	})
}

// RemoveFromCart removes a single item from the cart
func (s *CartService) RemoveFromCart(userID uuid.UUID, itemID uuid.UUID) error {
	cart, err := s.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	// Ensure the item belongs to this cart before deleting
	result := s.Repo.GetDB().Where("id = ? AND cart_id = ?", itemID, cart.ID).Delete(&schema.CartItem{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("cart item not found")
	}

	return nil
}

// ClearCart removes all items from the user's cart
func (s *CartService) ClearCart(userID uuid.UUID) error {
	cart, err := s.GetOrCreateCart(userID)
	if err != nil {
		return err
	}

	return s.Repo.GetDB().Where("cart_id = ?", cart.ID).Delete(&schema.CartItem{}).Error
}
