import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.username.trim())
      newErrors.username = "Username is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      setLoading(false);
      return;
    }

    try {
      // 🔹 CHECK EXISTING USER
      const userCheck = await API.get(
        `/users?email=${form.email}`
      );

      if (userCheck.data.length > 0) {
        toast.error("Email already registered!");
        setLoading(false);
        return;
      }

      // 🔹 CREATE USER
      await API.post("/users", {
        username: form.username,
        email: form.email,
        password: form.password,
        status: "active",
        cart: [],
        wishlist: [],
        orders: [],
        createdAt: new Date().toISOString(),
      });

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          disabled={loading}
          className="w-full p-3 border rounded mb-3"
        />
        {errors.username && (
          <p className="text-red-500">{errors.username}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full p-3 border rounded mb-3"
        />
        {errors.email && (
          <p className="text-red-500">{errors.email}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full p-3 border rounded mb-3"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password}</p>
        )}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          className="w-full p-3 border rounded mb-4"
        />
        {errors.confirmPassword && (
          <p className="text-red-500">
            {errors.confirmPassword}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9B59C] text-white py-3 rounded"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default Register;
