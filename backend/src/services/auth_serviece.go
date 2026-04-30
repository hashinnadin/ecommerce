package services

import (
	"errors"
	"myapp/internal/cache"
	"myapp/src/models"
	"myapp/src/repository"
	"myapp/utils/jwt"
)

type AuthServiece struct {
	Repo       repository.PgSQLRepository
	Redis      *cache.Redis
	JwtManager *jwt.Manager
}

func CreateAuthServiece(repo repository.PgSQLRepository, redis *cache.Redis, jwt *jwt.Manager) *AuthServiece {
	return &AuthServiece{
		Repo:       repo,
		Redis:      redis,
		JwtManager: jwt,
	}
}

func (a *AuthServiece) Signup(username, email, password string) error {
	var exist *models.User
	err := a.Repo.FindOneWhere(&exist, "email=?", email)
	if err == nil {
		return errors.New("email already exist")
	}
}
