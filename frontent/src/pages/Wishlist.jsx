import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Trash2, Heart, ChevronRight, Eye, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import { useWishlist } from "../context/WishListcontext"; 
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Footer from "../compenent/Footer";

function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
    toast.success("Moved to cart successfully!");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center max-w-md relative z-10"
        >
          <div className="w-40 h-40 bg-white rounded-[3rem] shadow-premium flex items-center justify-center mx-auto mb-10 border border-rose-50 group">
            <Heart size={64} className="text-rose-500 group-hover:scale-110 transition-transform duration-500" fill="rgba(244, 63, 94, 0.1)" />
          </div>
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Your wishlist is <span className="text-gradient">empty</span></h2>
          <p className="text-gray-500 font-medium mb-12 leading-relaxed text-lg">Save the artisan treats you love and they'll appear here for your next sweet craving.</p>
          <button 
            onClick={() => navigate("/products")} 
            className="group px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
          >
            Explore Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        <div className="mt-20">
            <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
          <div>
            <nav className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-rose-500">Wishlist</span>
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-none">
              The <span className="text-gradient italic">Shortlist</span>
            </h1>
            <p className="mt-4 text-gray-500 font-bold text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-amber-400" />
                {wishlistItems.length} Handpicked Favorites
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm("Clear your entire wishlist?")) clearWishlist(); }}
            className="px-8 py-4 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all shadow-premium"
          >
            Clear All
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                key={item.id}
                className="bg-white rounded-[3rem] p-5 shadow-premium shadow-premium-hover border border-gray-50 group relative"
              >
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-rose-50/30">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-4 right-4 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => removeFromWishlist(item.id)} 
                      className="p-4 bg-white/90 backdrop-blur-md text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="px-2">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-1">{item.name}</h3>
                    <span className="text-2xl font-black text-rose-500">₹{item.price}</span>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => navigate(`/product/${item.id}`)} 
                      className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={18} /> Details
                    </button>
                    <button 
                      onClick={() => handleMoveToCart(item)} 
                      className="w-16 h-16 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl hover:-rotate-6"
                    >
                      <ShoppingCart size={22} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Helper icons that were missing in import
const ArrowRight = ({ size, className }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
);

export default Wishlist;