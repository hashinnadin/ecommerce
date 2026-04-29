import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./compenent/Navbar/Navbar";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Product from "./pages/Products";
import Wishlist from "./pages/Wishlist";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import Dashboard from "./admin/Dashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminAddProducts from "./admin/AdminAddProducts";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";

import { useAuth } from "./context/AuthContext";

const Protected = ({ user, children }) => {
  return user ? children : <Navigate to="/login" replace />;
};

const AdminProtected = ({ admin, children }) => {
  return admin ? children : <Navigate to="/login" replace />;
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

  const hideNavbarRoutes = ["/login", "/register", "/admin"];
  const hideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Product />} />

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