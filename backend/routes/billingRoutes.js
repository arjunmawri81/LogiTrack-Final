const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getBillingSummary,
} = require("../controllers/billingController");

router.post(
  "/create",
  authMiddleware,
  createInvoice
);

router.get(
  "/",
  authMiddleware,
  getInvoices
);

router.get(
  "/summary",
  authMiddleware,
  getBillingSummary
);

module.exports = router;