const Razorpay = require("razorpay");
const crypto = require("crypto");
const Pdf = require("../models/Pdf");
const User = require("../models/User"); // Ensure this matches your User model filename

// Initialize Razorpay with your .env keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. CREATE ORDER (Sent to Razorpay before checkout opens)
const createOrder = async (req, res) => {
  try {
    const { pdfId } = req.body;
    
    // Find the PDF the user wants to buy
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    // Razorpay requires the amount in PAISE (smallest currency unit)
    // So ₹50 must be sent as 5000 paise.
    const amountInPaise = pdf.price * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_pdf_${pdf._id}`,
    };

    // Ask Razorpay to create the order
    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.status(200).json({ success: true, order, pdf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY PAYMENT (Called after user pays on the frontend)
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pdfId } = req.body;
    const buyerId = req.user.id; // From your authMiddleware

    // Create our own signature to compare with Razorpay's to prevent hackers
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // ✅ PAYMENT SUCCESSFUL! 
      const pdf = await Pdf.findById(pdfId);
      
      // Calculate the 80/20 Split (Wallet System)
      const platformFee = pdf.price * 0.20;
      const sellerEarnings = pdf.price * 0.80;

      // Update the Seller's Wallet (assuming you add a walletBalance field to your User model)
       await User.findByIdAndUpdate(pdf.user_id, { $inc: { walletBalance: sellerEarnings } });

      // Update the Buyer's profile to give them access (assuming a purchasedPdfs array in User model)
       await User.findByIdAndUpdate(buyerId, { $push: { purchasedPdfs: pdfId } });

       // Increment the sales count on the PDF itself
      await Pdf.findByIdAndUpdate(pdfId, { $inc: { salesCount: 1 } });

      res.status(200).json({
        success: true,
        message: "Payment verified! You can now view the PDF.",
      });

    } else {
      res.status(400).json({ success: false, message: "Fake payment detected!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };