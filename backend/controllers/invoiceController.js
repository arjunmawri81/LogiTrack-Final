const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

// ================================
// DOWNLOAD INVOICE PDF
// ================================
const downloadInvoice = async (req, res) => {
  try {
    // ✅ FIX 1: Security - Find invoice by ID AND merchantId
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    })
      .populate("merchantId")
      .populate("orderId")
      .populate("shipmentId");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice Not Found or Unauthorized",
      });
    }

    // Check if order exists before accessing its fields
    if (!invoice.orderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this invoice",
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
      .text("INVOICE", {
        align: "center",
      });

    doc.moveDown(2);

    // Invoice Details
    doc.fontSize(12);

    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(
      `Invoice Date: ${invoice.createdAt ? invoice.createdAt.toDateString() : 'N/A'}`
    );
    doc.text(`Status: ${invoice.status}`);
    doc.text(`Payment Method: ${invoice.paymentMethod || 'N/A'}`);

    doc.moveDown();

    // Order Details
    doc.fontSize(14).text("Order Details");
    doc.moveDown(0.5);

    doc.fontSize(12);
    
    const order = invoice.orderId;
    doc.text(`Order Number: ${order.orderNumber || 'N/A'}`);
    doc.text(`Customer Name: ${order.customerName || 'N/A'}`);
    doc.text(`Customer Phone: ${order.customerPhone || 'N/A'}`);
    doc.text(`Customer Address: ${order.customerAddress || 'N/A'}`);
    
    if (order.awb) {
      doc.text(`AWB: ${order.awb}`);
    }
    
    if (order.courierPartner) {
      doc.text(`Courier: ${order.courierPartner}`);
    }

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

    doc.text(`Base Amount: ₹${invoice.amount || 0}`);

    doc.text(
      `Tax Amount (18%): ₹${invoice.taxAmount || 0}`
    );

    doc.text(
      `Shipping Charge: ₹${invoice.shippingCharge || 0}`
    );

    if (invoice.insuranceCharge) {
      doc.text(
        `Insurance Charge: ₹${invoice.insuranceCharge || 0}`
      );
    }

    doc.moveDown();

    // Draw a line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.5);

    doc.fontSize(16);

    // ✅ FIX 2: Use invoice.totalAmount if available, else calculate
    const totalAmount =
      invoice.totalAmount ??
      (
        (invoice.amount || 0) +
        (invoice.taxAmount || 0) +
        (invoice.shippingCharge || 0) +
        (invoice.insuranceCharge || 0)
      );

    doc.text(
      `Total Amount: ₹${totalAmount.toFixed(2)}`,
      { align: "right" }
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
    console.log("REQ USER ID =>", req.user.id);

    const invoices = await Invoice.find({
      merchantId: req.user.id,
    })
      .populate("orderId")
      .populate("shipmentId")
      .sort({ createdAt: -1 });

    console.log("INVOICES FOUND =>", invoices.length);

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
    console.log("GET INVOICE SUMMARY ERROR =>", error);

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