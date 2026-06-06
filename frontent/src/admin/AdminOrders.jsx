import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  CheckCircle, XCircle, ShoppingBag, Calendar, User, Clock, ArrowRight, Package, Truck, Filter, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import AdminNavbar from "./AdminNavbar";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/orders");
      const data = Array.isArray(res.data) ? res.data : (res.data.orders || []);
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch {
      toast.error("Failed to load orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.toString().slice(-4)} status: ${newStatus}`);
      loadOrders();
    } catch {
      toast.error("Failed to update status!");
    }
  };

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("succ") || s.includes("deliv") || s.includes("paid")) return "emerald";
    if (s.includes("ship")) return "blue";
    if (s.includes("pend") || s.includes("proc")) return "amber";
    if (s.includes("can")) return "rose";
    return "gray";
  };

  const filtered = orders.filter(o => 
    o.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                <Truck size={12} /> Fulfillment Dashboard
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">Order <span className="text-gradient">Manager</span></h1>
            <p className="text-gray-500 font-bold text-lg">Oversee and accelerate your artisan delivery workflow.</p>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
            <div className="relative flex-1 md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    placeholder="Search by ID or Customer..." 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all shadow-premium text-sm font-bold" 
                />
            </div>
            <button className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 shadow-premium hover:text-rose-500 transition-all"><Filter size={22} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-gray-100">
                <ShoppingBag className="text-gray-200 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Active Orders</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Everything is up to date</p>
              </div>
            ) : (
              filtered.map((order, i) => {
                const color = getStatusColor(order.status);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    key={order.id}
                    className="bg-white rounded-[3.5rem] p-10 shadow-premium hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.08)] border border-gray-50 group transition-all duration-500 flex flex-col gap-10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-[1.5rem] flex items-center justify-center border border-gray-50 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all duration-500 shadow-sm">
                          <Package size={28} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ref ID</p>
                          <h3 className="font-black text-gray-900 text-xl tracking-tight">#{order.id.toString().slice(-8).toUpperCase()}</h3>
                        </div>
                      </div>
                      <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-gray-50 text-gray-600 border-gray-100"
                      }`}>
                        {order.status || "processing"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                        <p className="text-gray-900 font-black flex items-center gap-2 tracking-tight text-sm"><User size={14} className="text-rose-500" /> {order.user?.name || `User ${order.user_id}`}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</p>
                        <p className="text-gray-900 font-black flex items-center gap-2 tracking-tight text-sm"><Calendar size={14} className="text-blue-500" /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bill</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.total_amount || order.total}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100">
                      <button
                        onClick={() => updateStatus(order.id, "processing")}
                        className="flex-1 px-6 py-4 bg-gray-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                      >
                        <Clock size={16} /> Process
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "success")}
                        className="flex-1 px-6 py-4 bg-gray-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <CheckCircle size={16} /> Deliver
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "canceled")}
                        className="flex-1 px-6 py-4 bg-gray-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                      <button 
                         onClick={() => navigate(`/admin/orders/${order.id}`)}
                         className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg"
                      >
                         <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
