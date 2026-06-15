const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

// 1. User requests a withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, upiId, accountNumber, ifscCode, accountHolderName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate balance
    if (amount > user.walletBalance) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance!" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Enter a valid amount above ₹0" });
    }

    // Deduct amount from user's current wallet balance immediately
    user.walletBalance -= amount;
    await user.save();

    // Save the request
    const withdrawalRequest = new Withdrawal({
      user_id: req.user.id,
      amount,
      paymentMethod,
      details: { upiId, accountNumber, ifscCode, accountHolderName }
    });

    await withdrawalRequest.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal request submitted! It will be reviewed by the admin.",
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Admin fetches all withdrawal requests to process them
const getAdminWithdrawRequests = async (req, res) => {
  try {
    const requests = await Withdrawal.find().populate("user_id", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin updates status (Approved / Rejected)
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body; // status can be "Approved" or "Rejected"
    
    const request = await Withdrawal.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "Pending") return res.status(400).json({ success: false, message: "Request already processed" });

    request.status = status;
    await request.save();

    // If rejected, refund the money back to the user's wallet balance
    if (status === "Rejected") {
      await User.findByIdAndUpdate(request.user_id, { $inc: { walletBalance: request.amount } });
    }

    res.status(200).json({ success: true, message: `Request successfully marked as ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { requestWithdrawal, getAdminWithdrawRequests, updateWithdrawalStatus };