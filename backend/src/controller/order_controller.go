package controller

import (
	"myapp/src/dto"
	"myapp/src/schema"
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

func mapOrderToResponse(order *schema.Order) dto.OrderResponse {
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

	return dto.OrderResponse{
		ID:              order.ID.String(),
		Subtotal:        order.Subtotal,
		DeliveryFee:     order.DeliveryFee,
		TotalAmount:     order.TotalAmount,
		Status:          string(order.Status),
		PaymentMethod:   order.PaymentMethod,
		CreatedAt:       order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Address: dto.AddressDTO{
			FullName: order.FullName,
			Mobile:   order.Mobile,
			House:    order.House,
			Street:   order.Street,
			City:     order.City,
			State:    order.State,
			Pincode:  order.Pincode,
		},
		Items:           itemsResp,
		RazorpayOrderID: order.RazorpayOrderID,
	}
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

	ctx.JSON(http.StatusCreated, mapOrderToResponse(order))
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
	for i := range orders {
		respList = append(respList, mapOrderToResponse(&orders[i]))
	}

	ctx.JSON(http.StatusOK, respList)
}

// GetUserOrderByID returns a single order for the authenticated user
func (c *OrderController) GetUserOrderByID(ctx *gin.Context) {
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

	orderID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := c.OrderService.GetUserOrderByID(userID, orderID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, mapOrderToResponse(order))
}
