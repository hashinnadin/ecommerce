import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("admin");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });
  const [loading] = useState(false);

  // 🔹 USER LOGIN
  const loginUser = (userData, token, redirectPath = "/") => {
    // Don't store password in localStorage
    const { password: _, ...safeUserData } = userData;
    localStorage.setItem("user", JSON.stringify(safeUserData));
    if (token) {
      localStorage.setItem("token", token);
    }
    localStorage.removeItem("admin");

    setUser(safeUserData);
    setAdmin(null);

    toast.success("Login successful!");
    navigate(redirectPath);
  };

  // 🔹 ADMIN LOGIN
  const loginAdmin = (adminData, token, redirectPath = "/admin") => {
    localStorage.setItem("admin", JSON.stringify(adminData));
    if (token) {
      localStorage.setItem("token", token);
    }
    localStorage.removeItem("user");

    setAdmin(adminData);
    setUser(null);

    toast.success("Admin login successful!");
    navigate(redirectPath);
  };

  // 🔹 LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};