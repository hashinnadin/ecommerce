import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./compenent/Navbar/Navbar";

import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Product from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./admin/Dashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminAddProducts from "./admin/AdminAddProducts";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";

import { useAuth } from "./context/AuthContext";

const Protected = ({ user, children }) => {
  const location = useLocation();
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const AdminProtected = ({ admin, children }) => {
  const location = useLocation();
  return admin ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
  const { user, admin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const hideNavbarRoutes = ["/login", "/register", "/verify-otp", "/admin"];
  const hideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        transition={Slide}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : admin ? (
              <Navigate to="/admin" />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={user || admin ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/verify-otp"
          element={user || admin ? <Navigate to="/" /> : <VerifyOTP />}
        />
        <Route
          path="/forgot-password"
          element={user || admin ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user || admin ? <Navigate to="/" /> : <ResetPassword />}
        />
        {/* USER PROTECTED */}
        <Route
          path="/cart"
          element={
            <Protected user={user}>
              <Cart />
            </Protected>
          }
        />
        <Route
          path="/wishlist"
          element={
            <Protected user={user}>
              <Wishlist />
            </Protected>
          }
        />
        <Route
          path="/payment"
          element={
            <Protected user={user}>
              <Payment />
            </Protected>
          }
        />
        <Route
          path="/orders"
          element={
            <Protected user={user}>
              <Orders />
            </Protected>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Protected user={user}>
              <OrderDetails />
            </Protected>
          }
        />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin"
          element={
            <AdminProtected admin={admin}>
              <Dashboard />
            </AdminProtected>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtected admin={admin}>
              <AdminProducts />
            </AdminProtected>
          }
        />
        <Route
          path="/admin/products/add"
          element={
            <AdminProtected admin={admin}>
              <AdminAddProducts />
            </AdminProtected>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminProtected admin={admin}>
              <AdminEditProduct />
            </AdminProtected>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtected admin={admin}>
              <AdminOrders />
            </AdminProtected>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtected admin={admin}>
              <AdminUsers />
            </AdminProtected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;