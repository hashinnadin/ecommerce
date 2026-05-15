import React, { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Truck, ShoppingBag, ArrowRight, ChevronRight, Calendar, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import Footer from "../compenent/Footer";

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const res = await API.get("/user/orders");
        const userOrders = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrders(userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const getStatusInfo = (status) => {
    const s = (status || "processing").toLowerCase();
    if (s.includes("deliv") || s.includes("succ")) return { label: "Delivered", color: "emerald", icon: CheckCircle, progress: 100 };
    if (s.includes("ship")) return { label: "Shipped", color: "blue", icon: Truck, progress: 70 };
    if (s.includes("can")) return { label: "Cancelled", color: "rose", icon: Package, progress: 0 };
    return { label: "Processing", color: "amber", icon: Clock, progress: 30 };
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  if (!user || orders.length === 0) return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-20 rounded-full"></div>
            <div className="w-40 h-40 bg-white rounded-[3rem] shadow-premium flex items-center justify-center mb-10 relative z-10 border border-gray-50">
                <ShoppingBag size={64} className="text-rose-500" />
            </div>
        </motion.div>
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
            {user ? "Your History is Empty" : "Welcome Back"}
        </h2>
        <p className="text-gray-500 font-bold max-w-sm mb-12">
            {user ? "It seems you haven't placed any orders yet. Let's find something delicious!" : "Sign in to view your artisan order history and track your deliveries."}
        </p>
        <button 
            onClick={() => navigate(user ? "/products" : "/login")} 
            className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
        >
            {user ? "Browse Menu" : "Sign In Now"} <ArrowRight size={20} />
        </button>
        <div className="mt-40 w-full"><Footer /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* 🔹 INTERACTIVE HEADER */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-white border-b border-gray-50">
        <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">
            <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-200" />
            <span className="text-rose-500">Order History</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                    Track Your <span className="text-gradient">Treats</span>
                </h1>
                <p className="text-gray-500 font-bold text-lg max-w-xl">
                    Every order is a story of craft and passion. Track your active deliveries or revisit your favorites.
                </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[2rem] border border-gray-100 shadow-sm w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all border-none shadow-sm"
                    />
                </div>
                <button className="p-3 bg-white rounded-[1.5rem] text-gray-400 hover:text-rose-500 transition-colors shadow-sm"><Filter size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-20 pb-40">
        <div className="space-y-12">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, i) => {
              const status = getStatusInfo(order.status);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  className="bg-white rounded-[3.5rem] overflow-hidden shadow-premium hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.1)] border border-gray-50 group transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row items-stretch">
                    {/* LEFT SECTION: Info */}
                    <div className="p-10 lg:w-[40%] bg-gray-50/50 border-r border-gray-50">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-rose-500 group-hover:scale-110 transition-transform duration-500">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref</p>
                                    <p className="font-black text-gray-900 text-lg">#{order.id.toString().slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="p-4 bg-white rounded-2xl text-gray-400 hover:text-rose-500 hover:shadow-lg transition-all"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date Placed</span>
                                <span className="font-black text-gray-900">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Items Count</span>
                                <span className="font-black text-gray-900">{order.items?.length || 0} Products</span>
                            </div>
                            <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="text-4xl font-black text-gray-900 leading-none">₹{order.total_amount || order.totalAmount}</p>
                                </div>
                                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 bg-${status.color}-50 text-${status.color}-500 shadow-sm border border-${status.color}-100`}>
                                    <StatusIcon size={14} /> {status.label}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SECTION: Visuals & Progress */}
                    <div className="p-10 flex-1 flex flex-col justify-between">
                        <div className="mb-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Delivery Progress</p>
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${status.progress}%` }}
                                    transition={{ duration: 1, delay: i * 0.2 }}
                                    className={`absolute top-0 left-0 h-full bg-${status.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.1)]`}
                                />
                            </div>
                            <div className="flex justify-between mt-4">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Confirmed</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${status.progress >= 70 ? "text-blue-500" : "text-gray-300"}`}>Shipped</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${status.progress === 100 ? "text-emerald-500" : "text-gray-300"}`}>Arrived</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Order Preview</p>
                            <div className="flex items-center gap-4 flex-wrap">
                                {order.items?.map((item, idx) => (
                                    <motion.div 
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        key={idx} 
                                        className="w-20 h-20 rounded-[1.5rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-sm cursor-pointer relative group/item"
                                        onClick={() => navigate(`/product/${item.product_id}`)}
                                    >
                                        <img src={item.main_image || item.image} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px]">
                                            QTY: {item.quantity}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Orders;