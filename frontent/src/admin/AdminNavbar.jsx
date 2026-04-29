import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaPlus,
  FaEdit,
  FaEye
} from "react-icons/fa";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const mainMenuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <FaHome />,
      description: "Overview & analytics"
    },
    { 
      path: "/admin/products", 
      label: "Products", 
      icon: <FaBox />,
      description: "Manage product catalog"
    },
    { 
      path: "/admin/orders", 
      label: "Orders", 
      icon: <FaShoppingCart />,
      description: "View & update orders"
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: <FaUsers />,
      description: "Registered users"
    },
  ];

  const productSubMenu = [
    { path: "/admin/products/add", label: "Add Product", icon: <FaPlus /> },
    { path: "/admin/products", label: "View All", icon: <FaEye /> },
    { path: "/admin/products/edit", label: "Edit Products", icon: <FaEdit /> }
  ];

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-2xl text-[#5D4737] bg-white p-2 rounded-lg shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white border-r border-[#D9CFC7] 
        shadow-lg z-40 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-[#EFE9E3]">
          <div className="flex items-center justify-between">
            <div 
              className={`flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
              onClick={() => navigate("/admin")}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C9B59C] p-1">
                <img
                  src={logo}
                  alt="admin"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#5D4737]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#8B7355]">
                  Management
                </p>
              </div>
            </div>

            <button
              className="hidden lg:block text-[#C9B59C] hover:text-[#B8A48B]"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {mainMenuItems.map((item) => (
            <div key={item.path}>
              <button
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-all
                  ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white shadow-md"
                      : "text-[#5D4737] hover:bg-[#F9F8F6]"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <div className={`${isCollapsed ? "hidden" : "block"} text-left`}>
                  <span className="font-medium block">{item.label}</span>
                  <span className="text-xs opacity-80">
                    {item.description}
                  </span>
                </div>
              </button>

              {/* PRODUCT SUBMENU */}
              {item.path === "/admin/products" &&
                isActive(item.path) &&
                !isCollapsed && (
                  <div className="ml-10 mt-2 space-y-1 border-l-2 border-[#EFE9E3] pl-4">
                    {productSubMenu.map((sub) => (
                      <button
                        key={sub.path}
                        onClick={() => navigate(sub.path)}
                        className="w-full flex items-center gap-2 p-2 text-sm text-[#8B7355] hover:text-[#5D4737]"
                      >
                        {sub.icon}
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {/* LOGOUT */}
          <div className="pt-6 border-t border-[#EFE9E3]">
            <button
              onClick={logoutAdmin}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold"
            >
              <FaSignOutAlt />
              {!isCollapsed && "Logout"}
            </button>
          </div>
        </nav>
      </aside>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default AdminNavbar;
