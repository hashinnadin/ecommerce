import { useEffect, useState } from "react";
import {
  FaBox,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaShoppingBag,
  FaArrowRight,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get(`/users/${user.id}`);
        const userOrders = res.data.orders || [];

        // Sort by date (newest first)
        const sortedOrders = userOrders.sort(
          (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getOrderStatus = (status) => {
    const statusLower = (status || "processing").toLowerCase();
    
    const statuses = {
      processing: {
        text: "Processing",
        color: "bg-yellow-100 text-yellow-800",
        icon: <FaClock className="text-yellow-500" />,
      },
      success: {
        text: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="text-green-500" />,
      },
      delivered: {
        text: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="text-green-500" />,
      },
      shipped: {
        text: "Shipped",
        color: "bg-blue-100 text-blue-800",
        icon: <FaTruck className="text-blue-500" />,
      },
      canceled: {
        text: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <FaBox className="text-red-500" />,
      },
      cancelled: {
        text: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <FaBox className="text-red-500" />,
      },
    };

    return statuses[statusLower] || statuses.processing;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-3xl text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Please Login
          </h2>
          <p className="text-gray-600 mb-8">
            You need to be logged in to view your orders
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBox className="text-5xl text-rose-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to see your order history here!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            You have placed {orders.length} order{orders.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const status = getOrderStatus(order.status);
            const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const orderDate = formatDate(order.date || order.createdAt);
            const orderId = order.orderId || order.id;

            return (
              <div
                key={orderId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono font-medium">{orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Placed on</p>
                      <p className="font-medium">{orderDate}</p>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${status.color}`}>
                        {status.icon}
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {order.items?.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50x50?text=Cake";
                            }}
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Total Items: {totalItems}</p>
                      <p className="text-lg font-bold text-rose-600">₹{order.totalAmount || order.total}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/orders/${orderId}`)}
                      className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      View Details <FaArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Orders;