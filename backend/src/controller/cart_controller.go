package controller

import (
	"errors"
	"myapp/src/dto"
	"myapp/src/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CartController struct {
	CartService *services.CartService
}

func NewCartController(service *services.CartService) *CartController {
	return &CartController{
		CartService: service,
	}
}

// helper to get the authenticated user's ID
func getUserID(ctx *gin.Context) (uuid.UUID, error) {
	idStr, exists := ctx.Get("user_id")
	if !exists {
		return uuid.Nil, errors.New("missing user_id in context")
	}
	return uuid.Parse(idStr.(string))
}

func (c *CartController) GetCart(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing user token"})
		return
	}

	cart, err := c.CartService.GetOrCreateCart(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"cart": cart})
}

func (c *CartController) AddToCart(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing user token"})
		return
	}

	var req dto.AddToCartInput
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.CartService.AddToCart(userID, &req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "item added to cart successfully"})
}

func (c *CartController) UpdateCartItem(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing user token"})
		return
	}

	itemID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid cart item id"})
		return
	}

	var req dto.UpdateCartInput
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.CartService.UpdateCartItem(userID, itemID, &req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "cart item updated successfully"})
}

func (c *CartController) RemoveFromCart(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing user token"})
		return
	}

	itemID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid cart item id"})
		return
	}

	if err := c.CartService.RemoveFromCart(userID, itemID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "item removed from cart"})
}

func (c *CartController) ClearCart(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing user token"})
		return
	}

	if err := c.CartService.ClearCart(userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "cart cleared successfully"})
}
