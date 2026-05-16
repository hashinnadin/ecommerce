package controller

import (
	"myapp/src/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PaymentController struct {
	PaymentService *services.PaymentService
	OrderService   *services.OrderService
	CartService    *services.CartService
}

func NewPaymentController(paymentService *services.PaymentService, orderService *services.OrderService, cartService *services.CartService) *PaymentController {
	return &PaymentController{
		PaymentService: paymentService,
		OrderService:   orderService,
		CartService:    cartService,
	}
}

type VerifyPaymentRequest struct {
	OrderID   string `json:"razorpay_order_id" binding:"required"`
	PaymentID string `json:"razorpay_payment_id" binding:"required"`
	Signature string `json:"razorpay_signature" binding:"required"`
	MyOrderID string `json:"my_order_id" binding:"required"`
}

func (c *PaymentController) VerifyPayment(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, _ := uuid.Parse(userIDStr.(string))

	var req VerifyPaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Verify Signature
	if err := c.PaymentService.VerifyPayment(req.OrderID, req.PaymentID, req.Signature); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "payment verification failed"})
		return
	}

	// 2. Update Order Status in our DB
	myOrderID, err := uuid.Parse(req.MyOrderID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	if err := c.OrderService.UpdateOrderStatus(myOrderID, "PAID"); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order status"})
		return
	}

	// 3. Clear Cart
	if err := c.CartService.ClearCart(userID); err != nil {
		// Log error but don't fail payment verification since payment is already successful
		// logger.Log.Error("failed to clear cart after payment:", err)
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "payment verified and order confirmed"})
}
