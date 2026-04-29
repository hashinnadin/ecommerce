import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";

import Footer from "../compenent/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishListcontext";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  // 🔹 FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("/products?_limit=8");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load featured cakes");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Remove wishlistItems dependency to prevent re-fetch

  // 🔹 SEARCH FILTER
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 ADD TO CART
  const handleAddToCart = (cake) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addToCart(cake);
  };

  // 🔹 ADD TO WISHLIST
  const handleAddToWishlist = async (cake, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    await addToWishlist(cake);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Sweet Moments, Delivered Fresh
        </h1>
        <p className="text-lg mb-6">Artisan cakes baked daily</p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-white text-rose-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
        >
          Explore Collection
        </button>
      </div>

      {/* SEARCH */}
      <div className="max-w-xl mx-auto my-8 px-4">
        <input
          type="text"
          placeholder="Search cakes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 rounded-full border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {/* PRODUCTS */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-12">
          {filteredProducts.map((cake) => {
            const inWishlist = isInWishlist(cake.id);
            
            return (
              <div
                key={cake.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-56">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Cake";
                    }}
                  />

                  <button
                    onClick={(e) => handleAddToWishlist(cake, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      inWishlist
                        ? "bg-rose-500 text-white"
                        : "bg-white text-gray-600 hover:bg-rose-500 hover:text-white"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={inWishlist ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{cake.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {cake.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-bold text-xl">
                      ₹{cake.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(cake)}
                      className="bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;