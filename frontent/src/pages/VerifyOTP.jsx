import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, RotateCw, ChevronLeft, Sparkles } from "lucide-react";
import API from "../api";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid verification session");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 5) {
      toast.error("Please enter the full code");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/verify", { email, otp: otpCode });
      toast.success("Identity confirmed! Welcome to the family.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await API.post("/auth/resend-otp", { email });
      toast.success("Fresh security code dispatched.");
      setTimer(60);
      setOtp(["", "", "", "", ""]);
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col lg:flex-row selection:bg-rose-500 selection:text-white">
      {/* 🔹 LEFT SIDE: Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/80 to-transparent"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
            <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-rose-500/20">
                <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">Secure <br/><span className="text-rose-500">Identity.</span></h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">We've dispatched a unique access code to your digital inbox. One final step to enter the sanctuary of artisan treats.</p>
          </motion.div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 🔹 RIGHT SIDE: Verification Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 bg-white relative">
        <div className="w-full max-w-md relative z-10">
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate("/register")} 
            className="mb-16 flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-[0.3em] transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Restart Signup
          </motion.button>

          <div className="mb-12">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-10 border border-rose-100 shadow-sm"
            >
              <ShieldCheck className="text-rose-500" size={32} />
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Confirm <span className="text-gradient">Email.</span></h1>
            <p className="text-gray-500 font-bold text-lg">Enter the secret digits sent to <span className="text-gray-900 font-black">{email}</span></p>
          </div>

          <form onSubmit={handleVerify} className="space-y-12">
            <div className="flex justify-between gap-4">
              {otp.map((data, index) => (
                <motion.input
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  key={index} type="text" maxLength="1" value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                  className="w-full aspect-square text-3xl font-black text-center bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-inner"
                />
              ))}
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
                        <>Verify & Enter <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
                    )}
                </span>
            </button>
          </form>

          <div className="mt-16 text-center">
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-6">Didn't receive the transmission?</p>
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className={`flex items-center justify-center gap-4 mx-auto font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-[1.5rem] transition-all ${
                timer > 0 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm"
              }`}
            >
              <RotateCw className={resending ? "animate-spin" : ""} size={16} />
              {timer > 0 ? `Resend Available in ${timer}s` : "Resend Security Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
