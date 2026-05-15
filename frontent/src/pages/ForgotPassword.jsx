import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ChevronLeft, KeyRound, Sparkles } from "lucide-react";
import API from "../api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Security code dispatched to your inbox.");
      navigate(`/reset-password?email=${email}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initiate recovery");
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
            <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">Recover <br/><span className="text-rose-500">Access.</span></h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">Even the master bakers lose their keys sometimes. We'll help you secure your vault and get back to your sweets.</p>
          </motion.div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 🔹 RIGHT SIDE: Recovery Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 bg-white relative">
        <div className="w-full max-w-md relative z-10">
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate("/login")} 
            className="mb-16 flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-[0.3em] transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Entrance
          </motion.button>

          <div className="mb-12">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-10 border border-gray-100 shadow-sm"
            >
              <KeyRound className="text-gray-900" size={32} />
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Security <span className="text-gradient">Portal.</span></h1>
            <p className="text-gray-500 font-bold text-lg">Enter your registered email to receive a recovery code.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Verified Email</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="name@artisan.com"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-rose-100 focus:outline-none transition-all font-bold text-gray-900 shadow-inner"
                />
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
                        <>Send Recovery Code <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
                    )}
                </span>
            </button>
          </form>

          <p className="mt-12 text-center text-gray-400 font-bold text-sm">
            Remembered? <button onClick={() => navigate("/login")} className="text-rose-500 hover:underline">Sign in instead</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
