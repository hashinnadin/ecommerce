import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Save, CloudUpload, Sparkles, Box, Info, Image as ImageIcon, CheckCircle, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import AdminNavbar from "./AdminNavbar";

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const [product, setProduct] = useState({
    name: "",
    title: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        const res = await API.get(`/products/${id}`);
        const data = res.data.product || res.data;
        setProduct({
          name: data.name || "",
          title: data.title || "",
          category: data.category || "",
          price: data.price || "",
          stock: data.stock || "",
          description: data.description || "",
        });
        setPreview(data.main_image || data.image);
      } catch {
        toast.error("Failed to load product!");
        navigate("/admin/products");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("title", product.title || product.name);
      formData.append("category", product.category);
      formData.append("price", product.price);
      formData.append("stock", product.stock);
      formData.append("description", product.description);
      if (imageFile) formData.append("image", imageFile);

      await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch {
      toast.error("Error updating product!");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
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
                <Box size={12} /> Edit Studio
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">Refine <span className="text-gradient">Creation</span></h1>
            <p className="text-gray-500 font-bold text-lg">Update the essence and details of your artisan product.</p>
          </div>
          
          <button 
            onClick={() => navigate("/admin/products")}
            className="group px-8 py-4 bg-white border border-gray-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all flex items-center gap-3 shadow-premium active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12 relative z-10">
          {/* LEFT: FORM FIELDS */}
          <div className="lg:col-span-2 space-y-12">
            <motion.section 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                    <Info size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Product DNA</h2>
              </div>
              
              <div className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Display Title</label>
                      <input 
                        name="name" 
                        value={product.name}
                        required 
                        onChange={handleChange} 
                        className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Artisan Category</label>
                      <select 
                        name="category" 
                        value={product.category}
                        required 
                        onChange={handleChange} 
                        className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner appearance-none"
                      >
                        <option value="">Select a category...</option>
                        <option value="Classic">Classic Series</option>
                        <option value="Premium">Premium Collection</option>
                        <option value="Fruit">Fresh Fruit</option>
                        <option value="Seasonal">Seasonal Special</option>
                        <option value="Chocolate">Pure Chocolate</option>
                        <option value="Eggless">Eggless Gourmet</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Price Value (₹)</label>
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                        <input 
                            name="price" 
                            type="number" 
                            value={product.price}
                            required 
                            onChange={handleChange} 
                            className="w-full pl-12 pr-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-black text-gray-900 shadow-inner" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Inventory Stock</label>
                      <input 
                        name="stock" 
                        type="number" 
                        value={product.stock}
                        required 
                        onChange={handleChange} 
                        className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <textarea 
                        name="description" 
                        rows="6" 
                        value={product.description}
                        required 
                        onChange={handleChange} 
                        className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[2.5rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner resize-none leading-relaxed" 
                    />
                  </div>
              </div>
            </motion.section>
          </div>

          {/* RIGHT: MEDIA & SUBMIT */}
          <div className="space-y-12">
            <motion.section 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <ImageIcon size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Visual Identity</h2>
              </div>

              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImage} 
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                />
                <div className={`aspect-square rounded-[3rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center p-8 overflow-hidden ${preview ? 'border-rose-500 bg-rose-50/10' : 'border-gray-100 bg-gray-50/50 group-hover:bg-rose-50/50 group-hover:border-rose-200'}`}>
                  {preview ? (
                    <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} src={preview} className="w-full h-full object-cover rounded-[2.5rem]" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <CloudUpload size={40} />
                      </div>
                      <p className="text-gray-900 font-black text-lg mb-2">Update Photo</p>
                      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest max-w-[150px] mx-auto leading-relaxed">Artisan photos enhance trust. (MAX 2MB)</p>
                    </>
                  )}
                </div>
              </div>
            </motion.section>

            <div className="space-y-6">
                <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden shadow-2xl hover:shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <span className="relative z-10 flex items-center gap-4">
                        <Save size={20} /> Update Masterpiece
                    </span>
                )}
                </button>
                
                <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                    <CheckCircle size={18} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Updates reflect instantly</p>
                </div>
            </div>
          </div>
        </form>

        <section className="mt-20 p-12 bg-white/40 backdrop-blur-md rounded-[4rem] border border-white flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-rose-500/30">
                    <Sparkles size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Refine Your Story</h3>
                    <p className="text-gray-500 font-bold">Small changes in description can significantly impact customer desire.</p>
                </div>
            </div>
            <button className="px-10 py-5 bg-white border border-gray-100 rounded-[2rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all shadow-sm">Review Guidelines</button>
        </section>
      </main>
    </div>
  );
}

export default AdminEditProduct;
