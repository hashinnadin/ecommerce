import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaSignOutAlt, FaUser, FaHome, FaBox } from "react-icons/fa";
import { HiSearch, HiMenu, HiX } from "react-icons/hi";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setSearchTerm("");
    }
  };

  const handleCartClick = () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
    } else {
      navigate("/wishlist");
    }
  };



  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/products", label: "All Cakes", icon: <FaBox /> },
    { path: "/orders", label: "My Orders", icon: <FaBox /> },
  ];

  return (
    <nav className="w-full bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Main Navbar */}
        <div className="flex items-center justify-between py-3">
          
          {/* LOGO */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <img src={logo} alt="CakeHub Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <span className="text-2xl font-bold hidden sm:block text-gray-800">
              Cake<span className="text-rose-500">Hub</span>
            </span>
          </div>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <button 
                  onClick={() => {
                    if (link.path === "/orders" && !user) {
                      toast.error("Please login first");
                      navigate("/login");
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <span className={`${isActive(link.path) ? "text-white" : "text-rose-400"}`}>
                    {link.icon}
                  </span>
                  <span className="font-medium">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* DESKTOP SEARCH */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                {/* <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cakes by name or flavor..."
                  className="w-full px-5 py-2.5 pl-12 rounded-full border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none bg-gray-50 text-gray-700 placeholder-gray-400"
                /> */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <HiSearch size={18} />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiX size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {/* WISHLIST */}
            <button 
              onClick={handleWishlistClick}
              className="p-2.5 rounded-lg text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-colors relative group"
              title="Wishlist"
            >
              <FaHeart size={20} />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Wishlist
              </div>
            </button>

            {/* CART */}
            <div className="relative group">
              <button 
                onClick={handleCartClick}
                className="p-2.5 rounded-lg text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-colors relative"
                title="Cart"
              >
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Cart ({cartCount})
              </div>
            </div>

            {/* USER AUTH */}
            {user ? (
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:shadow-md transition-shadow font-medium"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-md transition-shadow font-medium"
              >
                <FaUser />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button 
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slideDown">
            {/* MOBILE SEARCH */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cakes..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none bg-gray-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <HiSearch size={18} />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiX size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* MOBILE NAV LINKS */}
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (link.path === "/orders" && !user) {
                        toast.error("Please login first");
                        navigate("/login");
                      } else {
                        navigate(link.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive(link.path)
                        ? "bg-rose-50 text-rose-600 border-l-4 border-rose-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`${isActive(link.path) ? "text-rose-500" : "text-gray-500"}`}>
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </button>
                </li>
              ))}
              
              {/* MOBILE WISHLIST */}
              <li>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleWishlistClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <FaHeart className="text-rose-400" />
                  <span className="font-medium">Wishlist</span>
                </button>
              </li>
            </ul>

            {/* MOBILE USER INFO */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user.email || ""}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Login to access all features</p>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium"
                  >
                    Login / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;