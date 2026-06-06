import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/user/dashboard", {
          headers: { "X-Session-Check": "true" },
        });
        const role = res.data.role;

        if (role === "admin") {
          const storedAdmin = localStorage.getItem("admin");
          setAdmin(
            storedAdmin
              ? JSON.parse(storedAdmin)
              : { role: "admin", name: res.data.name, id: res.data.user_id }
          );
          setUser(null);
        } else {
          const storedUser = localStorage.getItem("user");
          const userData = storedUser ? JSON.parse(storedUser) : {};
          setUser({
            ...userData,
            id: res.data.user_id,
            name: res.data.name,
            role: res.data.role,
          });
          setAdmin(null);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");
        setUser(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const loginUser = (userData, token, redirectPath = "/") => {
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
