package controller

import (
	"myapp/src/dto"
	"myapp/src/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderController struct {
	OrderService *services.OrderService
}

func NewOrderController(service *services.OrderService) *OrderController {
	return &OrderController{OrderService: service}
}

// PlaceOrder endpoints creates an order from the user's cart
func (c *OrderController) PlaceOrder(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID"})
		return
	}

	var req dto.PlaceOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := c.OrderService.PlaceOrder(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Map to DTO
	var itemsResp []dto.OrderItemResponse
	for _, item := range order.Items {
		itemsResp = append(itemsResp, dto.OrderItemResponse{
			ID:        item.ID.String(),
			ProductID: item.ProductID.String(),
			Title:     item.Product.Title,
			Quantity:  item.Quantity,
			Price:     item.Price,
			MainImage: item.Product.MainImage,
		})
	}

	resp := dto.OrderResponse{
		ID:            order.ID.String(),
		TotalAmount:   order.TotalAmount,
		Status:        string(order.Status),
		PaymentMethod: order.PaymentMethod,
		CreatedAt:     order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Address: dto.AddressDTO{
			FullName: order.FullName,
			Mobile:   order.Mobile,
			House:    order.House,
			Street:   order.Street,
			City:     order.City,
			State:    order.State,
			Pincode:  order.Pincode,
		},
		Items: itemsResp,
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Order placed successfully",
		"order":   resp,
	})
}

// GetUserOrders returns all orders for the authenticated user
func (c *OrderController) GetUserOrders(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID"})
		return
	}

	orders, err := c.OrderService.GetUserOrders(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var respList []dto.OrderResponse
	for _, order := range orders {
		var itemsResp []dto.OrderItemResponse
		for _, item := range order.Items {
			itemsResp = append(itemsResp, dto.OrderItemResponse{
				ID:        item.ID.String(),
				ProductID: item.ProductID.String(),
				Title:     item.Product.Title,
				Quantity:  item.Quantity,
				Price:     item.Price,
				MainImage: item.Product.MainImage,
			})
		}
		respList = append(respList, dto.OrderResponse{
			ID:            order.ID.String(),
			TotalAmount:   order.TotalAmount,
			Status:        string(order.Status),
			PaymentMethod: order.PaymentMethod,
			CreatedAt:     order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			Address: dto.AddressDTO{
				FullName: order.FullName,
				Mobile:   order.Mobile,
				House:    order.House,
				Street:   order.Street,
				City:     order.City,
				State:    order.State,
				Pincode:  order.Pincode,
			},
			Items: itemsResp,
		})
	}

	ctx.JSON(http.StatusOK, respList)
}
