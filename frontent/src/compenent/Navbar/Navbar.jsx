import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaSignOutAlt, FaUser, FaHome, FaBox, FaShoppingBag, FaBars, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, admin, logout } = useAuth();
  const { cartCount } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/products", label: "Menu", icon: <FaBox /> },
    { path: "/orders", label: "Orders", icon: <FaShoppingBag /> },
  ];

  return (
    <nav 
      className={`w-full fixed top-0 left-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-premium py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* 🔹 LOGO */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <img src={logo} alt="L" className="w-8 h-8 rounded-lg" />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900">
            Bake<span className="text-rose-500">Hub</span>
          </span>
        </Link>

        {/* 🔹 DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isActive(link.path)
                      ? "text-rose-500 bg-rose-50"
                      : "text-gray-600 hover:text-rose-500 hover:bg-rose-50/50"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {admin && (
              <li>
                <Link
                  to="/admin"
                  className="px-5 py-2.5 rounded-xl font-black text-rose-500 bg-rose-50/50 flex items-center gap-2 transition-all hover:bg-rose-500 hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="h-6 w-px bg-gray-200"></div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/wishlist")}
              className="p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all relative"
            >
              <FaHeart size={20} />
            </button>

            <button 
              onClick={() => navigate("/cart")}
              className="p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all relative"
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user || admin ? (
              <div className="flex items-center gap-4 ml-2">
                <button 
                  onClick={() => navigate(admin ? "/admin" : "/profile")}
                  className="w-10 h-10 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center font-black hover:bg-rose-200 transition-colors shadow-sm"
                  title="View Profile"
                >
                  {(user?.name || admin?.name || "A").charAt(0).toUpperCase()}
                </button>
                <button 
                  onClick={logout}
                  className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaSignOutAlt size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="ml-2 px-6 py-2.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 flex items-center gap-2"
              >
                <FaUser size={14} /> Login
              </button>
            )}
          </div>
        </div>

        {/* 🔹 MOBILE TOGGLE */}
        <button 
          className="lg:hidden p-3 bg-white shadow-premium rounded-2xl text-gray-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl lg:hidden p-6"
          >
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl font-bold ${
                      isActive(link.path) ? "bg-rose-50 text-rose-500" : "text-gray-700"
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-700"
                >
                  <FaHeart /> Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-700"
                >
                  <FaShoppingCart /> Cart ({cartCount})
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-700"
                >
                  <FaUser /> Profile
                </Link>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-100">
              {user ? (
                <button 
                  onClick={logout}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => navigate("/login")}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;