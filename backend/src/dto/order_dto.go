package dto

type PlaceOrderRequest struct {
	PaymentMethod string `json:"paymentMethod" binding:"required"`
	Address       struct {
		FullName string `json:"fullName" binding:"required"`
		Mobile   string `json:"mobile" binding:"required"`
		House    string `json:"house" binding:"required"`
		Street   string `json:"street" binding:"required"`
		City     string `json:"city" binding:"required"`
		State    string `json:"state" binding:"required"`
		Pincode  string `json:"pincode" binding:"required"`
	} `json:"address" binding:"required"`
}
type OrderResponse struct {
	ID            string              `json:"id"`
	TotalAmount   int64               `json:"total_amount"`
	Status        string              `json:"status"`
	PaymentMethod string              `json:"paymentMethod"`
	CreatedAt     string              `json:"created_at"`
	Address       AddressDTO          `json:"address"`
	Items         []OrderItemResponse `json:"items"`
}

type AddressDTO struct {
	FullName string `json:"fullName"`
	Mobile   string `json:"mobile"`
	House    string `json:"house"`
	Street   string `json:"street"`
	City     string `json:"city"`
	State    string `json:"state"`
	Pincode  string `json:"pincode"`
}

type OrderItemResponse struct {
	ID        string `json:"id"`
	ProductID string `json:"product_id"`
	Title     string `json:"title"`
	Quantity  int    `json:"quantity"`
	Price     int64  `json:"price"`
	MainImage string `json:"main_image"`
}
