import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import API from "../api";

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
    <CleanBackground>
      <button 
        onClick={() => navigate("/")} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Store
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h1>
        <p className="text-gray-500 font-medium text-sm">Join BakeHub and start tracking your orders.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              name="username" type="text" value={form.username} onChange={handleChange} required
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${errors.username ? "border-rose-500" : "border-gray-100"} rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium`}
            />
          </div>
          {errors.username && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{errors.username}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${errors.email ? "border-rose-500" : "border-gray-100"} rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium`}
            />
          </div>
          {errors.email && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input
                name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required
                placeholder="••••••"
                className={`w-full pl-11 pr-8 py-3.5 bg-gray-50 border ${errors.password ? "border-rose-500" : "border-gray-100"} rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input
                name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} required
                placeholder="••••••"
                className={`w-full pl-11 pr-8 py-3.5 bg-gray-50 border ${errors.confirmPassword ? "border-rose-500" : "border-gray-100"} rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        {errors.password && <p className="text-rose-500 text-xs font-semibold ml-1">{errors.password}</p>}
        {errors.confirmPassword && <p className="text-rose-500 text-xs font-semibold ml-1">{errors.confirmPassword}</p>}

        <div className="pt-2">
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : <>Sign Up <ArrowRight size={18} /></>}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Already have an account? <Link to="/login" className="text-rose-500 hover:underline font-bold ml-1">Sign in</Link>
      </p>
    </CleanBackground>
  );
}

export default Register;
