import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaSignOutAlt, 
  FaThLarge,
  FaChartLine,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/login");
    }
  }, [admin, navigate]);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <FaChartLine /> },
    { path: "/admin/products", label: "Inventory", icon: <FaBox /> },
    { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/admin/users", label: "Customers", icon: <FaUsers /> },
    { path: "/", label: "Store Front", icon: <FaHome /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-[110] text-white bg-rose-500 p-3 rounded-2xl shadow-xl" 
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <aside className={`fixed top-0 left-0 h-screen bg-gray-900 text-gray-400 transition-all duration-300 z-[100] shadow-2xl ${isCollapsed ? "w-20" : "w-72"} ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-8 flex items-center gap-4 border-b border-gray-800">
          <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsCollapsed(!isCollapsed)}>
            <FaThLarge size={20} />
          </div>
          {!isCollapsed && <span className="text-xl font-black text-white tracking-tight">Admin<span className="text-rose-500">Hub</span></span>}
        </div>

        <nav className="p-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                location.pathname === item.path 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-bold">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <button 
            onClick={logout} 
            className={`flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all ${isCollapsed && "justify-center"}`}
          >
            <FaSignOutAlt size={20} />
            {!isCollapsed && <span className="font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-[105] lg:hidden backdrop-blur-sm transition-all" onClick={() => setOpen(false)} />}
    </>
  );
}

export default AdminNavbar;

