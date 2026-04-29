import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import API from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Load cart when user logs in
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/${user.id}`);
        if (!isMounted) return;

        console.log("Raw cart data from server:", res.data.cart); // Debug log

        // CRITICAL FIX: Normalize cart items to consistent format
        const cart = (res.data.cart || []).map(item => {
          // Handle both possible formats (productId or id)
          const itemId = item.productId || item.id;
          
          return {
            id: itemId, // Always use 'id' in frontend
            productId: itemId, // Keep for reference
            name: item.name || "Unknown Product",
            price: Number(item.price) || 0, // Ensure number
            image: item.image || "",
            quantity: Number(item.quantity) || 1 // Ensure number
          };
        });
        
        console.log("Normalized cart items:", cart); // Debug log
        
        setCartItems(cart);
        setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch (error) {
        console.error("Cart load failed:", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 🔹 Add to cart
  const addToCart = async (product) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    // Validate product
    if (!product || !product.id) {
      toast.error("Invalid product");
      return;
    }

    setLoading(true);
    
    try {
      // Check if product already exists
      const existingItem = cartItems.find(
        (item) => item.id === product.id
      );

      let updatedCart;

      if (existingItem) {
        // Increase quantity if exists
        updatedCart = cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        toast.info(`Increased ${product.name} quantity`);
      } else {
        // Add new item
        updatedCart = [
          ...cartItems,
          {
            id: product.id,
            productId: product.id,
            name: product.name || "Product",
            price: Number(product.price) || 0,
            image: product.image || "",
            quantity: 1,
          },
        ];
        toast.success(`${product.name} added to cart`);
      }

      await updateCart(updatedCart);
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update quantity
  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) {
      // If quantity becomes 0, remove item
      await removeFromCart(id);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Number(quantity) } : item
    );

    await updateCart(updatedCart);
  };

  // 🔹 Remove from cart
  const removeFromCart = async (id) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== id
    );

    await updateCart(updatedCart);
    toast.success("Item removed from cart");
  };

  // 🔹 Clear cart
  const clearCart = async () => {
    await updateCart([]);
    toast.success("Cart cleared");
  };

  // 🔹 Update cart (shared function)
  const updateCart = async (updatedCart) => {
    try {
      // Update state immediately for UI responsiveness
      setCartItems(updatedCart);
      setCartCount(
        updatedCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      );

      // Prepare data for backend (use productId format)
      const backendCart = updatedCart.map(item => ({
        productId: item.id, // Important: Use productId for backend
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: Number(item.quantity)
      }));

      console.log("Saving to backend:", backendCart); // Debug log

      // Save to backend
      await API.patch(`/users/${user.id}`, {
        cart: backendCart,
      });
    } catch (error) {
      console.error("Cart update failed:", error);
      toast.error("Failed to update cart");
      
      // Revert state on error
      const res = await API.get(`/users/${user.id}`);
      const cart = (res.data.cart || []).map(item => ({
        id: item.productId || item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: Number(item.quantity)
      }));
      setCartItems(cart);
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      
      throw error;
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};