import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 INIT AUTH
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  // 🔹 USER LOGIN
  const loginUser = (userData) => {
    // Don't store password in localStorage
    const { password, ...safeUserData } = userData;
    localStorage.setItem("user", JSON.stringify(safeUserData));
    localStorage.removeItem("admin");

    setUser(safeUserData);
    setAdmin(null);

    toast.success("Login successful!");
    navigate("/");
  };

  // 🔹 ADMIN LOGIN
  const loginAdmin = (adminData) => {
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.removeItem("user");

    setAdmin(adminData);
    setUser(null);

    toast.success("Admin login successful!");
    navigate("/admin");
  };

  // 🔹 LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");

    setUser(null);
    setAdmin(null);

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        loginUser,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};