import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";
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

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/reset-password", { 
        email, 
        otp: otpCode, 
        new_password: newPassword,
        confirm_password: confirmPassword
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
    <CleanBackground>
      <button 
        onClick={() => navigate("/forgot-password")} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Step Back
      </button>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Reset Password</h1>
        <p className="text-gray-500 font-medium text-sm">Enter the security code sent to <span className="text-gray-950 font-bold">{email}</span> and choose a new password.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Code</label>
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((data, index) => (
              <input
                key={index} type="text" maxLength="1" value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={e => e.target.select()}
                className="w-full aspect-square text-2xl font-bold text-center bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 font-medium"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500 transition-colors">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Resetting..." : <>Reset Password <ArrowRight size={18} /></>}
        </button>
      </form>
    </CleanBackground>
  );
}

export default ResetPassword;
