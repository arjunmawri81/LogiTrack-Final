const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

// ================================
// DOWNLOAD INVOICE PDF
// ================================
const downloadInvoice = async (req, res) => {
  try {
    // Security - Find invoice by ID AND merchantId
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
      `attachment; filename="${invoice.invoiceNumber}.pdf"`
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
    const shipment = invoice.shipmentId;
    doc.text(`Order Number: ${order?.orderNumber || 'N/A'}`);
    doc.text(`Customer Name: ${order?.customerName || 'N/A'}`);
    doc.text(`Customer Phone: ${order?.customerPhone || 'N/A'}`);
    doc.text(`Customer Address: ${order?.customerAddress || 'N/A'}`);
    
    if (shipment?.awb) {
      doc.text(`AWB: ${shipment.awb}`);
    }
    
    if (shipment?.courier) {
      doc.text(`Courier: ${shipment.courier}`);
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

    doc.moveDown();

    // Draw a line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.5);

    doc.fontSize(16);

    //  Use invoice.totalAmount if available, else calculate
    const totalAmount =
      invoice.totalAmount ??
      (
        (invoice.amount || 0) +
        (invoice.shippingCharge || 0) +
        (invoice.taxAmount || 0) +
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
    console.error("DOWNLOAD INVOICE ERROR =>", error);

    // Prevent double-header crash if PDF pipe already started
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// ================================
// GET ALL INVOICES
// ================================
const getInvoices = async (req, res) => {
  try {
    const { year, month } = req.query;

    const filter = { merchantId: req.user.id };

    // Billing Cycle filtering
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);

      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 1);
        filter.createdAt = { $gte: startDate, $lt: endDate };
      }
    }

    const invoices = await Invoice.find(filter)
      .populate("orderId")
      .populate("shipmentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("GET INVOICES ERROR =>", error);

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
    const { year, month } = req.query;

    const matchStage = { merchantId: req.user._id || req.user.id };

    // Billing Cycle filtering (same logic as getInvoices)
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);

      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 1);
        matchStage.createdAt = { $gte: startDate, $lt: endDate };
      }
    }

    // Ensure we are matching on the correct ObjectId type if needed, but Mongoose usually handles this. Let's cast it just in case.
    const mongoose = require("mongoose");
    const merchantObjectId = new mongoose.Types.ObjectId(req.user.id);
    matchStage.merchantId = merchantObjectId;

    const summary = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          paidInvoices: {
            $sum: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] },
          },
          pendingInvoices: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          totalRevenue: { 
            $sum: { 
              $ifNull: [
                "$totalAmount", 
                { $add: [
                    { $ifNull: ["$amount", 0] },
                    { $ifNull: ["$shippingCharge", 0] },
                    { $ifNull: ["$taxAmount", 0] },
                    { $ifNull: ["$insuranceCharge", 0] }
                  ]
                }
              ] 
            } 
          },
        },
      },
    ]);

    const result = summary[0] || {
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      totalRevenue: 0,
    };

    res.status(200).json({
      success: true,
      totalInvoices: result.totalInvoices,
      paidInvoices: result.paidInvoices,
      pendingInvoices: result.pendingInvoices,
      totalRevenue: result.totalRevenue,
    });
  } catch (error) {
    console.error("GET INVOICE SUMMARY ERROR =>", error);

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