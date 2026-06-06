import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, ArrowRight, Star, Clock, Truck, ShieldCheck, MousePointer2, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

import Footer from "../compenent/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishListcontext";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const categories = ["All", "Premium", "Classic", "Fruit", "Chocolate", "Eggless"];

  // 🔹 INTERACTIVE: Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  // 🔹 INTERACTIVE: Scroll Parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroShapeY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroRotateY = useTransform(mouseX, [0, 2000], [-10, 10]);
  const heroRotateX = useTransform(mouseY, [0, 1000], [10, -10]);

  // 🔹 FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("/products");
        setProducts(res.data.products || res.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load cakes");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = Array.isArray(products) ? products.filter((p) => {
    const matchesSearch = (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).slice(0, 8) : [];

  const handleAddToCart = (cake) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(cake);
    toast.success(`${cake.title || cake.name} added!`);
  };

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


  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-rose-500 selection:text-white" onMouseMove={handleMouseMove}>
      
      {/* 🔹 INTERACTIVE: Cursor Spotlight */}
      <motion.div 
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none z-0 lg:block hidden"
        style={{ x: smoothMouseX, y: smoothMouseY, translateX: "-50%", translateY: "-50%" }}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-white relative z-[100]"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* 🔹 HERO SECTION */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
              {/* Floating Shapes */}
              <motion.div style={{ y: heroY }} className="absolute top-[20%] right-[10%] w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-60 animate-float" />
              <motion.div style={{ y: heroShapeY }} className="absolute bottom-[20%] left-[5%] w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-60 animate-float" />

              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <motion.div style={{ opacity: heroOpacity }}>
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-premium border border-gray-100 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] mb-10"
                  >
                    <Sparkles size={14} /> Artisan Bakery Since 1994
                  </motion.div>
                  <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                    Crafting <br /> <span className="text-gradient">Pure Joy.</span>
                  </h1>
                  <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
                      Indulge in a world where every bite is a celebration. Handcrafted masterpieces, baked fresh for your most cherished moments.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button
                      onClick={() => navigate("/products")}
                      className="group relative px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg overflow-hidden shadow-2xl hover:shadow-rose-200 transition-all active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                      <span className="relative z-10 flex items-center gap-3">Start Order <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                    <button
                      onClick={() => navigate("/products")}
                      className="px-10 py-5 bg-white text-gray-900 border border-gray-100 rounded-[2rem] font-black text-lg shadow-premium hover:bg-gray-50 transition-all active:scale-95"
                    >
                      View Menu
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="relative"
                >
                  <div className="relative group perspective-1000">
                    <motion.div 
                      style={{ rotateY: heroRotateY, rotateX: heroRotateX }}
                      className="relative z-10 transition-transform duration-200 ease-out"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80"
                        alt="Hero Cake"
                        className="w-full max-w-lg mx-auto rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-white group-hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                    
                    <motion.div 
                      animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute top-10 -right-4 lg:-right-10 glass-morphism p-5 rounded-[2rem] shadow-2xl z-20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">4.9</div>
                        <div>
                          <div className="flex text-amber-400 gap-0.5"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Trusted Artisan</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                      className="absolute -bottom-10 -left-4 lg:-left-10 bg-white p-6 rounded-[2rem] shadow-2xl z-20 border border-gray-50 flex items-center gap-4"
                    >
                      <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Truck size={24} /></div>
                      <div><p className="text-xl font-black text-gray-900 leading-none">Fast Delivery</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Same day shipping</p></div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">Explore Our <br/> <span className="text-gradient">Collections</span></h2>
                  <p className="text-gray-500 font-bold">Discover the perfect treat for every mood.</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all relative overflow-hidden group ${
                        activeCategory === cat ? "text-white" : "text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {activeCategory === cat && (
                          <motion.div layoutId="cat-bg" className="absolute inset-0 bg-gray-900 rounded-2xl shadow-xl z-0" />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <AnimatePresence mode="wait">
                  {filteredProducts.map((cake, i) => {
                    const inWishlist = isInWishlist(cake.id);
                    return (
                      <motion.div
                        key={cake.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative"
                      >
                        <div className="bg-white rounded-[3rem] p-5 shadow-premium shadow-premium-hover border border-gray-50 transition-all duration-500 group-hover:-translate-y-4">
                          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-rose-50/20">
                            <img
                              src={cake.main_image || cake.image}
                              alt={cake.title || cake.name}
                              onClick={() => navigate(`/product/${cake.id}`)}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-1000"
                            />
                            <button
                              onClick={(e) => handleAddToWishlist(cake, e)}
                              className={`absolute top-4 right-4 p-4 rounded-2xl transition-all z-20 ${
                                inWishlist ? "bg-rose-500 text-white shadow-xl" : "bg-white/90 backdrop-blur-md text-gray-400 hover:text-rose-500"
                              }`}
                            >
                              <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                            </button>
                          </div>

                          <div className="px-2">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-black text-lg text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-1">{cake.title || cake.name}</h3>
                              <span className="font-black text-xl text-rose-500">₹{cake.price}</span>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-6 line-clamp-2">Premium handcrafted selection using the finest ingredients.</p>
                            
                            <button
                              onClick={() => handleAddToCart(cake)}
                              className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                            >
                              <ShoppingCart size={16} /> Add to Bag
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
              <div className="mt-20 text-center">
                  <button onClick={() => navigate("/products")} className="inline-flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-sm uppercase tracking-[0.3em] transition-all group">
                      View Full Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
              </div>
            </section>

            <section className="py-32 px-6">
              <motion.div 
                  whileInView={{ scale: [0.95, 1] }} viewport={{ once: true }}
                  className="max-w-7xl mx-auto rounded-[4rem] bg-gray-900 p-16 lg:p-24 relative overflow-hidden group"
              >
                  <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-rose-500/20 to-transparent pointer-events-none"></div>
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>

                  <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                      <div className="text-white space-y-8">
                          <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tighter">Stay Sweet <br/> <span className="text-rose-500">Stay Updated.</span></h2>
                          <p className="text-gray-400 text-xl font-medium max-w-md leading-relaxed">Join our inner circle for early access to seasonal recipes and exclusive member rewards.</p>
                          <div className="flex gap-4">
                              <input type="email" placeholder="Your Email" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
                              <button className="px-10 py-5 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">Join</button>
                          </div>
                      </div>
                      <div className="hidden lg:block relative">
                          <motion.div 
                              animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center space-y-6"
                          >
                              <div className="w-24 h-24 bg-rose-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-rose-500/40">
                                  <Sparkles size={48} />
                              </div>
                              <h3 className="text-2xl font-black text-white">Join 10k+ Members</h3>
                              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Unlock 15% off your first order</p>
                          </motion.div>
                      </div>
                  </div>
              </motion.div>
            </section>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;