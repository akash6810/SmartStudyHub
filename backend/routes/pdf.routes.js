const express = require("express");
const authMiddleware = require("../middlewares/authmiddleware")
const router = express.Router();

const upload = require("../middlewares/upload");
const { uploadPdf, getAllPdfs, getMyPdfs, updatePdf, getPurchasedPdfs, getSellerStats } = require("../controllers/pdf.controller");

router.post("/upload", authMiddleware, upload.single("file"), uploadPdf);

// Get All PDFs
router.get("/all-pdfs", getAllPdfs);


router.get("/my-pdfs", authMiddleware, getMyPdfs);
router.put("/update/:id", authMiddleware, updatePdf);
router.get("/purchased", authMiddleware, getPurchasedPdfs);
router.get("/seller-stats", authMiddleware, getSellerStats);

module.exports = router;
