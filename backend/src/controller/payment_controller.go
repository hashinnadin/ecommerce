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
	orderID, err := uuid.Parse(req.MyOrderID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	// Update order status to PAID/SUCCESS
	// We'll use AdminService or OrderService to update the status.
	// Actually, let's just use the repo here or add a method to OrderService.
	if err := c.OrderService.UpdateOrderStatus(orderID, "SUCCESS"); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order status"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "payment verified and order confirmed"})
}
