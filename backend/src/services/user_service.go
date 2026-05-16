package services

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"
	"myapp/utils/uploads"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	Repo repository.PgSQLRepository
}

func NewUserService(repo repository.PgSQLRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetProfile(userID uuid.UUID) (*schema.User, error) {
	var user schema.User
	if err := s.Repo.FindByID(&user, userID); err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func (s *UserService) UpdateProfile(userID uuid.UUID, req *dto.UpdateProfileRequest) (*schema.User, error) {
	var user schema.User
	if err := s.Repo.FindByID(&user, userID); err != nil {
		return nil, errors.New("user not found")
	}

	updates := map[string]interface{}{}

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Mobile != "" {
		updates["mobile"] = req.Mobile
	}

	// Handle Avatar Upload
	if req.Avatar != nil {
		file, err := req.Avatar.Open()
		if err != nil {
			return nil, err
		}
		defer file.Close()

		// Upload to Cloudinary
		result, err := uploads.UploadImageFile(file, "avatar_"+userID.String())
		if err != nil {
			return nil, errors.New("failed to upload avatar")
		}

		// Delete old avatar if exists
		if user.AvatarPublicID != "" {
			_ = uploads.DeleteImage(user.AvatarPublicID)
		}

		updates["avatar"] = result.URL
		updates["avatar_public_id"] = result.PublicID
	}

	if err := s.Repo.UpdateByFields(&schema.User{}, userID, updates); err != nil {
		return nil, err
	}

	// Fetch updated user
	var updatedUser schema.User
	s.Repo.FindByID(&updatedUser, userID)
	return &updatedUser, nil
}

func (s *UserService) ChangePassword(userID uuid.UUID, oldPwd, newPwd string) error {
	var user schema.User
	if err := s.Repo.FindByID(&user, userID); err != nil {
		return errors.New("user not found")
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPwd)); err != nil {
		return errors.New("incorrect old password")
	}

	// Hash new password
	hashed, err := bcrypt.GenerateFromPassword([]byte(newPwd), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.Repo.UpdateByFields(&schema.User{}, userID, map[string]interface{}{"password": string(hashed)})
}
