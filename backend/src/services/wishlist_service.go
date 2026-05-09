package services

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/google/uuid"
)

type WishlistService struct {
	Repo repository.PgSQLRepository
}

func NewWishlistService(repo repository.PgSQLRepository) *WishlistService {
	return &WishlistService{Repo: repo}
}

func (s *WishlistService) GetUserWishlist(userID uuid.UUID) ([]schema.Wishlist, error) {
	var wishlist []schema.Wishlist
	err := s.Repo.GetDB().Preload("Product").Where("user_id = ?", userID).Find(&wishlist).Error
	if err != nil {
		return nil, err
	}
	return wishlist, nil
}

func (s *WishlistService) AddToWishlist(userID uuid.UUID, input *dto.AddToWishlistInput) error {
	// Check if product exists
	var product schema.Product
	if err := s.Repo.FindByID(&product, input.ProductID); err != nil {
		return errors.New("product not found")
	}

	// Check if already in wishlist
	var count int64
	s.Repo.GetDB().Model(&schema.Wishlist{}).Where("user_id = ? AND product_id = ?", userID, input.ProductID).Count(&count)
	if count > 0 {
		return errors.New("product already in wishlist")
	}

	wishlistItem := schema.Wishlist{
		UserID:    userID,
		ProductID: input.ProductID,
	}

	return s.Repo.Insert(&wishlistItem)
}

func (s *WishlistService) RemoveFromWishlist(userID uuid.UUID, productID uuid.UUID) error {
	result := s.Repo.GetDB().Where("user_id = ? AND product_id = ?", userID, productID).Delete(&schema.Wishlist{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("product not found in wishlist")
	}
	return nil
}
