package controller

import (
	"myapp/src/dto"
	"myapp/src/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProductController struct {
	ProductService *services.ProductService
}

func NewProductController(service *services.ProductService) *ProductController {
	return &ProductController{
		ProductService: service,
	}
}

func parseUUID(ctx *gin.Context) (uuid.UUID, error) {
	return uuid.Parse(ctx.Param("id"))
}

func (c *ProductController) CreateProduct(ctx *gin.Context) {

	var req dto.CreateProductInput

	if err := ctx.ShouldBind(&req); err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	product, err := c.ProductService.CreateProduct(&req)
	if err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "product created successfully",
		"product": product,
	})
}

func (c *ProductController) GetAllProducts(ctx *gin.Context) {

	searchQuery := strings.TrimSpace(ctx.Query("search"))
	category := strings.TrimSpace(ctx.Query("category"))

	products, err := c.ProductService.GetAllProducts(
		searchQuery,
		category,
	)
	if err != nil {

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"products": products,
	})
}

func (c *ProductController) GetProductByID(ctx *gin.Context) {

	id, err := parseUUID(ctx)
	if err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})

		return
	}

	product, err := c.ProductService.GetProductByID(id)
	if err != nil {

		ctx.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"product": product,
	})
}

func (c *ProductController) UpdateProduct(ctx *gin.Context) {

	id, err := parseUUID(ctx)
	if err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})

		return
	}

	var req dto.UpdateProductInput

	if err := ctx.ShouldBind(&req); err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	product, err := c.ProductService.UpdateProduct(id, &req)
	if err != nil {

		if strings.Contains(err.Error(), "not found") {

			ctx.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

			return
		}

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "product updated successfully",
		"product": product,
	})
}

func (c *ProductController) DeleteProduct(ctx *gin.Context) {

	id, err := parseUUID(ctx)
	if err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid product id",
		})

		return
	}

	err = c.ProductService.DeleteProduct(id)
	if err != nil {

		ctx.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "product deleted successfully",
	})
}
