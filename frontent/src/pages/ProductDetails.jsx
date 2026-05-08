import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShoppingCart, FaHeart, FaArrowLeft, FaStar, FaCheckCircle } from "react-icons/fa";
import Footer from "../compenent/Footer";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishListcontext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      // Ensure backend call supports UUIDs correctly
      const res = await API.get(`/products/${id}`);
      const data = res.data;
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product details:", error);
      toast.error("Failed to load product details");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    // Note: The cart logic might expect an item object.
    addToCart({ ...product, quantity });
    toast.success(`${product.name} added to cart`);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }
    addToWishlist(product);
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading delicious details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to all cakes</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 relative bg-gray-100">
            <img
              src={product.image || product.main_image} // Handles both backend and frontend structure
              alt={product.name}
              className="w-full h-[400px] md:h-[600px] object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x600?text=Delicious+Cake";
              }}
            />
            <div className="absolute top-4 left-4">
               <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-sm font-bold text-gray-800 shadow-sm uppercase tracking-wider">
                  {product.category || "General"}
               </span>
            </div>
            <button
              onClick={handleAddToWishlist}
              className={`absolute top-4 right-4 p-4 rounded-full transition-all shadow-md ${
                inWishlist
                  ? "bg-rose-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-rose-500 hover:text-white"
              }`}
            >
              <FaHeart size={20} fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            
            <div className="mb-2 flex items-center justify-between">
               <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  {product.name}
               </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.rating || 5) ? "text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-gray-500 text-sm font-medium">({product.rating || "5.0"} Rating)</span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <span className="text-4xl font-bold text-rose-600">₹{product.price}</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this cake</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description || "A deliciously handcrafted cake perfect for any occasion. Made with the finest ingredients and lots of love."}
              </p>
            </div>

            {/* Stock / Availability */}
            <div className="mb-8 flex items-center gap-2 text-emerald-600 font-medium">
               <FaCheckCircle />
               <span>{product.stock > 0 ? `In Stock (${product.stock} available)` : "Available to order"}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 sm:w-1/3">
                <button 
                  onClick={() => handleQuantityChange("decrease")}
                  className="text-gray-500 hover:text-rose-600 text-xl font-bold w-8 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-bold text-gray-800">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange("increase")}
                  className="text-gray-500 hover:text-rose-600 text-xl font-bold w-8 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl py-4 font-bold text-lg hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                <FaShoppingCart size={20} />
                Add to Cart
              </button>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetails;
