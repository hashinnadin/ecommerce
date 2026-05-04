import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        // First try to find in user's orders
        const userRes = await API.get(`/users/${user.id}`);
        const userOrders = userRes.data.orders || [];
        
        let foundOrder = userOrders.find(
          (o) => String(o.orderId || o.id) === String(id)
        );

        // If not found, try the separate orders collection
        if (!foundOrder) {
          try {
            const orderRes = await API.get(`/orders/${id}`);
            if (orderRes.data && orderRes.data.userId === user.id) {
              foundOrder = orderRes.data;
            }
          } catch {
            console.log("Order not in separate collection");
          }
        }

        if (!foundOrder) {
          toast.error("Order not found");
          navigate("/orders");
          return;
        }

        setOrder(foundOrder);
      } catch (error) {
        console.error("Failed to load order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate]);

  const getStatusIcon = (status) => {
    const statusLower = (status || "processing").toLowerCase();
    
    if (statusLower === "delivered" || statusLower === "success") {
      return <FaCheckCircle className="text-green-500 text-xl" />;
    }
    if (statusLower === "shipped") {
      return <FaTruck className="text-blue-500 text-xl" />;
    }
    if (statusLower === "cancelled" || statusLower === "canceled") {
      return <FaBox className="text-red-500 text-xl" />;
    }
    return <FaClock className="text-yellow-500 text-xl" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
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
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderId = order.orderId || order.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Order #{orderId}</h1>
            <p className="opacity-90">Placed on {formatDate(order.date || order.createdAt)}</p>
          </div>

          {/* Status */}
          <div className="px-6 py-4 border-b flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <p className="font-medium">Order Status</p>
              <p className="text-sm text-gray-600 capitalize">{order.status || "Processing"}</p>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 py-2 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80x80?text=Cake";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-rose-600 font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold mb-3">Delivery Address</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-gray-600">{order.address.house}, {order.address.street}</p>
                <p className="text-gray-600">{order.address.city} - {order.address.pincode}</p>
                <p className="text-gray-600">{order.address.state}</p>
                <p className="text-gray-600 mt-2">Mobile: {order.address.mobile}</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-bold mb-3">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.totalAmount || order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>{(order.totalAmount || order.total) >= 999 ? "Free" : "₹99"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-rose-600">₹{order.totalAmount || order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;