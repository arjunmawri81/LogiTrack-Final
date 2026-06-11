const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getWallet,
  rechargeWallet,
  getTransactions,
} = require("../controllers/walletController");

router.get("/", authMiddleware, getWallet);

router.post(
  "/recharge",
  authMiddleware,
  rechargeWallet
);

router.get(
  "/transactions",
  authMiddleware,
  getTransactions
);

module.exports = router;