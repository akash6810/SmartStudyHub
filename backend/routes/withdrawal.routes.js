const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authmiddleware"); 
const adminMiddleware = require("../middlewares/adminMiddleware")
const { requestWithdrawal, getAdminWithdrawRequests, updateWithdrawalStatus } = require("../controllers/withdrawal.controller");

router.post("/request", authMiddleware, requestWithdrawal);
router.get("/admin/all", authMiddleware,adminMiddleware, getAdminWithdrawRequests);
router.post("/admin/update", authMiddleware,adminMiddleware, updateWithdrawalStatus);

module.exports = router;