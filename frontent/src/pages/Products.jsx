import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Heart, Search, Filter, ArrowUpDown, ChevronRight, LayoutGrid, List, Sparkles } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import Footer from "../compenent/Footer";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishListcontext";

function Products() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";
    setSearchTerm(searchQuery);
    fetchProducts();
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      const data = res.data.products || res.data || [];
      console.log("Products Page data:", data);
      setProducts(data);
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      filterAndSortProducts();
    }
  }, [products, searchTerm, sortBy, selectedCategory]);

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          (p.title || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case "price-low": filtered.sort((a, b) => a.price - b.price); break;
      case "price-high": filtered.sort((a, b) => b.price - a.price); break;
      case "name": filtered.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || "")); break;
      default: filtered.sort((a, b) => a.id - b.id); break;
    }
    setFilteredProducts(filtered);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* 🔹 INTERACTIVE HEADER */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[50%] bg-rose-50 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">
            <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-200" />
            <span className="text-rose-500">Artisan Menu</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                    Our <span className="text-gradient italic">Collection</span>
                </h1>
                <p className="text-gray-500 font-bold text-lg max-w-xl leading-relaxed">
                    Explore a curated world of artisan treats. Each creation is a masterpiece, crafted with passion and premium ingredients.
                </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button className="px-6 py-3 bg-white shadow-premium rounded-xl font-black text-xs uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <LayoutGrid size={16} /> Grid
                </button>
                <button className="px-6 py-3 text-gray-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:text-gray-600 transition-colors">
                    <List size={16} /> List
                </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-32">
        {/* 🔹 INTERACTIVE TOOLBAR */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16 items-center justify-between sticky top-24 z-40 p-4 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by flavor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] border border-gray-50 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all font-bold"
              />
            </div>
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`p-5 rounded-[1.5rem] border transition-all ${isFilterOpen ? "bg-gray-900 text-white shadow-xl" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"}`}
            >
              <Filter size={22} />
            </button>
          </div>

          <div className="flex items-center gap-6 w-full lg:w-auto px-4">
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <ArrowUpDown size={14} /> Sort By
            </div>
            <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="flex-1 lg:flex-none bg-white border border-gray-100 rounded-[1.5rem] px-8 py-5 font-black text-sm text-gray-900 focus:outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
            >
              <option value="default">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* 🔹 INTERACTIVE SIDEBAR */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.aside 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }} 
                className="w-full lg:w-80 shrink-0 space-y-8"
              >
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-premium lg:sticky lg:top-52">
                  <h3 className="font-black text-gray-900 mb-8 flex items-center gap-3 text-lg">
                    <div className="w-2 h-8 bg-rose-500 rounded-full"></div> 
                    Collections
                  </h3>
                  <div className="space-y-3">
                    <button 
                        onClick={() => setSelectedCategory("all")} 
                        className={`group w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all relative overflow-hidden ${selectedCategory === "all" ? "text-white shadow-lg" : "text-gray-400 hover:text-gray-900 hover:bg-rose-50/50"}`}
                    >
                      {selectedCategory === "all" && <motion.div layoutId="cat-pill" className="absolute inset-0 bg-gray-900 z-0" />}
                      <span className="relative z-10 flex items-center justify-between">
                        All Cakes <Sparkles size={14} className={selectedCategory === "all" ? "opacity-100" : "opacity-0"} />
                      </span>
                    </button>
                    {categories.map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`group w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all relative overflow-hidden ${selectedCategory === cat ? "text-white shadow-lg" : "text-gray-400 hover:text-gray-900 hover:bg-rose-50/50"}`}
                      >
                        {selectedCategory === cat && <motion.div layoutId="cat-pill" className="absolute inset-0 bg-gray-900 z-0" />}
                        <span className="relative z-10">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0 w-full">
            <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                {filteredProducts.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-rose-500">
                            <Search size={32} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mb-2">No cakes found</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Try adjusting your filters or search term.</p>
                    </motion.div>
                ) : (
                    filteredProducts.map((cake, i) => {
                    const inWishlist = isInWishlist(cake.id);
                    return (
                        <motion.div 
                            layout 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }} 
                            key={cake.id} 
                            className="bg-white rounded-[3rem] p-5 shadow-premium hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.1)] border border-gray-50 group transition-all duration-500"
                        >
                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-rose-50/20">
                            <img 
                                src={cake.main_image || cake.image} 
                                alt={cake.title} 
                                onClick={() => navigate(`/product/${cake.id}`)} 
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-1000" 
                            />
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToWishlist(cake); }} 
                                className={`absolute top-5 right-5 p-4 rounded-2xl transition-all shadow-xl z-20 ${inWishlist ? "bg-rose-500 text-white" : "bg-white/90 backdrop-blur-md text-gray-400 hover:text-rose-500"}`}
                            >
                                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                            </button>
                            <div className="absolute bottom-5 left-5">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-white/50">
                                    {cake.category}
                                </span>
                            </div>
                        </div>
                        <div className="px-2">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-black text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-1 tracking-tight">{cake.title || cake.name}</h3>
                                <span className="text-2xl font-black text-rose-500">₹{cake.price}</span>
                            </div>
                            <p className="text-gray-400 text-xs font-bold mb-8 line-clamp-2 leading-relaxed">Indulge in our signature handcrafted selection using the finest organic ingredients.</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigate(`/product/${cake.id}`)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    Details
                                </button>
                                <button 
                                    onClick={() => { if (!user) { toast.error("Please login first"); navigate("/login"); } else { addToCart(cake); toast.success("Added to Bag!"); } }} 
                                    className="w-16 h-16 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl active:scale-90"
                                >
                                    <ShoppingCart size={22} />
                                </button>
                            </div>
                        </div>
                        </motion.div>
                    );
                    })
                )}
                </AnimatePresence>
                </motion.div>
            </LayoutGroup>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Products;