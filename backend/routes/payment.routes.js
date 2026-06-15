const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authmiddleware");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

module.exports = router;