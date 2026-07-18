/**
 * @deprecated billingController is a legacy duplicate of invoiceController.
 *
 * This controller has no billing-cycle filtering, no PDF generation, and no populate.
 * All new billing logic should go through invoiceController (/api/invoices).
 *
 * Migration path:
 *   POST /api/billing/create   → (invoices are auto-created on shipment)
 *   GET  /api/billing          → GET /api/invoices?year=YYYY&month=MM
 *   GET  /api/billing/summary  → GET /api/invoices/summary?year=YYYY&month=MM
 *
 * This file will be removed once no frontend page calls /api/billing.
 */
const Invoice = require("../models/Invoice");

// Create Invoice
const createInvoice = async (req, res) => {
  try {
    const { amount } = req.body;

    const invoiceNumber =
      "INV" +
      Math.floor(
        100000 + Math.random() * 900000
      );

    const invoice = await Invoice.create({
      invoiceNumber,
      merchantId: req.user.id,
      amount,
      status: "PAID",
    });

    res.status(201).json({
      success: true,
      message: "Invoice Created Successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      merchantId: req.user.id,
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Billing Summary
const getBillingSummary = async (
  req,
  res
) => {
  try {
    const invoices = await Invoice.find({
      merchantId: req.user.id,
    });

    const totalRevenue =
      invoices.reduce(
        (sum, invoice) =>
          sum + invoice.amount,
        0
      );

    res.status(200).json({
      success: true,
      totalInvoices: invoices.length,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getBillingSummary,
};