import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Box, Truck, CheckCircle, Clock, MapPin, CreditCard, ChevronRight, Package, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Footer from "../compenent/Footer";

function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const res = await API.get(`/user/orders/${id}`);
        setOrder(res.data);
      } catch {
        toast.error("Failed to load details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  const getStatusInfo = (status) => {
    const s = (status || "processing").toLowerCase();
    if (s.includes("deliv") || s.includes("succ")) return { label: "Delivered", color: "text-emerald-500 bg-emerald-50", icon: <CheckCircle size={20} /> };
    if (s.includes("ship")) return { label: "Shipped", color: "text-blue-500 bg-blue-50", icon: <Truck size={20} /> };
    if (s.includes("can")) return { label: "Cancelled", color: "text-rose-500 bg-rose-50", icon: <Box size={20} /> };
    return { label: "Processing", color: "text-amber-500 bg-amber-50", icon: <Clock size={20} /> };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50/20">
      <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return null;
  const status = getStatusInfo(order.status);
  const orderId = order.id || order.orderId;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-all mb-10 font-bold group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
        </button>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* 🔹 MAIN DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-premium border border-gray-50 overflow-hidden">
              <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 block">Order Reference</span>
                    <h1 className="text-4xl font-black">#{orderId.toString().slice(-8).toUpperCase()}</h1>
                  </div>
                  <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                </div>
                <div className="flex flex-wrap gap-10">
                  <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Date Placed</p><p className="font-bold flex items-center gap-2 text-sm"><Calendar size={14} /> {new Date(order.created_at).toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Payment Method</p><p className="font-bold flex items-center gap-2 text-sm"><CreditCard size={14} /> {order.payment_method || "Secured Pay"}</p></div>
                </div>
              </div>

              <div className="p-10">
                <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><Package className="text-rose-500" size={24} /> Items Ordered</h2>
                <div className="space-y-8">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-6 items-center group">
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-rose-50 shrink-0">
                        <img src={item.main_image || item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-lg mb-1">{item.title || item.name}</h3>
                        <p className="text-sm font-bold text-gray-400">Quantity: <span className="text-gray-900">{item.quantity}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">₹{item.price * item.quantity}</p>
                        <p className="text-[10px] font-black text-gray-400">₹{item.price} / unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 🔹 SIDEBAR INFO */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-gray-50">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3"><MapPin className="text-rose-500" size={20} /> Shipping To</h3>
              {order.address && (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400"><User size={18} /></div>
                      <p className="font-black text-gray-900">{order.address.fullName}</p>
                   </div>
                   <p className="text-sm text-gray-500 font-bold leading-relaxed px-2">
                     {order.address.house}, {order.address.street}<br/>
                     {order.address.city} - {order.address.pincode}<br/>
                     {order.address.state}
                   </p>
                   <div className="pt-4 border-t border-gray-50 px-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                     <p className="font-black text-gray-900">{order.address.mobile}</p>
                   </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-lg font-black mb-6">Payment Details</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400 font-bold text-sm"><span>Subtotal</span><span className="text-white">₹{order.total_amount || order.totalAmount}</span></div>
                <div className="flex justify-between text-gray-400 font-bold text-sm"><span>Delivery</span><span className="text-emerald-400">FREE</span></div>
                <div className="pt-6 border-t border-gray-800 flex justify-between items-end">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Paid</span>
                  <span className="text-3xl font-black text-rose-500 leading-none">₹{order.total_amount || order.totalAmount}</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
                 <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment successfully processed via secured artisan portal.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderDetails;