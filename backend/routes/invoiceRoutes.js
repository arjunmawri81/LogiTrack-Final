const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  downloadInvoice,
  getInvoices,
  getInvoiceSummary,
} = require("../controllers/invoiceController");

// Get All Invoices
router.get(
  "/",
  authMiddleware,
  getInvoices
);

// Invoice Summary
router.get(
  "/summary",
  authMiddleware,
  getInvoiceSummary
);

// Download Invoice PDF
router.get(
  "/:id/download",
  authMiddleware,
  downloadInvoice
);

module.exports = router;