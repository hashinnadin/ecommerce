package services

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/google/uuid"
)

type AdminService struct {
	Repo repository.PgSQLRepository
}

func NewAdminService(repo repository.PgSQLRepository) *AdminService {
	return &AdminService{Repo: repo}
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
	var user schema.User
	if err := s.Repo.FindByID(&user, userID); err != nil {
		return errors.New("user not found")
	}

	return s.Repo.GetDB().Model(&user).Update("is_blocked", isBlocked).Error
}
