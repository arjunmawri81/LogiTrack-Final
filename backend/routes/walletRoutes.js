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
// RECHARGE WALLET
// ================================
router.post(
  "/recharge",
  authMiddleware,
  rechargeWallet
);

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

module.exports = router;