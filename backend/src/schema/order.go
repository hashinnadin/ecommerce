package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderStatus string

const (
	StatusPending    OrderStatus = "PENDING"
	StatusProcessing OrderStatus = "PROCESSING"
	StatusPaid       OrderStatus = "PAID"
	StatusShipped    OrderStatus = "SHIPPED"
	StatusDelivered  OrderStatus = "DELIVERED"
	StatusCancelled  OrderStatus = "CANCELLED"
)

type Order struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	User        User        `gorm:"foreignKey:UserID" json:"-"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	Subtotal    int64       `gorm:"not null" json:"subtotal"`
	DeliveryFee int64       `gorm:"not null;default:0" json:"delivery_fee"`
	TotalAmount int64       `gorm:"not null" json:"total_amount"`
	Status      OrderStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	
	PaymentMethod string `json:"payment_method"`
	FullName      string `json:"full_name"`
	Mobile        string `json:"mobile"`
	House         string `json:"house"`
	Street        string `json:"street"`
	City          string `json:"city"`
	State         string `json:"state"`
	Pincode       string `json:"pincode"`
	RazorpayOrderID string `json:"razorpay_order_id"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	o.ID = uuid.New()
	return nil
}

type OrderItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	Price     int64     `gorm:"not null" json:"price"` // price at the time of order
	
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	oi.ID = uuid.New()
	return nil
}
