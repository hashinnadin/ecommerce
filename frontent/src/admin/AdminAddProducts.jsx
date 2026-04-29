import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function AdminAddProducts() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [isSidebarOpen, setSidebar] = useState(true);
  const [isMobileMenuOpen, setMobile] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Product name is required";
    if (!Number(form.price) || Number(form.price) <= 0)
      err.price = "Valid price is required";
    if (!form.category.trim()) err.category = "Category is required";
    if (!form.image.trim()) err.image = "Image URL is required";
    if (!form.description.trim())
      err.description = "Description is required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const val = validate();
    setErrors(val);
    if (Object.keys(val).length > 0) return;

    const newProduct = {
      id: Date.now().toString(),
      ...form,
      price: Number(form.price),
      rating: 4.5,
    };

    try {
      await API.post("/products", newProduct);
      toast.success("Product added!");
      navigate("/admin/products");
    } catch {
      toast.error("Error adding product");
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-xl z-40 transition-all
        ${isSidebarOpen ? "w-64" : "w-20"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
              <FaTachometerAlt />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-[#5D4737]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#8B7355]">Add Product</p>
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
              className={`w-full flex gap-3 items-center p-3 rounded-lg transition
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
            className="w-full flex items-center justify-center gap-3 p-3 bg-red-500 text-white rounded-lg"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MOBILE MENU */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-2xl bg-white p-2 rounded shadow"
        onClick={() => setMobile(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobile(false)}
        ></div>
      )}

      {/* MAIN */}
      <main
        className={`${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } transition-all p-8 w-full`}
      >
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 text-[#5D4737]"
        >
          <FaArrowLeft /> Back to Products
        </button>

        <div className="bg-white p-6 rounded-xl shadow border mt-4 mb-8">
          <h1 className="text-3xl font-bold text-[#5D4737]">
            Add New Product
          </h1>
          <p className="text-[#8B7355]">Fill in the details</p>
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {["name", "price", "category", "image"].map((field) => (
                <div key={field}>
                  <label className="font-medium text-[#5D4737] capitalize">
                    {field === "image" ? "Image URL *" : field + " *"}
                  </label>
                  <input
                    type={field === "price" ? "number" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-3 bg-[#F9F8F6] border rounded-lg"
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[field]}
                    </p>
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
                value={form.description}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 bg-[#F9F8F6] border rounded-lg"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-3 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white rounded-lg flex items-center gap-2"
              >
                <FaSave /> Add Product
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminAddProducts;
