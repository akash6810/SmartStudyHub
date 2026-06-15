import React, { useState } from "react";
import API from "../api/axiosConfig";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/Login.css"; // Make sure to import your new CSS file

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      toast.success(res.data.message);

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to homepage
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            required
          />

          <button className="login-button" type="submit">
            Login
          </button>

          {/* New Register Redirect Link */}
          <p className="register-prompt">
            Are you new?{" "}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;