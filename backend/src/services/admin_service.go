package services

import (
	"errors"
	"myapp/internal/cache"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/google/uuid"
)

type AdminService struct {
	Repo  repository.PgSQLRepository
	Redis *cache.Redis
}

func NewAdminService(repo repository.PgSQLRepository, redis *cache.Redis) *AdminService {
	return &AdminService{Repo: repo, Redis: redis}
}

func (s *AdminService) UpdateUser(userID uuid.UUID, req *dto.UpdateUserRequest) error {
	var user schema.User
	if err := s.Repo.FindByID(&user, userID); err != nil {
		return errors.New("user not found")
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}

	if len(updates) > 0 {
		return s.Repo.GetDB().Model(&user).Updates(updates).Error
	}
	return nil
}

func (s *AdminService) BlockUser(userID uuid.UUID, isBlocked bool) error {
	err := s.Repo.GetDB().Model(&schema.User{}).Where("id = ?", userID).Update("is_blocked", isBlocked).Error
	if err != nil {
		return err
	}

	// Update Redis cache for real-time revocation
	key := "blocked:" + userID.String()
	if isBlocked {
		// Set a "blocked" flag in Redis (expires in 24h or until unblocked)
		s.Redis.Client.Set(cache.Ctx, key, "true", 0)
	} else {
		// Remove the flag if unblocked
		s.Redis.Client.Del(cache.Ctx, key)
	}

	return nil
}

func (s *AdminService) GetUsers() ([]schema.User, error) {
	var users []schema.User
	if err := s.Repo.GetDB().Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *AdminService) GetOrders() ([]schema.Order, error) {
	var orders []schema.Order
	err := s.Repo.GetDB().
		Preload("Items.Product").
		Preload("User").
		Order("created_at desc").
		Find(&orders).Error
	return orders, err
}

func (s *AdminService) GetDashboardStats() (*dto.DashboardStatsResponse, error) {
	var totalUsers int64
	var totalProducts int64
	var totalOrders int64

	if err := s.Repo.GetDB().Model(&schema.User{}).Count(&totalUsers).Error; err != nil {
		return nil, err
	}

	if err := s.Repo.GetDB().Model(&schema.Product{}).Count(&totalProducts).Error; err != nil {
		return nil, err
	}

	if err := s.Repo.GetDB().Model(&schema.Order{}).Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	return &dto.DashboardStatsResponse{
		TotalUsers:    totalUsers,
		TotalProducts: totalProducts,
		TotalOrders:   totalOrders,
	}, nil
}

func (s *AdminService) UpdateOrderStatus(orderID uuid.UUID, status string) error {
	var order schema.Order
	if err := s.Repo.FindByID(&order, orderID); err != nil {
		return errors.New("order not found")
	}

	var normalizedStatus string
	switch status {
	case "processing":
		normalizedStatus = string(schema.StatusProcessing)
	case "shipped":
		normalizedStatus = string(schema.StatusShipped)
	case "success":
		normalizedStatus = string(schema.StatusDelivered)
	case "canceled":
		normalizedStatus = string(schema.StatusCancelled)
	default:
		normalizedStatus = status
	}

	return s.Repo.GetDB().Model(&order).Update("status", normalizedStatus).Error
}

func (s *AdminService) GetOrderByID(orderID uuid.UUID) (*schema.Order, error) {
	var order schema.Order
	err := s.Repo.GetDB().
		Preload("Items.Product").
		Preload("User").
		First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, errors.New("order not found")
	}
	return &order, nil
}

