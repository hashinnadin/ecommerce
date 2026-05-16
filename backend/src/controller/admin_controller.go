package controller

import (
	"myapp/src/dto"
	"myapp/src/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminController struct {
	AdminService *services.AdminService
}

func NewAdminController(service *services.AdminService) *AdminController {
	return &AdminController{AdminService: service}
}

func (c *AdminController) UpdateUser(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id format"})
		return
	}

	var req dto.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.AdminService.UpdateUser(id, &req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "user updated successfully"})
}

func (c *AdminController) BlockUser(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id format"})
		return
	}

	var req dto.BlockUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.AdminService.BlockUser(id, req.IsBlocked); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	action := "unblocked"
	if req.IsBlocked {
		action = "blocked"
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "user " + action + " successfully"})
}

func (c *AdminController) GetUsers(ctx *gin.Context) {
	users, err := c.AdminService.GetUsers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, users)
}

func (c *AdminController) GetOrders(ctx *gin.Context) {
	orders, err := c.AdminService.GetOrders()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, orders)
}

func (c *AdminController) GetDashboardStats(ctx *gin.Context) {
	stats, err := c.AdminService.GetDashboardStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, stats)
}

func (c *AdminController) UpdateOrderStatus(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id format"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.AdminService.UpdateOrderStatus(id, req.Status); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "order status updated successfully"})
}

func (c *AdminController) GetOrderByID(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id format"})
		return
	}

	order, err := c.AdminService.GetOrderByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Map to a response that includes user and nested address
	resp := gin.H{
		"id":           order.ID,
		"total_amount": order.TotalAmount,
		"status":       order.Status,
		"payment_method": order.PaymentMethod,
		"created_at":   order.CreatedAt,
		"user": gin.H{
			"name":  order.User.Name,
			"email": order.User.Email,
		},
		"address": gin.H{
			"fullName": order.FullName,
			"mobile":   order.Mobile,
			"house":    order.House,
			"street":   order.Street,
			"city":     order.City,
			"state":    order.State,
			"pincode":  order.Pincode,
		},
		"items": func() []gin.H {
			var items []gin.H
			for _, item := range order.Items {
				items = append(items, gin.H{
					"id":         item.ID,
					"product_id": item.ProductID,
					"quantity":   item.Quantity,
					"price":      item.Price,
					"product": gin.H{
						"id":         item.Product.ID,
						"title":      item.Product.Title,
						"main_image": item.Product.MainImage,
						"category":   item.Product.Category,
					},
				})
			}
			return items
		}(),
	}

	ctx.JSON(http.StatusOK, resp)
}

