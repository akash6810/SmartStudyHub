import React, { useState } from "react";
import API from "../api/axiosConfig";

import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../Styles/Register.css"; 

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/register",
        formData
      );

      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration Failed"
      );
    }
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/verifyEmail",
        {
          code: otp,
        }
      );

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">
          {step === 1 ? "Register" : "Verify OTP"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Enter Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="register-input"
              required
            />

            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="register-input"
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="register-input"
              required
            />

            <button className="register-button" type="submit">
              Register
            </button>

            {/* Login Redirect Link */}
            <p className="login-prompt">
              Already have an account?{" "}
              <Link to="/" className="login-link">
                Login here
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="register-input"
              required
            />

            <button className="register-button" type="submit">
              Verify Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;