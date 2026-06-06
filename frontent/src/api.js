import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.error || "Session expired";
      const isSessionCheck = error.config?.headers?.["X-Session-Check"] === "true";

      if (!isSessionCheck) {
        toast.error(message);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");

      if (!isSessionCheck && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
