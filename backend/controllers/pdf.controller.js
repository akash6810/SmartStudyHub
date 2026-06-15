const Pdf = require("../models/Pdf");
const User = require("../models/User")
const uploadPdf = async (req, res) => {
  try {
    const fileUrl = req.file.path;
    // Extract title and price from the form data sent by the frontend
    const { title, price } = req.body; 

    if (!title) {
      return res.status(400).json({ message: "PDF title is required!" });
    }

    const pdf = new Pdf({
      user_id: req.user.id, 
      title, 
      price: price || 0,
      fileUrl,
    });

    await pdf.save();

    res.status(200).json({
      message: "PDF uploaded successfully!!",
      fileUrl,
      pdf
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PDFs (Your existing code here is fine)
const getAllPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pdfs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET ONLY LOGGED-IN USER'S PDFs
const getMyPdfs = async (req, res) => {
  try {
    // req.user.id comes from your authMiddleware
    const pdfs = await Pdf.find({ user_id: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pdfs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PDF DETAILS (Title & Price)
const updatePdf = async (req, res) => {
  try {
    const { title, price } = req.body;
    const pdfId = req.params.id;

    // Find the PDF by ID AND ensure the user_id matches the logged-in user
    // This prevents someone from bypassing the UI using Postman to edit others' files
    const updatedPdf = await Pdf.findOneAndUpdate(
      { _id: pdfId, user_id: req.user.id }, 
      { title, price },
      { new: true } // Returns the newly updated document
    );

    if (!updatedPdf) {
      return res.status(404).json({ message: "PDF not found or you are unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "PDF updated successfully!",
      pdf: updatedPdf,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPurchasedPdfs = async (req, res) => {
  try {
    // Find the user by ID and populate the 'purchasedPdfs' array
    // populate() replaces the object IDs with the actual PDF documents
    const user = await User.findById(req.user.id).populate("purchasedPdfs");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      purchasedPdfs: user.purchasedPdfs, // This now contains the full PDF objects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getSellerStats = async (req, res) => {
  try {
    // 1. Get the seller's profile to see their total wallet balance
    const user = await User.findById(req.user.id);
    
    // 2. Get all PDFs uploaded by this seller
    const myPdfs = await Pdf.find({ user_id: req.user.id }).sort({ createdAt: -1 });

    // 3. Calculate total number of sales across all their PDFs
    const totalSales = myPdfs.reduce((sum, pdf) => sum + (pdf.salesCount || 0), 0);

    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance || 0,
      totalSales,
      myPdfs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Don't forget to export the new functions!
module.exports = { uploadPdf, getAllPdfs, getMyPdfs, updatePdf, getPurchasedPdfs, getSellerStats };
