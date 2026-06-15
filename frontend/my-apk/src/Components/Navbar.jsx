import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../Styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Check if a token exists in local storage to see if the user is logged in
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem("token");

    // 2. Show a success message
    toast.success("Logged out successfully!");

    // 3. Redirect the user back to the login page
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <h2>SmartStudyHub</h2>

      {/* Nav Links */}
      <div className="nav-links">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/upload-notes" className="nav-link">Upload Notes</Link>
        <Link to="/edit-notes" className="nav-link">Edit Notes</Link>
        <Link to="/my-notes" className="nav-link">My Purchases</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/chat" className="nav-link">Chat Room</Link>

        {/* Conditional Rendering: Show Logout if token exists, otherwise show Login */}
        {token ? (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        ) : (
          <Link to="/" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;