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