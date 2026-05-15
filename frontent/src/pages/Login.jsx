import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, loginAdmin } = useAuth();

  const from = location.state?.from?.pathname || "/";
  const adminFrom = location.state?.from?.pathname || "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email: form.email, password: form.password });
      const token = res.data.access_token;
      const role = res.data.role;
      
      if (token) {
        localStorage.setItem("token", token);
        if (role === "admin") {
          loginAdmin({ email: form.email, role: "admin" }, token, adminFrom);
          return;
        }
        try {
          const dashRes = await API.get("/user/dashboard");
          loginUser({ id: dashRes.data.user_id, name: dashRes.data.name, email: form.email, role: dashRes.data.role }, token, from);
        } catch {
          loginUser({ email: form.email, role: role || 'user' }, token, from);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Server error";
      toast.error(msg);
      if (msg.toLowerCase().includes("not verified")) navigate(`/verify-otp?email=${form.email}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-rose-100/40 rounded-full blur-3xl animate-float lg:block hidden"></div>

      {/* 🔹 LEFT SIDE: VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80')] bg-cover bg-center grayscale-[20%]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-rose-500/30">
              Established 1994
            </span>
            <h2 className="text-7xl font-black mb-10 leading-[1.1] tracking-tighter">Artisan <br/><span className="text-rose-500">Excellence</span></h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">Login to your private portal to manage your sweet collection and track your handcrafted orders.</p>
          </motion.div>
          <div className="flex gap-12 items-center">
            <div className="h-px w-12 bg-rose-500"></div>
            <div className="flex gap-10">
                <div><p className="text-4xl font-black mb-1">50k+</p><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Patrons</p></div>
                <div><p className="text-4xl font-black mb-1">200+</p><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Recipes</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 RIGHT SIDE: FORM */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-20 bg-pattern relative">
        <div className="w-full max-w-md relative z-10">
          <button 
            onClick={() => navigate("/")} 
            className="mb-16 flex items-center gap-3 text-gray-400 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
          </button>

          <div className="mb-12">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Welcome <span className="text-gradient">Back</span></h1>
            <p className="text-gray-500 font-bold text-lg">Indulge in your favorites today.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Secure Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-4 py-5 bg-white border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={20} />
                <input
                  name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-white border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" size={20} className="text-xs text-gray-400 hover:text-rose-500 font-black uppercase tracking-widest transition-colors">Forgot Password?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-6 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? "Verifying..." : <>Sign In <ArrowRight size={22} /></>}
            </button>
          </form>

          <p className="mt-12 text-center text-gray-500 font-bold">
            New to BakeHub? <Link to="/register" className="text-rose-500 hover:underline font-black">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;