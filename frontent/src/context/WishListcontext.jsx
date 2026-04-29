import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import API from "../api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    const loadWishlist = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/${user.id}`);
        if (!isMounted) return;

        // Normalize wishlist items
        const wishlist = (res.data.wishlist || []).map(item => ({
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }));
        
        setWishlistItems(wishlist);
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error("Wishlist load failed:", error);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error("Please login");
      return;
    }

    const exists = wishlistItems.some(
      (item) => item.id === product.id
    );

    if (exists) {
      // Remove if exists (toggle behavior)
      await removeFromWishlist(product.id);
      return;
    }

    setLoading(true);
    
    try {
      const updatedWishlist = [
        ...wishlistItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      ];

      await updateWishlist(updatedWishlist);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Add to wishlist failed:", error);
      toast.error("Failed to add to wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item.id !== id
    );

    await updateWishlist(updatedWishlist);
    toast.success("Removed from wishlist");
  };

  const clearWishlist = async () => {
    await updateWishlist([]);
    toast.success("Wishlist cleared");
  };

  const updateWishlist = async (updatedWishlist) => {
    try {
      setWishlistItems(updatedWishlist);
      setWishlistCount(updatedWishlist.length);

      // Convert to backend format
      const backendWishlist = updatedWishlist.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image
      }));

      await API.patch(`/users/${user.id}`, {
        wishlist: backendWishlist,
      });
    } catch (error) {
      console.error("Wishlist update failed:", error);
      toast.error("Failed to update wishlist");
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
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

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};