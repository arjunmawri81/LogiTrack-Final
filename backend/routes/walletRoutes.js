const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getWallet,
  rechargeWallet,
  getTransactions,
  debitWallet,
  getWalletSummary,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} = require("../controllers/walletController");

// ================================
// GET WALLET
// ================================
router.get(
  "/",
  authMiddleware,
  getWallet
);

// ================================
// RECHARGE WALLET (DISABLED FOR SECURITY - MUST USE RAZORPAY)
// ================================
// Unverified direct credit disabled to prevent unauthorized wallet manipulation
// router.post("/recharge", authMiddleware, rechargeWallet);

// ================================
// DEBIT WALLET
// ================================
router.post(
  "/debit",
  authMiddleware,
  debitWallet
);

// ================================
// GET TRANSACTIONS
// ================================
router.get(
  "/transactions",
  authMiddleware,
  getTransactions
);

// ================================
// WALLET SUMMARY
// ================================
router.get(
  "/summary",
  authMiddleware,
  getWalletSummary
);

// ================================
// RAZORPAY - CREATE ORDER
// ================================
router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrder
);

// ================================
// RAZORPAY - VERIFY PAYMENT
// ================================
router.post(
  "/verify-payment",
  authMiddleware,
  verifyRazorpayPayment
);

// ================================
// RAZORPAY - WEBHOOK FALLBACK
// ================================
router.post(
  "/webhook",
  handleRazorpayWebhook
);

module.exports = router;