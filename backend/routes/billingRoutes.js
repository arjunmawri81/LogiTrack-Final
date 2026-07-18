/**
 * @deprecated billingRoutes is a legacy duplicate of invoiceRoutes.
 * Use /api/invoices for all invoice/billing operations.
 * This route will be removed after frontend migration is complete.
 */
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");


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