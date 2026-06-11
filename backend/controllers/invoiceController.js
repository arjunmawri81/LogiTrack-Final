const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

// ================================
// DOWNLOAD INVOICE PDF
// ================================
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(
      req.params.id
    )
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

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

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

    doc.text(
      `Invoice Number: ${invoice.invoiceNumber}`
    );

    doc.text(
      `Invoice Date: ${invoice.createdAt.toDateString()}`
    );

    doc.text(
      `Status: ${invoice.status}`
    );

    doc.moveDown();

    // Merchant
    doc.fontSize(14).text(
      "Merchant Details"
    );

    doc.moveDown(0.5);

    doc.fontSize(12);

    doc.text(
      `Name: ${
        invoice.merchantId?.name || "-"
      }`
    );

    doc.text(
      `Email: ${
        invoice.merchantId?.email || "-"
      }`
    );

    doc.moveDown();

    // Charges
    doc.fontSize(14).text(
      "Billing Details"
    );

    doc.moveDown(0.5);

    doc.fontSize(12);

    doc.text(
      `Base Amount: ₹${invoice.amount}`
    );

    doc.text(
      `Tax Amount: ₹${
        invoice.taxAmount || 0
      }`
    );

    doc.text(
      `Shipping Charge: ₹${
        invoice.shippingCharge || 0
      }`
    );

    doc.moveDown();

    doc.fontSize(16);

    doc.text(
      `Total Amount: ₹${invoice.totalAmount}`
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  downloadInvoice,
};