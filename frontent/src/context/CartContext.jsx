import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import API from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Cart Data
  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get("/user/cart");
      const items = res.data.cart?.items || [];
      
      const normalizedCart = items.map(item => ({
        // We need both the CartItem ID (for updating/deleting) and Product ID
        cartItemId: item.id,
        id: item.product_id,
        productId: item.product_id,
        name: item.product?.title || item.product?.name || "Unknown Product",
        price: Number(item.price) || 0,
        image: item.product?.main_image || item.product?.image || "",
        quantity: Number(item.quantity) || 1
      }));
      
      setCartItems(normalizedCart);
      setCartCount(normalizedCart.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error("Cart load failed:", error);
      // Fallback silent fail if not authorized yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user logs in
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // 🔹 Add to cart
  const addToCart = async (product) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!product || !product.id) {
      toast.error("Invalid product");
      return;
    }

    setLoading(true);
    try {
      await API.post("/user/cart", {
        product_id: product.id,
        quantity: product.quantity || 1
      });
      toast.success(`${product.title || product.name || "Product"} added to cart`);
      await loadCart();
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error(error.response?.data?.error || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update quantity
  const updateQuantity = async (id, quantity) => {
    // Find the cartItemId corresponding to the productId
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    try {
      await API.put(`/user/cart/${item.cartItemId}`, {
        quantity: Number(quantity)
      });
      await loadCart();
    } catch (error) {
      console.error("Update quantity failed:", error);
      toast.error("Failed to update cart quantity");
    }
  };

  // 🔹 Remove from cart
  const removeFromCart = async (id) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    try {
      await API.delete(`/user/cart/${item.cartItemId}`);
      toast.success("Item removed from cart");
      await loadCart();
    } catch (error) {
      console.error("Remove from cart failed:", error);
      toast.error("Failed to remove item");
    }
  };

  // 🔹 Clear cart
  const clearCart = async () => {
    try {
      await API.delete("/user/cart");
      toast.success("Cart cleared");
      await loadCart();
    } catch (error) {
      console.error("Clear cart failed:", error);
      toast.error("Failed to clear cart");
    }
  };

  // 🔹 Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * (item.quantity || 1));
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};