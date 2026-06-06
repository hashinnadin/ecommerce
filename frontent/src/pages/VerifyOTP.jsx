import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShieldCheck, ArrowRight, RotateCw, ChevronLeft } from "lucide-react";
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
    <CleanBackground>
      <button 
        onClick={() => navigate("/register")} 
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-wider transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Restart Signup
      </button>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Confirm Email</h1>
        <p className="text-gray-500 font-medium text-sm">Enter the verification code sent to <span className="text-gray-950 font-bold">{email}</span></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Code</label>
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((data, index) => (
              <input
                key={index} type="text" maxLength="1" value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                className="w-full aspect-square text-2xl font-bold text-center bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-rose-100/30 focus:border-rose-300 focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Confirming..." : <>Verify & Enter <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-8 text-center pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Didn't receive the code?</p>
        <button
          onClick={handleResend}
          disabled={timer > 0 || resending}
          className={`flex items-center justify-center gap-2 mx-auto font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all ${
            timer > 0 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
          }`}
        >
          <RotateCw className={resending ? "animate-spin" : ""} size={14} />
          {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
        </button>
      </div>
    </CleanBackground>
  );
}

export default VerifyOTP;
