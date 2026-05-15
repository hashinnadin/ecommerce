import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import API from "../api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get("/user/wishlist");
      
      const wishlist = (res.data.wishlist || []).map(item => ({
        id: item.product_id,
        name: item.product?.title || item.product?.name || "Unknown",
        price: item.product?.price || 0,
        image: item.product?.main_image || item.product?.image || ""
      }));
      
      setWishlistItems(wishlist);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error("Wishlist load failed:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error("Please login");
      return;
    }

    const exists = wishlistItems.some((item) => item.id === product.id);

    if (exists) {
      // Remove if exists (toggle behavior)
      await removeFromWishlist(product.id);
      return;
    }

    setLoading(true);
    try {
      await API.post("/user/wishlist", { product_id: product.id });
      toast.success("Added to wishlist");
      await loadWishlist();
    } catch (error) {
      console.error("Add to wishlist failed:", error);
      toast.error("Failed to add to wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await API.delete(`/user/wishlist/${id}`);
      toast.success("Removed from wishlist");
      await loadWishlist();
    } catch (error) {
      console.error("Remove from wishlist failed:", error);
      toast.error("Failed to remove item");
    }
  };

  // The backend doesn't have a clear wishlist API, so we manually remove all
  const clearWishlist = async () => {
    if (wishlistItems.length === 0) return;
    setLoading(true);
    try {
      for (const item of wishlistItems) {
        await API.delete(`/user/wishlist/${item.id}`);
      }
      toast.success("Wishlist cleared");
      await loadWishlist();
    } catch (error) {
      console.error("Clear wishlist failed:", error);
      toast.error("Failed to completely clear wishlist");
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};