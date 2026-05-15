import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Footer from "../compenent/Footer";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const [localLoading, setLocalLoading] = useState({});

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  const deliveryFee = subtotal >= 999 ? 0 : 99;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    setLocalLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setLocalLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (id, name) => {
    if (window.confirm(`Remove ${name} from cart?`)) {
      setLocalLoading(prev => ({ ...prev, [id]: true }));
      try {
        await removeFromCart(id);
        toast.success("Removed from cart");
      } finally {
        setLocalLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  if (loading && cartItems.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50/20">
      <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-premium">
          <ShoppingBag size={48} className="text-rose-500" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">Delicious cakes are waiting for you! Start adding some sweetness to your cart today.</p>
        <button onClick={() => navigate("/products")} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all">
          Explore Menu
        </button>
      </motion.div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
          <span className="hover:text-rose-500 cursor-pointer" onClick={() => navigate("/")}>Home</span>
          <ChevronRight size={14} />
          <span className="text-rose-500">Cart</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-12">Your Shopping <span className="text-gradient">Cart</span></h1>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* 🔹 ITEMS LIST */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cartItems.map((item, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id}
                  className="bg-white rounded-[2.5rem] p-6 shadow-premium border border-gray-50 flex flex-col sm:flex-row gap-6 relative group"
                >
                  <div className="w-full sm:w-40 h-40 rounded-[1.5rem] overflow-hidden bg-rose-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                        <button onClick={() => handleRemoveItem(item.id, item.name)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <p className="text-rose-500 font-black text-lg">₹{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-500 rounded-xl transition-all"><Minus size={16} /></button>
                        <span className="w-12 text-center font-black text-gray-900">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-500 rounded-xl transition-all"><Plus size={16} /></button>
                      </div>
                      <p className="font-black text-gray-900">Total: ₹{Number(item.price) * item.quantity}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 🔹 SUMMARY */}
          <div className="lg:col-span-1 sticky top-32">
            <div className="bg-gray-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full"></div>
              <h2 className="text-2xl font-black mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-gray-400 font-bold">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "text-emerald-400" : "text-white"}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                {subtotal < 999 && (
                  <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase text-center bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    Add ₹{999 - subtotal} for FREE Delivery
                  </p>
                )}
                <div className="pt-6 border-t border-gray-800">
                  <div className="flex justify-between text-2xl font-black">
                    <span>Total</span>
                    <span className="text-rose-500">₹{total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/payment")}
                className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Checkout <CreditCard size={20} />
              </button>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <Truck size={16} />
                  <span className="text-[8px] font-black uppercase">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <ShieldCheck size={16} />
                  <span className="text-[8px] font-black uppercase">Secure Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;