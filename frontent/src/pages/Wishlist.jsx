import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash, FaHeart, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { useWishlist } from "../context/WishListcontext"; 
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
    toast.success(`${item.name} moved to cart`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
            <FaHeart className="text-4xl text-rose-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Save your favorite cakes here to buy them later.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold flex items-center gap-2 justify-center hover:shadow-lg transition-shadow"
            >
              <FaShoppingCart /> Browse Cakes
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 justify-center hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft /> Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
            {wishlistItems.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your wishlist?")) {
                    clearWishlist();
                    toast.success("Wishlist cleared");
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-56">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=Cake";
                  }}
                />

                <button
                  onClick={() => {
                    removeFromWishlist(item.id);
                    toast.success("Removed from wishlist");
                  }}
                  className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <FaTrash className="text-red-500" size={14} />
                </button>

                <div className="absolute bottom-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold shadow-md">
                  ₹{item.price}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h3>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={loading}
                    className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <FaShoppingCart size={14} /> Add to Cart
                  </button>

                  <button
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="View details"
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item is" : "items are"} waiting for you!
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Explore More Cakes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;