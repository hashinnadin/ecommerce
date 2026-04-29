import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBox,
  FaHome,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
} from "react-icons/fa";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebar] = useState(true);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  /* 🔹 LOAD PRODUCTS */
  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:3002/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* 🗑 DELETE PRODUCT */
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:3002/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Product deleted!");
      loadProducts();
    } catch {
      toast.error("Error deleting product!");
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

  /* 🔍 FILTER */
  const filtered = products.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <div className="w-12 h-12 border-4 border-[#C9B59C] border-t-transparent animate-spin rounded-full mx-auto"></div>
          <p className="text-[#5D4737] mt-3">Loading products...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
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
                <h1 className="text-xl font-bold text-[#5D4737]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#8B7355]">Products</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebar(!isSidebarOpen)}
            className="hidden lg:block"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[75vh]">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg
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
              className="mt-6 w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg"
            >
              <FaPlus /> Add Product
            </button>
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t absolute bottom-0 w-full">
          <button
            onClick={logoutAdmin}
            className="w-full flex justify-center items-center gap-3 p-3 bg-red-500 text-white rounded-lg"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MOBILE TOGGLE */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-white p-2 text-2xl rounded shadow"
        onClick={() => setMobileMenu(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* MAIN */}
      <main
        className={`transition-all min-h-screen ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white py-6 px-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">Product Management</h1>
              <p className="opacity-90">Manage your product catalog</p>
            </div>
            <button
              onClick={() => navigate("/admin/products/add")}
              className="bg-white text-[#5D4737] px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Add Product
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]" />
            <input
              placeholder="Search by name or category..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="max-w-7xl mx-auto px-6 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-[#8B7355]">
              <FaBox className="text-5xl mx-auto opacity-50" />
              <p className="text-lg mt-2">No products found</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow border hover:shadow-lg"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg truncate">{p.name}</h3>
                    <span className="text-emerald-600 font-semibold">
                      ₹{p.price}
                    </span>
                  </div>

                  <p className="text-sm text-[#8B7355] line-clamp-2 my-2">
                    {p.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-[#EFE9E3] rounded-full text-sm">
                      {p.category}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/products/edit/${p.id}`)
                        }
                        className="p-2 bg-blue-500 text-white rounded-lg"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 bg-red-500 text-white rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminProducts;
