const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");

// ================================
// DOWNLOAD INVOICE PDF (PREMIUM STYLED)
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

    if (!invoice.orderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this invoice",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber}.pdf"`
    );

    doc.pipe(res);

    const boldFont = "Helvetica-Bold";
    const regularFont = "Helvetica";

    // 1. TOP HEADER BANNER
    // Top primary dark banner
    doc.rect(0, 0, 595, 75).fill("#0f172a");
    // Top orange accent line
    doc.rect(0, 0, 595, 4).fill("#f97316");

    // Header Logo / Company Name
    doc
      .fillColor("#ffffff")
      .font(boldFont)
      .fontSize(22)
      .text("LOGITRACK", 40, 22, { align: "left" });

    doc
      .fillColor("#f97316")
      .font(boldFont)
      .fontSize(7)
      .text("EXPRESS LOGISTICS & FREIGHT SOLUTIONS", 40, 48, { align: "left" });

    // "TAX INVOICE" Badge Title on top right
    doc
      .fillColor("#ffffff")
      .font(boldFont)
      .fontSize(16)
      .text("TAX INVOICE", 400, 26, { width: 155, align: "right" });

    // 2. INVOICE META BAR (Card Box)
    const metaY = 90;
    doc
      .roundedRect(40, metaY, 515, 54, 8)
      .fillAndStroke("#f8fafc", "#e2e8f0");

    const formattedDate = invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const isPaid = (invoice.status || "").toUpperCase() === "PAID";
    const statusBg = isPaid ? "#dcfce7" : "#fef3c7";
    const statusColor = isPaid ? "#166534" : "#92400e";

    // Column 1: Invoice Number & Date
    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8)
      .text("INVOICE NO:", 55, metaY + 12);
    doc
      .fillColor("#0f172a")
      .font(boldFont)
      .fontSize(9)
      .text(invoice.invoiceNumber || "N/A", 55, metaY + 24);

    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8)
      .text("DATE:", 220, metaY + 12);
    doc
      .fillColor("#0f172a")
      .font(boldFont)
      .fontSize(9)
      .text(formattedDate, 220, metaY + 24);

    // Column 2: Payment Method
    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8)
      .text("PAYMENT MODE:", 340, metaY + 12);
    doc
      .fillColor("#0f172a")
      .font(boldFont)
      .fontSize(9)
      .text((invoice.paymentMethod || "PREPAID").toUpperCase(), 340, metaY + 24);

    // Column 3: Status Badge
    doc
      .roundedRect(455, metaY + 14, 85, 24, 6)
      .fill(statusBg);

    doc
      .fillColor(statusColor)
      .font(boldFont)
      .fontSize(9)
      .text((invoice.status || "UNPAID").toUpperCase(), 455, metaY + 21, {
        width: 85,
        align: "center",
      });

    // 3. BILLED FROM & BILLED TO SECTIONS
    const detailsY = 160;

    // Billed From (Merchant Details)
    doc
      .fillColor("#ea580c")
      .font(boldFont)
      .fontSize(9)
      .text("BILLED FROM (MERCHANT)", 40, detailsY);

    doc.rect(40, detailsY + 14, 245, 1).fill("#cbd5e1");

    const merchantName =
      invoice.merchantId?.companyName ||
      invoice.merchantId?.name ||
      "Merchant Account";
    const merchantEmail = invoice.merchantId?.email || "-";
    const merchantPhone = invoice.merchantId?.phone || "-";
    const merchantAddress = invoice.merchantId?.address || "-";

    doc
      .fillColor("#0f172a")
      .font(boldFont)
      .fontSize(10)
      .text(merchantName, 40, detailsY + 22, { width: 245 });

    doc
      .fillColor("#475569")
      .font(regularFont)
      .fontSize(8.5)
      .text(`Email: ${merchantEmail}`, 40, detailsY + 36, { width: 245 })
      .text(`Phone: ${merchantPhone}`, 40, detailsY + 49, { width: 245 })
      .text(`Address: ${merchantAddress}`, 40, detailsY + 62, { width: 245, height: 26 });

    // Billed To (Customer Details)
    const order = invoice.orderId;
    const shipment = invoice.shipmentId;

    doc
      .fillColor("#ea580c")
      .font(boldFont)
      .fontSize(9)
      .text("BILLED TO (CUSTOMER)", 310, detailsY);

    doc.rect(310, detailsY + 14, 245, 1).fill("#cbd5e1");

    const customerName = order?.customerName || "Valued Customer";
    const customerPhone = order?.customerPhone || "-";
    const customerAddress = order?.customerAddress || "-";
    const awb = shipment?.awb ? `AWB: ${shipment.awb}` : "";
    const courier = shipment?.courier ? ` (${shipment.courier})` : "";

    doc
      .fillColor("#0f172a")
      .font(boldFont)
      .fontSize(10)
      .text(customerName, 310, detailsY + 22, { width: 245 });

    doc
      .fillColor("#475569")
      .font(regularFont)
      .fontSize(8.5)
      .text(`Phone: ${customerPhone}`, 310, detailsY + 36, { width: 245 })
      .text(`Address: ${customerAddress}`, 310, detailsY + 49, { width: 245, height: 26 });

    if (awb) {
      doc
        .fillColor("#0f172a")
        .font(boldFont)
        .fontSize(8.5)
        .text(`${awb}${courier}`, 310, detailsY + 77, { width: 245 });
    }

    // 4. ITEMIZED TABLE
    const tableY = 265;

    // Table Header
    doc.rect(40, tableY, 515, 22).fill("#0f172a");

    doc
      .fillColor("#ffffff")
      .font(boldFont)
      .fontSize(8.5)
      .text("ITEM / DESCRIPTION", 50, tableY + 6, { width: 230, align: "left" })
      .text("ORDER NO / AWB", 280, tableY + 6, { width: 140, align: "left" })
      .text("QTY", 420, tableY + 6, { width: 35, align: "center" })
      .text("AMOUNT", 460, tableY + 6, { width: 85, align: "right" });

    // Table Items
    let currentItemY = tableY + 28;

    const itemsList = order?.items || [];
    if (itemsList.length > 0) {
      itemsList.forEach((item, index) => {
        const itemDesc = item.name || item.productName || item.sku || `Product ${index + 1}`;
        const itemQty = item.quantity || 1;
        const itemPrice = item.price || item.amount || 0;
        const itemTotal = itemPrice * itemQty;

        doc
          .fillColor("#0f172a")
          .font(regularFont)
          .fontSize(8.5)
          .text(itemDesc, 50, currentItemY, { width: 220 })
          .text(order?.orderNumber || "N/A", 280, currentItemY, { width: 140 })
          .text(itemQty.toString(), 420, currentItemY, { width: 35, align: "center" })
          .text(`₹${itemTotal.toFixed(2)}`, 460, currentItemY, { width: 85, align: "right" });

        currentItemY += 20;

        doc.rect(40, currentItemY - 4, 515, 0.5).fill("#e2e8f0");
      });
    } else {
      // Default single shipment row if items array is missing
      const orderNoStr = order?.orderNumber || "N/A";
      const awbStr = shipment?.awb ? `\nAWB: ${shipment.awb}` : "";
      const baseAmt = invoice.amount || 0;

      doc
        .fillColor("#0f172a")
        .font(regularFont)
        .fontSize(8.5)
        .text(`Freight & Logistics Charges`, 50, currentItemY, { width: 220 })
        .text(`${orderNoStr}${awbStr}`, 280, currentItemY, { width: 140 })
        .text("1", 420, currentItemY, { width: 35, align: "center" })
        .text(`₹${baseAmt.toFixed(2)}`, 460, currentItemY, { width: 85, align: "right" });

      currentItemY += 24;

      doc.rect(40, currentItemY - 4, 515, 0.5).fill("#e2e8f0");
    }

    // 5. SUMMARY & TOTALS CARD
    const summaryY = Math.max(currentItemY + 15, 350);
    const summaryX = 310;
    const summaryWidth = 245;

    doc
      .roundedRect(summaryX, summaryY, summaryWidth, 120, 8)
      .fillAndStroke("#f8fafc", "#e2e8f0");

    const baseAmount = invoice.amount || 0;
    const taxAmount = invoice.taxAmount || 0;
    const shippingCharge = invoice.shippingCharge || 0;
    const totalAmount =
      invoice.totalAmount ??
      (baseAmount + taxAmount + shippingCharge + (invoice.insuranceCharge || 0));

    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8.5)
      .text("Base Amount:", summaryX + 15, summaryY + 12);
    doc
      .fillColor("#0f172a")
      .font(regularFont)
      .fontSize(8.5)
      .text(`₹${baseAmount.toFixed(2)}`, summaryX + 15, summaryY + 12, {
        width: summaryWidth - 30,
        align: "right",
      });

    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8.5)
      .text("GST Tax Amount (18%):", summaryX + 15, summaryY + 28);
    doc
      .fillColor("#0f172a")
      .font(regularFont)
      .fontSize(8.5)
      .text(`₹${taxAmount.toFixed(2)}`, summaryX + 15, summaryY + 28, {
        width: summaryWidth - 30,
        align: "right",
      });

    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8.5)
      .text("Shipping Charge:", summaryX + 15, summaryY + 44);
    doc
      .fillColor("#0f172a")
      .font(regularFont)
      .fontSize(8.5)
      .text(`₹${shippingCharge.toFixed(2)}`, summaryX + 15, summaryY + 44, {
        width: summaryWidth - 30,
        align: "right",
      });

    // Total Banner Inside Card
    doc
      .roundedRect(summaryX + 10, summaryY + 68, summaryWidth - 20, 38, 6)
      .fill("#0f172a");

    doc
      .fillColor("#ffffff")
      .font(boldFont)
      .fontSize(10)
      .text("TOTAL AMOUNT", summaryX + 22, summaryY + 81);

    doc
      .fillColor("#f97316")
      .font(boldFont)
      .fontSize(13)
      .text(`₹${totalAmount.toFixed(2)}`, summaryX + 22, summaryY + 80, {
        width: summaryWidth - 44,
        align: "right",
      });

    // 6. FOOTER
    const footerY = 760;
    doc.rect(40, footerY, 515, 0.5).fill("#e2e8f0");
    doc.rect(0, 838, 595, 4).fill("#f97316");

    doc
      .fillColor("#64748b")
      .font(regularFont)
      .fontSize(8)
      .text(
        "Thank you for shipping with LogiTrack • Computer Generated Tax Invoice",
        40,
        footerY + 12,
        { width: 515, align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("DOWNLOAD INVOICE ERROR =>", error);

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