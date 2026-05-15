import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import API from "../api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid session");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 5) {
      toast.error("Please enter the full code");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/reset-password", { 
        email, 
        otp: otpCode, 
        new_password: newPassword 
      });
      toast.success("Security vault updated. Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col lg:flex-row selection:bg-rose-500 selection:text-white">
      {/* 🔹 LEFT SIDE: Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/80 to-transparent"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
            <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-rose-500/20">
                <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">New <br/><span className="text-rose-500">Security.</span></h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">Secure your artisan account with a robust password. Mix in some sugar, spice, and everything nice.</p>
          </motion.div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 🔹 RIGHT SIDE: Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 bg-white relative">
        <div className="w-full max-w-md relative z-10">
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate("/forgot-password")} 
            className="mb-16 flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-[0.3em] transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Step Back
          </motion.button>

          <div className="mb-12">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-10 border border-emerald-100 shadow-sm"
            >
              <ShieldCheck className="text-emerald-500" size={32} />
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Access <span className="text-gradient">Reset.</span></h1>
            <p className="text-gray-500 font-bold text-lg">Enter the security code sent to <span className="text-gray-900 font-black">{email}</span></p>
          </div>

          <form onSubmit={handleReset} className="space-y-12">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Verification Code</label>
               <div className="flex justify-between gap-4">
                {otp.map((data, index) => (
                  <motion.input
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    key={index} type="text" maxLength="1" value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={e => e.target.select()}
                    className="w-full aspect-square text-3xl font-black text-center bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-16 pr-16 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="group relative w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-lg overflow-hidden shadow-2xl hover:shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center gap-4">
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>Finalize Reset <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
                    )}
                </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
