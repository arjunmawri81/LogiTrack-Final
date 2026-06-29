const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

// ================================
// DOWNLOAD INVOICE PDF
// ================================
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("merchantId")
      .populate("orderId");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice Not Found",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .text("LOGITRACK", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(18)
      .text("Invoice", {
        align: "center",
      });

    doc.moveDown(2);

    // Invoice Details
    doc.fontSize(12);

    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(
      `Invoice Date: ${invoice.createdAt.toDateString()}`
    );
    doc.text(`Status: ${invoice.status}`);

    doc.moveDown();

    // Merchant Details
    doc.fontSize(14).text("Merchant Details");
    doc.moveDown(0.5);

    doc.fontSize(12);

    doc.text(
      `Name: ${invoice.merchantId?.name || "-"}`
    );

    doc.text(
      `Email: ${invoice.merchantId?.email || "-"}`
    );

    doc.moveDown();

    // Billing Details
    doc.fontSize(14).text("Billing Details");
    doc.moveDown(0.5);

    doc.fontSize(12);

    doc.text(`Base Amount: ₹${invoice.amount}`);

    doc.text(
      `Tax Amount: ₹${invoice.taxAmount || 0}`
    );

    doc.text(
      `Shipping Charge: ₹${invoice.shippingCharge || 0}`
    );

    doc.moveDown();

    doc.fontSize(16);

    doc.text(
      `Total Amount: ₹${invoice.totalAmount || 0}`
    );

    doc.moveDown(2);

    doc
      .fontSize(10)
      .text(
        "Thank you for using LogiTrack.",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.log("DOWNLOAD INVOICE ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET ALL INVOICES
// ================================
const getInvoices = async (req, res) => {
  try {
    console.log(
      "REQ USER ID =>",
      req.user.id
    );

    // ✅ FIX: Added populate("shipmentId") to get shipment details
    const invoices = await Invoice.find({
      merchantId: req.user.id,
    })
      .populate("orderId")
      .populate("shipmentId")  // ← THIS WAS MISSING
      .sort({ createdAt: -1 });

    console.log(
      "INVOICES FOUND =>",
      invoices.length
    );

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.log("GET INVOICES ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET INVOICE SUMMARY
// ================================
const getInvoiceSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      merchantId: req.user.id,
    });

    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(
      (i) => i.status === "PAID"
    ).length;

    const pendingInvoices = invoices.filter(
      (i) => i.status === "PENDING"
    ).length;

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum + (invoice.totalAmount || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue,
    });
  } catch (error) {
    console.log(
      "GET INVOICE SUMMARY ERROR =>",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  downloadInvoice,
  getInvoices,
  getInvoiceSummary,
};