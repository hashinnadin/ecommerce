package services

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/google/uuid"
)

type OrderService struct {
	Repo        repository.PgSQLRepository
	CartService *CartService
}

func NewOrderService(repo repository.PgSQLRepository, cartService *CartService) *OrderService {
	return &OrderService{
		Repo:        repo,
		CartService: cartService,
	}
}

// PlaceOrder converts a user's cart into an order
func (s *OrderService) PlaceOrder(userID uuid.UUID, req *dto.PlaceOrderRequest) (*schema.Order, error) {
	// 1. Fetch Cart
	cart, err := s.CartService.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	if len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	var newOrder schema.Order

	// 2. Start Transaction
	err = s.Repo.Transaction(func(txRepo repository.PgSQLRepository) error {
		var totalAmount int64
		var orderItems []schema.OrderItem

		// Calculate total, check stock, and prepare order items
		for _, item := range cart.Items {
			// Fetch fresh product info for stock validation using txRepo
			var product schema.Product
			if err := txRepo.FindByID(&product, item.ProductID); err != nil {
				return errors.New("product not found in cart item")
			}

			if product.Stock < item.Quantity {
				return errors.New("insufficient stock for product: " + product.Title)
			}

			// Deduct stock
			newStock := product.Stock - item.Quantity
			if err := txRepo.GetDB().Model(&product).Update("stock", newStock).Error; err != nil {
				return err
			}

			// Calculate item price
			itemTotal := product.Price * int64(item.Quantity)
			totalAmount += itemTotal

			orderItems = append(orderItems, schema.OrderItem{
				ProductID: product.ID,
				Quantity:  item.Quantity,
				Price:     product.Price,
			})
		}

		// 3. Create Order
		newOrder = schema.Order{
			UserID:        userID,
			TotalAmount:   totalAmount,
			Status:        schema.StatusPending,
			PaymentMethod: req.PaymentMethod,
			FullName:      req.Address.FullName,
			Mobile:        req.Address.Mobile,
			House:         req.Address.House,
			Street:        req.Address.Street,
			City:          req.Address.City,
			State:         req.Address.State,
			Pincode:       req.Address.Pincode,
		}

		if err := txRepo.Insert(&newOrder); err != nil {
			return err
		}

		// 4. Create OrderItems
		for i := range orderItems {
			orderItems[i].OrderID = newOrder.ID
			if err := txRepo.Insert(&orderItems[i]); err != nil {
				return err
			}
		}

		// 5. Update User's saved address
		if err := txRepo.GetDB().Model(&schema.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
			"full_name": req.Address.FullName,
			"mobile":    req.Address.Mobile,
			"house":     req.Address.House,
			"street":    req.Address.Street,
			"city":      req.Address.City,
			"state":     req.Address.State,
			"pincode":   req.Address.Pincode,
		}).Error; err != nil {
			return err
		}

		// 6. Clear Cart (Hard Delete items within this tx)
		if err := txRepo.GetDB().Unscoped().Where("cart_id = ?", cart.ID).Delete(&schema.CartItem{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Fetch the newly created order with its items to return
	var createdOrder schema.Order
	if err := s.Repo.GetDB().Preload("Items.Product").First(&createdOrder, "id = ?", newOrder.ID).Error; err != nil {
		return nil, err
	}

	return &createdOrder, nil
}

// GetUserOrders retrieves all orders for a specific user
func (s *OrderService) GetUserOrders(userID uuid.UUID) ([]schema.Order, error) {
	var orders []schema.Order
	err := s.Repo.GetDB().
		Preload("Items.Product").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&orders).Error
	return orders, err
}

// GetAllOrders retrieves all orders (for admin)
func (s *OrderService) GetAllOrders() ([]schema.Order, error) {
	var orders []schema.Order
	err := s.Repo.GetDB().
		Preload("Items.Product").
		Preload("User").
		Order("created_at desc").
		Find(&orders).Error
	return orders, err
}
