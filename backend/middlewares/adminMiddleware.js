const User = require("../models/User"); // Ensure path matches your project structure

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user.id comes from your main authMiddleware which runs right before this
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if the user has admin credentials
    if (user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied! You do not have administrator privileges." 
      });
    }

    // If they are an admin, let them through to the controller!
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Admin verification error: " + error.message });
  }
};

module.exports = adminMiddleware;