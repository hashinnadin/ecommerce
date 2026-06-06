import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

// Simple custom float animation wrapper
function CleanBackground({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Subtle background blurs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 sm:p-10 relative z-10">
        {children}
      </div>
    </div>
  );
}

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
    <CleanBackground>
      <button 
        onClick={() => navigate("/")} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Store
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h1>
        <p className="text-gray-500 font-medium text-sm">Sign in to your account to continue.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs text-rose-500 hover:underline font-bold">Forgot?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Don't have an account? <Link to="/register" className="text-rose-500 hover:underline font-bold ml-1">Sign up</Link>
      </p>
    </CleanBackground>
  );
}

export default Login;