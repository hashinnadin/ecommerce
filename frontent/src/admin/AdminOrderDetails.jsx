import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  ArrowLeft, Package, User, Calendar, CreditCard, MapPin, 
  Clock, CheckCircle, XCircle, Truck, ChevronRight, Info,
  ShoppingBag, Mail, Phone, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import AdminNavbar from "./AdminNavbar";

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      toast.error("Failed to load order details");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await API.put(`/admin/orders/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadOrder();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full"></motion.div>
    </div>
  );

  if (!order) return null;
  const color = getStatusColor(order.status);
  const currentStatus = (order.status || "").toLowerCase();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      <AdminNavbar />

      <main className="flex-1 lg:ml-72 p-6 md:p-12 mt-16 lg:mt-0 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-50/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16 relative z-10">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
               <Link to="/admin/orders" className="hover:text-rose-500 transition-colors">Order Manager</Link>
               <ChevronRight size={12} /> Detailed Analysis
            </nav>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">Order <span className="text-gradient">Review</span></h1>
            <p className="text-gray-500 font-bold text-lg">Detailed breakdown and fulfillment controls for order #{id.toString().slice(-6).toUpperCase()}.</p>
          </div>
          
          <button 
            onClick={() => navigate("/admin/orders")}
            className="group px-8 py-4 bg-white border border-gray-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all flex items-center gap-3 shadow-premium active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to List
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 relative z-10">
          {/* 🔹 LEFT: ITEMS & LOGISTICS */}
          <div className="lg:col-span-2 space-y-12">
            {/* ITEM CARD */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white"
            >
              <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ordered Masterpieces</h2>
                  </div>
                  <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm animate-pulse ${
                    color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" :
                    color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" :
                    color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-gray-50 text-gray-600 border-gray-100"
                  }`}>
                    {order.status || "processing"}
                  </div>
              </div>

              <div className="space-y-8">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-8 items-center group p-6 rounded-[2.5rem] hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-50">
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-rose-50 shrink-0 shadow-sm">
                      <img src={item.product?.main_image || item.product?.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SKU: #{item.product?.id.toString().slice(-6)}</p>
                      <h3 className="font-black text-gray-900 text-xl mb-2">{item.product?.title || "Artisan Cake"}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                        <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">{item.product?.category}</span>
                        <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 leading-none mb-1">₹{item.price * item.quantity}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">₹{item.price} / unit</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-8">
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Weight</p>
                      <p className="font-black text-gray-900">~{order.items?.length * 1.5} kg</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Package Type</p>
                      <p className="font-black text-gray-900 text-xs uppercase">Premium Insulated</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Time</p>
                      <p className="font-black text-gray-900 text-xs uppercase">Express Artisan</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fragile</p>
                      <p className="font-black text-rose-500 text-xs uppercase tracking-widest flex items-center gap-1">High <Info size={12} /></p>
                  </div>
              </div>
            </motion.section>

            {/* STATUS CONTROLS */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Fulfillment Controls</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  disabled={updating || currentStatus === "processing"}
                  onClick={() => updateStatus("processing")}
                  className={`group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${currentStatus === "processing" ? "border-amber-500 bg-amber-50/50" : "border-gray-100 hover:border-amber-200"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentStatus === "processing" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400"}`}><Clock /></div>
                  <span className="font-black text-xs uppercase tracking-widest">Mark Processing</span>
                </button>
                <button
                  disabled={updating || currentStatus === "shipped"}
                  onClick={() => updateStatus("shipped")}
                  className={`group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${currentStatus === "shipped" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-blue-200"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentStatus === "shipped" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}><Truck /></div>
                  <span className="font-black text-xs uppercase tracking-widest">Mark Shipped</span>
                </button>
                <button
                  disabled={updating || currentStatus === "success" || currentStatus === "delivered"}
                  onClick={() => updateStatus("success")}
                  className={`group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${(currentStatus === "success" || currentStatus === "delivered") ? "border-emerald-500 bg-emerald-50/50" : "border-gray-100 hover:border-emerald-200"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${(currentStatus === "success" || currentStatus === "delivered") ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}><CheckCircle /></div>
                  <span className="font-black text-xs uppercase tracking-widest">Mark Delivered</span>
                </button>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  disabled={updating || currentStatus === "canceled" || currentStatus === "cancelled"}
                  onClick={() => updateStatus("canceled")}
                  className="flex items-center gap-2 text-[10px] font-black text-rose-300 hover:text-rose-500 transition-all uppercase tracking-widest px-4 py-2"
                >
                  <XCircle size={14} /> Terminate Order
                </button>
              </div>
            </motion.section>
          </div>

          {/* 🔹 RIGHT: CUSTOMER & FINANCIALS */}
          <div className="space-y-12">
            {/* CUSTOMER CARD */}
            <motion.section 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Profile</h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm">
                        <User size={32} />
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">{order.user?.name || "Artisan Client"}</p>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Verified Member</p>
                    </div>
                </div>
                
                <div className="space-y-8 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-50 shadow-sm"><Mail size={18} /></div>
                        <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p><p className="font-bold text-gray-900 text-sm">{order.user?.email}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-50 shadow-sm"><Phone size={18} /></div>
                        <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</p><p className="font-bold text-gray-900 text-sm">{order.address?.mobile || "N/A"}</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-50 shadow-sm mt-1"><MapPin size={18} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Destination</p>
                            <p className="font-bold text-gray-900 text-sm leading-relaxed mt-1">
                                {order.address?.house}, {order.address?.street}<br/>
                                {order.address?.city} - {order.address?.pincode}<br/>
                                {order.address?.state}
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            </motion.section>

            {/* FINANCIAL SUMMARY */}
            <motion.section 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-gray-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Financials</h2>
              </div>

              <div className="space-y-6 mb-10 relative z-10">
                  <div className="flex justify-between text-gray-400 font-bold text-sm"><span>Order Subtotal</span><span className="text-white">₹{order.total_amount || order.totalAmount}</span></div>
                  <div className="flex justify-between text-gray-400 font-bold text-sm"><span>Processing Fee</span><span className="text-emerald-400">WAIVED</span></div>
                  <div className="flex justify-between text-gray-400 font-bold text-sm"><span>Tax (GSTR)</span><span className="text-white">₹0.00</span></div>
                  <div className="pt-8 border-t border-white/10">
                      <div className="flex justify-between items-end">
                          <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Net Revenue</p>
                              <p className="text-5xl font-black text-rose-500 tracking-tighter leading-none">₹{order.total_amount || order.totalAmount}</p>
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1"><CheckCircle size={10} /> Paid</span>
                              <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">via {order.payment_method || "Online"}</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 flex gap-4 text-gray-400 items-start">
                  <Info size={20} className="shrink-0 text-rose-500" />
                  <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">This order is protected by our artisan guarantee. All transactions are final and audited daily.</p>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminOrderDetails;
