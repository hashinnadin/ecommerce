import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords mismatch";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validateForm();
    if (Object.keys(valErrors).length !== 0) { setErrors(valErrors); return; }
    setLoading(true);
    try {
      await API.post("/auth/signup", { name: form.username, email: form.email, password: form.password, confirm_password: form.confirmPassword });
      toast.success("Success! Verify your email.");
      navigate(`/verify-otp?email=${form.email}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-violet-100/40 rounded-full blur-3xl animate-float lg:block hidden"></div>

      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80')] bg-cover bg-center grayscale-[10%]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/20 backdrop-blur-md text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-violet-500/30">
              Join Our Community
            </span>
            <h2 className="text-7xl font-black mb-10 leading-[1.1] tracking-tighter">BakeHub <br/><span className="text-rose-500">Family</span></h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">Create an account to unlock exclusive member rewards, save your favorite recipes, and experience the art of baking at home.</p>
          </motion.div>
          <div className="flex gap-6 items-center">
             <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-rose-500">
                <Sparkles size={20} />
             </div>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Join 50,000+ sweet lovers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 sm:p-20 bg-pattern relative">
        <div className="w-full max-w-md relative z-10">
          <button 
            onClick={() => navigate("/")} 
            className="mb-12 flex items-center gap-3 text-gray-400 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
          </button>

          <div className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Create <span className="text-gradient">Account</span></h1>
            <p className="text-gray-500 font-bold text-lg">Start your sweet journey with us.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input
                  name="username" type="text" value={form.username} onChange={handleChange} required
                  placeholder="John Doe"
                  className={`w-full pl-14 pr-4 py-4 bg-white border ${errors.username ? "border-rose-500" : "border-gray-100"} rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium`}
                />
              </div>
              {errors.username && <p className="text-rose-500 text-[10px] font-black ml-4 uppercase tracking-wider">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="name@example.com"
                  className={`w-full pl-14 pr-4 py-4 bg-white border ${errors.email ? "border-rose-500" : "border-gray-100"} rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium`}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[10px] font-black ml-4 uppercase tracking-wider">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input
                    name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required
                    placeholder="••••••"
                    className={`w-full pl-13 pr-10 py-4 bg-white border ${errors.password ? "border-rose-500" : "border-gray-100"} rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input
                    name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} required
                    placeholder="••••••"
                    className={`w-full pl-13 pr-10 py-4 bg-white border ${errors.confirmPassword ? "border-rose-500" : "border-gray-100"} rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 transition-all shadow-premium`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-black ml-4 uppercase tracking-wider">{errors.confirmPassword}</p>}

            <div className="pt-6">
              <button
                type="submit" disabled={loading}
                className="w-full py-6 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? "Creating..." : <>Join Family <ArrowRight size={22} /></>}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-gray-500 font-bold">
            Already have an account? <Link to="/login" className="text-rose-500 hover:underline font-black">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ size, className }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

export default Register;
