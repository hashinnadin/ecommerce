import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaMobileAlt, FaArrowLeft } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../api";

function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);


  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    house: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
  });

  // Check authentication and cart
  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.info("Your cart is empty");
      navigate("/");
      return;
    }

    // Load saved address
    const loadAddress = async () => {
      try {
        const res = await API.get(`/users/${user.id}`);
        if (res.data.address) {
          setAddress(res.data.address);
        }
      } catch (error) {
        console.error("Failed to load address:", error);
      }
    };

    loadAddress();
  }, [user, cartItems, navigate]);

  const getTotalPrice = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleAddressInput = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "mobile") v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = value.replace(/\D/g, "").slice(0, 6);

    setAddress({ ...address, [name]: v });
    
    // Clear error for this field
    if (addressErrors[name]) {
      setAddressErrors({ ...addressErrors, [name]: null });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber")
      v = v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    if (name === "expiryDate") {
      v = v.replace(/\D/g, "");
      if (v.length >= 2) {
        v = v.slice(0, 2) + "/" + v.slice(2, 4);
      }
    }
    if (name === "cvv") v = v.replace(/\D/g, "").slice(0, 3);

    setFormData({ ...formData, [name]: v });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateAddress = () => {
    let addrErr = {};

    if (!address.fullName.trim()) addrErr.fullName = "Full name is required";
    if (!address.mobile || address.mobile.length !== 10) 
      addrErr.mobile = "Valid 10-digit mobile number is required";
    if (!address.house.trim()) addrErr.house = "House/Flat number is required";
    if (!address.street.trim()) addrErr.street = "Street address is required";
    if (!address.city.trim()) addrErr.city = "City is required";
    if (!address.pincode || address.pincode.length !== 6) 
      addrErr.pincode = "Valid 6-digit pincode is required";
    if (!address.state.trim()) addrErr.state = "State is required";

    setAddressErrors(addrErr);
    return Object.keys(addrErr).length === 0;
  };

  const validatePayment = () => {
    let err = {};

    if (paymentMethod === "card") {
      const cardNum = formData.cardNumber.replace(/\s/g, "");
      if (cardNum.length !== 16) {
        err.cardNumber = "Card number must be 16 digits";
      }
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        err.expiryDate = "Use MM/YY format";
      } else {
        // Check if card is expired
        const [month, year] = formData.expiryDate.split("/");
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        if (expiry < today) {
          err.expiryDate = "Card has expired";
        }
      }
      if (formData.cvv.length !== 3) {
        err.cvv = "CVV must be 3 digits";
      }
      if (!formData.nameOnCard.trim()) {
        err.nameOnCard = "Name on card is required";
      }
    }

    if (paymentMethod === "upi") {
      if (!formData.upiId.includes("@")) {
        err.upiId = "Enter a valid UPI ID (e.g., name@bank)";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Create order
  const createOrder = async () => {
    const order = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId: user.id,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: getTotalPrice(),
      paymentMethod,
      paymentStatus: "completed",
      address: { ...address },
      date: new Date().toISOString(),
      status: "Processing",
    };

    // Save order to user's orders
    const userRes = await API.get(`/users/${user.id}`);
    const updatedOrders = [...(userRes.data.orders || []), order];
    
    await API.patch(`/users/${user.id}`, {
      orders: updatedOrders,
      address: address,
    });

    // Also save to separate orders collection for admin
    try {
      await API.post("/orders", order);
    } catch (error) {
      console.error("Failed to save to orders collection:", error);
    }

    return order;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate address
    if (!validateAddress()) {
      toast.error("Please fill all address fields correctly");
      return;
    }

    // Validate payment
    if (!validatePayment()) {
      toast.error("Please check payment details");
      return;
    }

    setLoading(true);

    try {
      // Create order
      await createOrder();
      
      // Clear cart
      await clearCart();
      
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary & Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
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
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-rose-600">₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={address.fullName}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.fullName ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={address.mobile}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.mobile ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.mobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House/Flat No. *
                  </label>
                  <input
                    type="text"
                    name="house"
                    placeholder="House/Flat number"
                    value={address.house}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.house ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.house && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.house}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street/Area *
                  </label>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street or area name"
                    value={address.street}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.street ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.street && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.city ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.pincode ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleAddressInput}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                      addressErrors.state ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                    }`}
                  />
                  {addressErrors.state && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.state}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === "card"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FaCreditCard className={paymentMethod === "card" ? "text-rose-500" : "text-gray-400"} />
                  <span className="font-medium">Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === "upi"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FaMobileAlt className={paymentMethod === "upi" ? "text-rose-500" : "text-gray-400"} />
                  <span className="font-medium">UPI Payment</span>
                </button>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                {paymentMethod === "card" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                          errors.cardNumber ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                            errors.expiryDate ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                            errors.cvv ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                          }`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        name="nameOnCard"
                        placeholder="As shown on card"
                        value={formData.nameOnCard}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                          errors.nameOnCard ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                        }`}
                      />
                      {errors.nameOnCard && (
                        <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>
                      )}
                    </div>
                  </>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="username@bank"
                      value={formData.upiId}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 ${
                        errors.upiId ? "border-red-500" : "border-gray-300 focus:border-rose-400"
                      }`}
                    />
                    {errors.upiId && (
                      <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      You'll receive a payment request on your UPI app
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? "Processing..." : `Pay ₹${getTotalPrice()}`}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this payment, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;