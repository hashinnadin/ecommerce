import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBan,
  FaCheck,
  FaSearch,
  FaUser,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* 🔐 ADMIN AUTH CHECK */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Admin login required");
      navigate("/login");
    }
  }, [navigate]);

  /* 🔹 LOAD USERS */
  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:3002/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* 🔄 BLOCK / UNBLOCK */
  const toggleUserStatus = async (id, status) => {
    const newStatus = status === "active" ? "blocked" : "active";
    if (!window.confirm(`Are you sure you want to ${newStatus} this user?`))
      return;

    try {
      const res = await fetch(`http://localhost:3002/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();
      toast.success(`User ${newStatus} successfully`);
      loadUsers();
    } catch {
      toast.error(`Failed to ${newStatus} user`);
    }
  };

  /* 🔍 FILTER */
  const filteredUsers = users.filter((u) =>
    [u?.username, u?.email].some((v) =>
      v?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9B59C] border-t-transparent animate-spin rounded-full mx-auto"></div>
          <p className="mt-3 text-[#5D4737]">Loading users...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-xl z-40 transition-all
        ${isSidebarOpen ? "w-64" : "w-20"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
              <FaTachometerAlt />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-[#5D4737]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#8B7355]">Users</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

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
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg py-3"
          >
            <FaSignOutAlt />
            {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MOBILE TOGGLE */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-white p-2 shadow rounded-lg z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* MAIN */}
      <main
        className={`transition-all min-h-screen p-6 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#5D4737]">
            User Management
          </h1>
          <p className="text-[#8B7355] mb-6">
            Manage registered users
          </p>

          {/* SEARCH */}
          <div className="relative max-w-md mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg bg-white"
            />
          </div>

          {/* USERS TABLE */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F9F8F6] text-left">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Password</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-[#8B7355]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F9F8F6]">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex justify-center items-center rounded-full text-white">
                          <FaUser />
                        </div>
                      </td>
                      <td className="p-4">{u.username}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className="bg-[#F9F8F6] px-2 rounded text-sm">
                          {u.password}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.status === "blocked" ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <FaBan /> Blocked
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <FaCheck /> Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            toggleUserStatus(u.id, u.status || "active")
                          }
                          className={`px-4 py-2 rounded-lg text-white flex items-center gap-2
                          ${
                            u.status === "blocked"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {u.status === "blocked" ? (
                            <>
                              <FaUnlock /> Unblock
                            </>
                          ) : (
                            <>
                              <FaLock /> Block
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;
