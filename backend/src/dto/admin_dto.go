package dto

type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type BlockUserRequest struct {
	IsBlocked bool `json:"is_blocked"` // true for block, false for unblock
}
