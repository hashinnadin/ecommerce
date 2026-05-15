import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Heart, ArrowLeft, Star, ShieldCheck, Truck, Clock, Minus, Plus, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

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
  const { scrollY } = useScroll();

  // 🔹 INTERACTIVE: Mouse Tracking for 3D Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [0, 600], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 800], [-10, 10]), springConfig);

  const stickyBarY = useTransform(scrollY, [400, 500], [100, 0]);
  const stickyBarOpacity = useTransform(scrollY, [400, 500], [0, 1]);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${id}`);
      const data = res.data;
      setProduct(data.product || data);
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
    addToCart({ ...product, quantity });
    toast.success("Added to your bag!");
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  if (!product) return null;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-rose-500 selection:text-white" onMouseMove={handleMouseMove}>
      <div className="pt-32 pb-40 max-w-7xl mx-auto px-6">
        {/* 🔹 BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">
            <span className="hover:text-rose-500 cursor-pointer transition-colors" onClick={() => navigate("/")}>Home</span>
            <ChevronRight size={14} className="text-gray-200" />
            <span className="hover:text-rose-500 cursor-pointer transition-colors" onClick={() => navigate("/products")}>Menu</span>
            <ChevronRight size={14} className="text-gray-200" />
            <span className="text-rose-500 truncate max-w-[150px]">{product.title || product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* 🔹 INTERACTIVE VIEWER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative perspective-1000"
          >
            <motion.div 
                style={{ rotateX, rotateY }}
                className="relative aspect-square rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white border border-gray-50 group"
            >
              <img
                src={product.main_image || product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>

            <button
              onClick={() => addToWishlist(product)}
              className={`absolute top-8 right-8 p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl transition-all z-20 ${
                inWishlist ? "bg-rose-500 text-white" : "bg-white/90 text-gray-400 hover:text-rose-500"
              }`}
            >
              <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
            </button>
            
            {/* BADGE: Floating Spec */}
            <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 glass-morphism px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-white/50 z-20"
            >
               <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={24} />
               </div>
               <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authentic Quality</p>
                   <p className="text-gray-900 font-black">Master Baker Choice</p>
               </div>
            </motion.div>
          </motion.div>

          {/* 🔹 DETAILS SECTION */}
          <div className="lg:pt-6">
            <motion.span 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-block px-5 py-2 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
            >
              {product.category || "Signature Series"}
            </motion.span>
            
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-6xl lg:text-7xl font-black text-gray-900 leading-[0.95] tracking-tighter mb-8"
            >
              {product.title || product.name}
            </motion.h1>
            
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex items-center gap-8 mb-12"
            >
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
                  <span className="text-5xl font-black text-gray-900">₹{product.price}</span>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Available
                  </div>
              </div>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-gray-500 text-lg leading-relaxed mb-12 font-medium max-w-xl"
            >
              {product.description || "A masterpiece of artisan baking. We use traditional French techniques and premium organic ingredients to ensure every bite is a moment of pure bliss."}
            </motion.p>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              {[
                { icon: <Clock size={20} />, label: "Freshly Baked", sub: "Daily Morning" },
                { icon: <Truck size={20} />, label: "Express Shipping", sub: "Under 4 hrs" },
                { icon: <ShieldCheck size={20} />, label: "Premium Choice", sub: "Top Rated" },
              ].map((f, i) => (
                <motion.div 
                    whileHover={{ y: -5 }}
                    key={i} 
                    className="flex flex-col p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:border-rose-100 transition-colors"
                >
                  <div className="text-gray-400 group-hover:text-rose-500 transition-colors mb-4">{f.icon}</div>
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{f.label}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{f.sub}</span>
                </motion.div>
              ))}
            </div>

            {/* INTERACTIVE ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-3 rounded-[1.5rem] sm:w-48 shadow-inner">
                <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    className="w-12 h-12 flex items-center justify-center bg-white text-gray-900 rounded-xl shadow-sm hover:text-rose-500 transition-all active:scale-90"
                >
                  <Minus size={20} />
                </button>
                <span className="font-black text-2xl text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                <button 
                    onClick={() => setQuantity(q => q + 1)} 
                    className="w-12 h-12 flex items-center justify-center bg-white text-gray-900 rounded-xl shadow-sm hover:text-rose-500 transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="group relative flex-1 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-xl overflow-hidden shadow-2xl hover:shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center gap-4">
                    <ShoppingCart size={24} />
                    Add to Bag
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 STICKY FLOATING FOOTER BAR */}
      <motion.div 
        style={{ y: stickyBarY, opacity: stickyBarOpacity }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-white/80 backdrop-blur-3xl p-6 rounded-[3rem] border border-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.3)] z-[60] lg:block hidden"
      >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <img src={product.main_image || product.image} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                    <h4 className="font-black text-gray-900 leading-tight">{product.title || product.name}</h4>
                    <p className="text-rose-500 font-black">₹{product.price}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 px-6 py-2 bg-gray-100 rounded-2xl">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-gray-400 hover:text-rose-500"><Minus size={16} /></button>
                    <span className="font-black w-6 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="text-gray-400 hover:text-rose-500"><Plus size={16} /></button>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-rose-500 transition-all shadow-xl"
                >
                    Add to Bag
                </button>
            </div>
        </div>
      </motion.div>

      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-10 leading-none">
                The <span className="text-gradient">Artisan</span> Difference
            </h2>
            <p className="text-gray-500 text-xl font-medium leading-relaxed mb-16">
                Every creation at BakeHub is more than just a treat—it's a story of craft. We source our vanilla from Madagascar, our chocolate from Belgium, and our passion from within. We don't just bake; we create edible memories.
            </p>
            <div className="flex items-center justify-center gap-10">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-gray-900">100%</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Natural</span>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-gray-900">24h</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Freshness</span>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-gray-900">5k+</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Happy Clients</span>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetails;
