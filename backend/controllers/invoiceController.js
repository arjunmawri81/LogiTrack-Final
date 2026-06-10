const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(
      req.params.id
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice Not Found",
      });
    }

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22)
      .text("LogiTrack Invoice");

    doc.moveDown();

    doc.text(
      `Invoice Number: ${invoice.invoiceNumber}`
    );

    doc.text(
      `Amount: ₹${invoice.amount}`
    );

    doc.text(
      `Status: ${invoice.status}`
    );

    doc.text(
      `Date: ${invoice.createdAt.toDateString()}`
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