import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
} from "react-icons/fa";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  /* 🔹 LOAD ALL USER ORDERS */
  const loadOrders = async () => {
    try {
      const res = await fetch("http://localhost:3002/users");
      const users = await res.json();

      // 🔥 Collect all orders from all users
      const allOrders = users.flatMap((user) =>
        (user.orders || []).map((order) => ({
          ...order,
          userId: user.id,
        }))
      );

      setOrders(allOrders);
    } catch {
      toast.error("Failed to load orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* 🔹 UPDATE ORDER STATUS */
  const updateStatus = async (orderId, newStatus, userId) => {
    try {
      const res = await fetch(`http://localhost:3002/users/${userId}`);
      const user = await res.json();

      const updatedOrders = user.orders.map((o) =>
        o.orderId === orderId ? { ...o, status: newStatus } : o
      );

      await fetch(`http://localhost:3002/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders }),
      });

      toast.success("Order status updated!");
      loadOrders();
    } catch {
      toast.error("Failed to update status!");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-emerald-100 text-emerald-800";
      case "processing":
        return "bg-amber-100 text-amber-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <FaHome /> },
    { path: "/admin/products", label: "Products", icon: <FaBox /> },
    { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-xl z-40 transition-all
        ${isSidebarOpen ? "w-64" : "w-20"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex items-center justify-center text-white">
              <FaTachometerAlt />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs">Orders</p>
              </div>
            )}
          </div>
          <button
            className="hidden lg:block"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              {item.icon}
              {isSidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t absolute bottom-0 w-full">
          <button
            onClick={logoutAdmin}
            className="w-full bg-red-500 text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main
        className={`${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } transition-all p-8`}
      >
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white p-6 rounded shadow">
              <h3 className="font-bold">Order #{order.orderId}</h3>
              <p className="text-sm">User ID: {order.userId}</p>

              <span
                className={`inline-block px-3 py-1 mt-2 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status || "processing"}
              </span>

              <p className="mt-3 font-semibold">₹{order.total}</p>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() =>
                    updateStatus(order.orderId, "processing", order.userId)
                  }
                  className="bg-amber-100 p-2 rounded"
                >
                  <FaTruck /> Processing
                </button>
                <button
                  onClick={() =>
                    updateStatus(order.orderId, "success", order.userId)
                  }
                  className="bg-emerald-100 p-2 rounded"
                >
                  <FaCheckCircle /> Complete
                </button>
                <button
                  onClick={() =>
                    updateStatus(order.orderId, "canceled", order.userId)
                  }
                  className="bg-red-100 p-2 rounded"
                >
                  <FaTimesCircle /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
