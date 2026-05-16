package dto

import "mime/multipart"

type UpdateProfileRequest struct {
	Name   string                `form:"name"`
	Mobile string                `form:"mobile"`
	Avatar *multipart.FileHeader `form:"avatar"`
}

type UserProfileResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Mobile    string `json:"mobile"`
	Avatar    string `json:"avatar"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
