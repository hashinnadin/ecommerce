import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, ArrowRight, ChevronLeft, KeyRound } from "lucide-react";
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
    <CleanBackground>
      <button 
        onClick={() => navigate("/login")} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Login
      </button>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
          <KeyRound size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Forgot Password</h1>
        <p className="text-gray-500 font-medium text-sm">Enter your email and we'll send you an OTP code to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Sending Code..." : <>Send OTP Code <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Remember your password? <Link to="/login" className="text-rose-500 hover:underline font-bold ml-1">Sign in</Link>
      </p>
    </CleanBackground>
  );
}

export default ForgotPassword;
