import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CreditCard, CheckCircle2, Truck, ShieldCheck, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../api";
import Footer from "../compenent/Footer";

function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const [address, setAddress] = useState({
    fullName: "", mobile: "", house: "", street: "", city: "", pincode: "", state: "",
  });

  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (cartItems.length === 0 && !orderSuccess) { navigate("/"); return; }

    (async () => {
      try {
        const res = await API.get("/user/profile");
        if (res.data.address) setAddress(res.data.address);
      } catch {
        // profile load is optional
      }
    })();
  }, [user, cartItems, navigate, orderSuccess]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 999 ? 0 : 99;
  const total = subtotal + deliveryFee;

  const handleAddressInput = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    if (addressErrors[name]) setAddressErrors({ ...addressErrors, [name]: null });
  };

  const validateAddress = () => {
    let err = {};
    if (!address.fullName.trim()) err.fullName = "Required";
    if (!address.mobile || address.mobile.length < 10) err.mobile = "Invalid mobile";
    if (!address.house.trim()) err.house = "Required";
    if (!address.city.trim()) err.city = "Required";
    if (!address.state.trim()) err.state = "Required";
    if (!address.pincode || address.pincode.length < 6) err.pincode = "Invalid pincode";
    setAddressErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNextStep = () => {
    if (validateAddress()) setStep(2);
    else toast.error("Please check address details");
  };

  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      currency: "INR",
      name: "Artisan Bakery",
      description: "Order Payment",
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        try {
          await API.post("/user/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            my_order_id: orderData.id,
          });

          await clearCart();
          setOrderSuccess(true);
          setTimeout(() => navigate("/orders"), 3000);
        } catch {
          toast.error("Payment verification failed!");
          setLoading(false);
        }
      },
      prefill: {
        name: address.fullName,
        email: user?.email,
        contact: address.mobile,
      },
      theme: { color: "#f43f5e" },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    });
    rzp.open();
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/user/orders", { paymentMethod, address });
      const orderData = res.data;

      if (paymentMethod === "COD") {
        await clearCart();
        setOrderSuccess(true);
        setTimeout(() => navigate("/orders"), 3000);
        return;
      }

      if (!orderData.razorpay_order_id) {
        toast.error("Could not initiate payment. Please try again.");
        setLoading(false);
        return;
      }

      openRazorpayCheckout(orderData);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create order");
      setLoading(false);
    }
  };

  if (orderSuccess) return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg border border-gray-50">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Order Placed!</h1>
        <p className="text-gray-500 font-medium mb-10">Your artisan treats are being prepared. Redirecting to your orders...</p>
        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.8, ease: "linear" }} className="h-full bg-emerald-500" />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
          <span className="hover:text-rose-500 cursor-pointer" onClick={() => navigate("/cart")}>Cart</span>
          <ChevronRight size={14} />
          <span className="text-rose-500">Checkout</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-12">Secure <span className="text-gradient">Checkout</span></h1>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className={`bg-white rounded-[2.5rem] p-8 shadow-premium border transition-all ${step === 1 ? "border-rose-500 ring-4 ring-rose-50" : "border-gray-50 opacity-60"}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${step === 1 ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
                <h2 className="text-2xl font-black text-gray-900">Shipping Address</h2>
              </div>

              {step === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input name="fullName" value={address.fullName} onChange={handleAddressInput} placeholder="Your Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                    <input name="mobile" value={address.mobile} onChange={handleAddressInput} placeholder="10-digit number" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">House / Flat No.</label>
                    <input name="house" value={address.house} onChange={handleAddressInput} placeholder="Apt 101, Floor 2" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                    <input name="street" value={address.street} onChange={handleAddressInput} placeholder="Building, Street Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                    <input name="city" value={address.city} onChange={handleAddressInput} placeholder="City Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                    <input name="state" value={address.state} onChange={handleAddressInput} placeholder="State" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                    <input name="pincode" value={address.pincode} onChange={handleAddressInput} placeholder="6-digit code" className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleNextStep} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all">Continue to Payment</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 font-bold">{address.fullName}, {address.city} - {address.pincode}</p>
                  <button onClick={() => setStep(1)} className="text-rose-500 font-black text-sm underline">Edit</button>
                </div>
              )}
            </div>

            <div className={`bg-white rounded-[2.5rem] p-8 shadow-premium border transition-all ${step === 2 ? "border-rose-500 ring-4 ring-rose-50" : "border-gray-50 opacity-60"}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${step === 2 ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
                <h2 className="text-2xl font-black text-gray-900">Payment Method</h2>
              </div>

              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setPaymentMethod("online")} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === "online" ? "border-rose-500 bg-rose-50/50" : "border-gray-100 hover:border-rose-100"}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "online" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}><CreditCard /></div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Pay Online</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("COD")} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === "COD" ? "border-rose-500 bg-rose-50/50" : "border-gray-100 hover:border-rose-100"}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "COD" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}><Truck /></div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Cash on Delivery</span>
                    </button>
                  </div>

                  {paymentMethod === "online" ? (
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex gap-4 items-start">
                      <ShieldCheck className="text-rose-500 shrink-0" size={24} />
                      <div>
                        <p className="font-black text-gray-900 mb-1">Secure payment via Razorpay</p>
                        <p className="text-sm text-gray-500 font-medium">Pay with UPI, card, net banking, or wallet. You&apos;ll be redirected to Razorpay&apos;s secure checkout.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <p className="text-sm text-gray-500 font-medium">Pay ₹{total} in cash when your order is delivered.</p>
                    </div>
                  )}

                  <button onClick={handlePayment} disabled={loading} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-rose-600 hover:-translate-y-1 transition-all disabled:opacity-50">
                    {loading ? "Processing..." : paymentMethod === "COD" ? "Place Order" : "Pay Securely"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 sticky top-32">
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Your Order</h2>
              <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0"><img src={item.image} alt="" className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0"><p className="font-black text-gray-900 text-sm line-clamp-1">{item.name}</p><p className="text-xs text-gray-400 font-bold">Qty: {item.quantity}</p></div>
                    <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 border-t border-gray-50 pt-8">
                <div className="flex justify-between text-gray-400 font-bold"><span>Subtotal</span><span className="text-gray-900">₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-400 font-bold"><span>Delivery</span><span className={deliveryFee === 0 ? "text-emerald-500" : "text-gray-900"}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end"><p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total</p><p className="text-4xl font-black text-rose-500 leading-none">₹{total}</p></div>
              </div>
              <div className="mt-10 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 flex gap-4 text-rose-500"><Info size={20} className="shrink-0" /><p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">All our artisan treats are baked fresh to order and safely packaged for premium delivery.</p></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Payment;
