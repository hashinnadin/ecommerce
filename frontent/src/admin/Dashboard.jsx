import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaBox, FaShoppingCart, FaRupeeSign, FaEye,
  FaHome, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaTachometerAlt,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  function ComponentName() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);
  
}

  useEffect(() => {
    (async () => {
      try {
        const [u, p, o] = await Promise.all([
          axios.get("http://localhost:3002/users"),
          axios.get("http://localhost:3002/products"),
          axios.get("http://localhost:3002/orders"),
        ]);

        const users = u.data || [];
        const products = p.data || [];
        const orders = o.data || [];

        const userMap = Object.fromEntries(
          users.map((u) => [u.id, u.username || u.email || u.id])
        );

        const sorted = orders
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((o) => ({
            id: o.id,
            userName: userMap[o.userId] || `User ${o.userId}`,
            totalAmount: o.totalAmount,
            status: o.status,
            date: o.date,
          }));

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: orders.reduce((a, b) => a + (b.totalAmount || 0), 0),
        });

        setRecentOrders(sorted);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    return {
      success: "bg-emerald-100 text-emerald-800",
      delivered: "bg-emerald-100 text-emerald-800",
      processing: "bg-amber-100 text-amber-800",
      canceled: "bg-red-100 text-red-800",
    }[s] || "bg-gray-100 text-gray-800";
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: <FaUsers />, color: "from-blue-500 to-blue-600" },
    { title: "Total Products", value: stats.totalProducts, icon: <FaBox />, color: "from-emerald-500 to-emerald-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: <FaShoppingCart />, color: "from-purple-500 to-purple-600" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: <FaRupeeSign />, color: "from-amber-500 to-amber-600" },
  ];

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <FaHome /> },
    { path: "/admin/products", label: "Products", icon: <FaBox /> },
    { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
  ];

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5D4737]">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-xl z-40 transition-all
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] rounded-full flex items-center justify-center text-white">
                  <FaTachometerAlt />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs">Dashboard</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] rounded-full flex items-center justify-center text-white mx-auto">
                <FaTachometerAlt />
              </div>
            )}

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block">
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition
              ${
                window.location.pathname === item.path
                  ? "bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white"
                  : "hover:bg-[#F9F8F6]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && item.label}
            </button>
          ))}

          {isSidebarOpen && (
            <button
              onClick={() => navigate("/admin/products/add")}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
            >
              <FaPlus /> Add Product
            </button>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Main Content */}
      <main className={`transition-all min-h-screen ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white py-8 px-6">
          <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
          <p>Manage your store with real-time analytics</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((s, i) => (
              <div key={i} className="bg-white p-5 shadow rounded-xl border hover:-translate-y-1 transition">
                <div className="flex justify-between items-center mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${s.color} text-white`}>{s.icon}</div>
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-6 mb-4">Recent Orders</h2>

          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F9F8F6]">
                <tr>
                  <th className="p-3 text-left">Order ID</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate("/admin/orders")}
                      className="hover:bg-[#F9F8F6] cursor-pointer transition"
                    >
                      <td className="p-3">#{o.id.toString().slice(-6)}</td>
                      <td className="p-3">{o.userName}</td>
                      <td className="p-3 text-emerald-600">₹{o.totalAmount}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(o.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
