package controller

import (
	"myapp/src/dto"
	"myapp/src/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WishlistController struct {
	WishlistService *services.WishlistService
	CartService     *services.CartService
}

func NewWishlistController(wService *services.WishlistService, cService *services.CartService) *WishlistController {
	return &WishlistController{
		WishlistService: wService,
		CartService:     cService,
	}
}

func (c *WishlistController) GetUserWishlist(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
		return
	}

	wishlist, err := c.WishlistService.GetUserWishlist(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"wishlist": wishlist})
}

func (c *WishlistController) AddToWishlist(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
		return
	}

	var req dto.AddToWishlistInput
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = c.WishlistService.AddToWishlist(userID, &req)
	if err != nil {
		if err.Error() == "product already in wishlist" {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "product not found" {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "product added to wishlist successfully"})
}

func (c *WishlistController) RemoveFromWishlist(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
		return
	}

	productID, err := uuid.Parse(ctx.Param("product_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id format"})
		return
	}

	err = c.WishlistService.RemoveFromWishlist(userID, productID)
	if err != nil {
		if err.Error() == "product not found in wishlist" {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "product removed from wishlist successfully"})
}

func (c *WishlistController) MoveToCart(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
		return
	}

	productID, err := uuid.Parse(ctx.Param("product_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id format"})
		return
	}

	// 1. Add to Cart (Default quantity is 1)
	cartInput := dto.AddToCartInput{
		ProductID: productID.String(),
		Quantity:  1,
	}
	err = c.CartService.AddToCart(userID, &cartInput)
	if err != nil {
		// If product is not found or out of stock
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Remove from Wishlist
	// We ignore the error here because if it wasn't in the wishlist to begin with, 
	// it's fine, the item is still successfully in the cart.
	_ = c.WishlistService.RemoveFromWishlist(userID, productID)

	ctx.JSON(http.StatusOK, gin.H{"message": "product moved to cart successfully"})
}
