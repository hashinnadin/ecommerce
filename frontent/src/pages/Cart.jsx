import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const [localLoading, setLocalLoading] = useState({});

  // ✅ REDIRECT IF NOT LOGGED IN
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Calculate totals safely
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const deliveryFee = subtotal >= 999 ? 0 : 99;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setLocalLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setLocalLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (id, name) => {
    if (window.confirm(`Remove ${name} from cart?`)) {
      setLocalLoading(prev => ({ ...prev, [id]: true }));
      try {
        await removeFromCart(id);
        toast.success(`${name} removed from cart`);
      } catch (error) {
        console.error("Failed to remove item:", error);
        toast.error("Failed to remove item");
      } finally {
        setLocalLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/100x100?text=Cake";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag size={40} className="text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any cakes yet</p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6 transition-colors"
        >
          <FaArrowLeft /> Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({cartItems.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-rose-600 font-bold mt-1">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        disabled={localLoading[item.id]}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-2"
                        title="Remove item"
                      >
                        {localLoading[item.id] ? (
                          <FaSpinner className="animate-spin" size={16} />
                        ) : (
                          <FaTrash size={16} />
                        )}
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={localLoading[item.id] || item.quantity <= 1}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="w-12 text-center py-2 border-x font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={localLoading[item.id]}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-700">
                        Total: ₹{(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {subtotal < 999 && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free delivery
                  </p>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-rose-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/payment")}
                disabled={loading || cartItems.length === 0}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping Link */}
              <button
                onClick={() => navigate("/products")}
                className="w-full text-center mt-4 text-sm text-gray-500 hover:text-rose-500 transition-colors"
              >
                or continue shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;