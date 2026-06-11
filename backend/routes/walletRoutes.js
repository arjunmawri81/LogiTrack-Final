const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getWallet,
  rechargeWallet,
  getTransactions,
  debitWallet,
  getWalletSummary,
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

module.exports = router;