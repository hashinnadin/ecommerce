import { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function Login() {

  const { loginUser, loginAdmin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    // 🔹 ADMIN LOGIN
    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      loginAdmin({ email: ADMIN_EMAIL, role: "admin" });
      setLoading(false);
      return;
    }

    try {
      // Check if user is blocked
      const blocked = await API.get(
        `/users?email=${form.email}&status=blocked`
      );

      if (blocked.data.length > 0) {
        toast.error("Your account has been blocked. Please contact support.");
        setLoading(false);
        return;
      }

      // Check user credentials
      const res = await API.get(
        `/users?email=${form.email}&password=${form.password}`
      );

      if (res.data.length === 0) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }

      const user = res.data[0];

      // Check if user is blocked (double check)
      if (user.status === "blocked") {
        toast.error("Your account has been blocked. Please contact support.");
        setLoading(false);
        return;
      }

      loginUser(user);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue to CakeHub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-rose-500 font-semibold hover:text-rose-600">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-2 text-sm">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;