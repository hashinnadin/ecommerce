import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import API from "../api";

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  /* 🔄 LOAD PRODUCT */
  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product");
        navigate("/admin/products");
      });
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    ["name", "price", "category", "image", "description"].forEach((f) => {
      if (!form[f] || form[f].toString().trim() === "")
        err[f] = `${f} is required`;
    });
    if (Number(form.price) <= 0) err.price = "Enter a valid price";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = validate();
    setErrors(val);
    if (Object.keys(val).length) return;

    try {
      await API.put(`/products/${id}`, {
        ...form,
        price: Number(form.price),
      });
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch {
      toast.error("Update failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const menu = [
    { path: "/admin", label: "Dashboard", icon: <FaHome /> },
    { path: "/admin/products", label: "Products", icon: <FaBox /> },
    { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div>
          <div className="w-12 h-12 border-4 border-[#C9B59C] border-t-transparent animate-spin mx-auto rounded-full"></div>
          <p className="mt-3 text-[#5D4737]">Loading product...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all border-r z-40
        ${isSidebarOpen ? "w-64" : "w-20"}
        ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex justify-center items-center bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] rounded-full text-white">
              <FaTachometerAlt />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-[#5D4737]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#8B7355]">Edit Product</p>
              </div>
            )}
          </div>

          <button
            className="hidden lg:block"
            onClick={() => setSidebar(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menu.map((m) => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition
                ${
                  window.location.pathname === m.path
                    ? "bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white"
                    : "hover:bg-[#F9F8F6]"
                }`}
            >
              <span className="text-xl">{m.icon}</span>
              {isSidebarOpen && m.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t absolute bottom-0 w-full">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 p-3 bg-red-500 rounded-lg text-white"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MOBILE MENU */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow text-2xl"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* MAIN */}
      <main
        className={`${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } p-8 transition-all`}
      >
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 text-[#5D4737]"
        >
          <FaArrowLeft /> Back to Products
        </button>

        <div className="bg-white p-6 rounded-xl shadow border mt-4 mb-8">
          <h1 className="text-3xl font-bold text-[#5D4737]">Edit Product</h1>
          <p className="text-[#8B7355]">Update the fields below</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow border space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {["name", "price", "category", "image"].map((field) => (
              <div key={field}>
                <label className="font-medium text-[#5D4737] capitalize">
                  {field} *
                </label>
                <input
                  type={field === "price" ? "number" : "text"}
                  name={field}
                  value={form[field] || ""}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-3 rounded-lg bg-[#F9F8F6] border"
                />
                {errors[field] && (
                  <p className="text-red-500 text-sm">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="font-medium text-[#5D4737]">
              Description *
            </label>
            <textarea
              name="description"
              rows="4"
              value={form.description || ""}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-3 rounded-lg bg-[#F9F8F6] border"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white rounded-lg"
            >
              <FaSave /> Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminEditProduct;
