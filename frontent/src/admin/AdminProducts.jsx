import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus, Edit3, Trash2, Search, Box, Filter, MoreVertical, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import AdminNavbar from "./AdminNavbar";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      const data = res.data.products || res.data || [];
      setProducts(data);
    } catch {
      toast.error("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Confirm deletion of this masterpiece?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      toast.success("Product removed from collection");
      loadProducts();
    } catch {
      toast.error("Error deleting product!");
    }
  };

  const filtered = products.filter(
    (p) =>
      (p?.title || p?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p?.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      <AdminNavbar />

      {/* dY"1 MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 mt-16 lg:mt-0 relative">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16 relative z-10">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                <Box size={12} /> Inventory Management
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">Product <span className="text-gradient">Catalog</span></h1>
            <p className="text-gray-500 font-bold text-lg">Curate and refine your bakery's exquisite offerings.</p>
          </div>
          
          <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
            <div className="relative flex-1 md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    placeholder="Search by title or category..." 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all shadow-premium text-sm font-bold" 
                />
            </div>
            <div className="flex gap-4">
                <div className="flex bg-white/70 backdrop-blur-xl p-2 rounded-2xl border border-white shadow-premium">
                    <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"}`}><List size={18} /></button>
                </div>
                <button 
                onClick={() => navigate("/admin/products/add")}
                className="group relative px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm overflow-hidden shadow-2xl hover:shadow-rose-100 transition-all flex items-center gap-3 shrink-0"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center gap-3"><Plus size={18} /> Add Product</span>
                </button>
            </div>
          </div>
        </header>

        {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 relative z-10">
                <AnimatePresence mode="popLayout">
                    {filtered.map((p, i) => (
                        <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        key={p.id}
                        className="bg-white rounded-[3.5rem] p-5 shadow-premium hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.1)] border border-gray-50 group transition-all duration-500"
                        >
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 bg-rose-50/20">
                                <img 
                                src={p.main_image || p.image} 
                                alt={p.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                                        className="w-12 h-12 bg-white rounded-2xl text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => deleteProduct(p.id)}
                                        className="w-12 h-12 bg-white rounded-2xl text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-white/50">
                                    {p.category}
                                </span>
                                </div>
                            </div>
                            <div className="px-2">
                                <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-1 text-lg tracking-tight">{p.title || p.name}</h3>
                                <span className="font-black text-emerald-600 text-lg">₹{p.price}</span>
                                </div>
                                <p className="text-gray-400 text-xs font-bold leading-relaxed line-clamp-2">
                                {p.description || "Indulge in this handcrafted artisan masterpiece, made with love."}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        ) : (
            <div className="bg-white/70 backdrop-blur-xl rounded-[4rem] shadow-premium border border-white overflow-hidden relative z-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
                            <th className="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                            <th className="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <AnimatePresence>
                            {filtered.map((p, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    key={p.id} className="group hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <img src={p.main_image || p.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                                            <div>
                                                <p className="font-black text-gray-900">{p.title || p.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{p.id.toString().slice(-4)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6">
                                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                                    </td>
                                    <td className="px-6">
                                        <p className="font-black text-emerald-600 text-lg">₹{p.price}</p>
                                    </td>
                                    <td className="px-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></div>
                                            <p className="font-bold text-gray-700">{p.stock || 0} Units</p>
                                        </div>
                                    </td>
                                    <td className="px-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                                                className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => deleteProduct(p.id)}
                                                className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        )}

        {filtered.length === 0 && !loading && (
            <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-gray-100 relative z-10">
                <Box className="text-gray-200 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Try adjusting your filters or search terms</p>
            </div>
        )}
      </main>
    </div>
  );
}

export default AdminProducts;
