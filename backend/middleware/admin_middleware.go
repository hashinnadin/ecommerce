package middleware

import (
	"myapp/utils/constant"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware ensures that the authenticated user has the 'admin' role.
// It must be used AFTER AuthMiddleware in the router chain.
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(constant.FORBIDDEN, gin.H{"error": "Forbidden: Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}
