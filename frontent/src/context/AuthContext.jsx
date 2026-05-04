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
  const loginUser = (userData) => {
    // Don't store password in localStorage
    const { password: _, ...safeUserData } = userData;
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};