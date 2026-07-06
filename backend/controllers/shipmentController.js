const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");
const Courier = require("../models/Courier");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const NDR = require("../models/NDR");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

// ===============================
// GENERATE UNIQUE AWB
// ===============================
const generateAWB = async () => {
  let awb;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    attempts++;
    awb = "AWB" + Date.now() + Math.floor(1000 + Math.random() * 9000);
    
    const found = await Shipment.findOne({ awb });
    if (!found) {
      exists = false;
    }
  }

  if (exists) {
    throw new Error("Failed to generate unique AWB after multiple attempts");
  }

  return awb;
};

// ===============================
// GENERATE UNIQUE INVOICE NUMBER
// ===============================
const generateInvoiceNumber = () => {
  return "INV" + Date.now() + Math.floor(Math.random() * 1000);
};

// ===============================
// HELPER: Get Logo Image
// ===============================
const getLogoBuffer = (logoPath) => {
  if (!logoPath) return null;
  
  try {
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    if (logoPath.startsWith('data:image')) {
      return logoPath;
    }
    
    const fullPath = path.join(__dirname, '..', logoPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    
    return null;
  } catch (error) {
    console.error("Logo loading error:", error);
    return null;
  }
};

// ===============================
// HELPER: Render Complete Label (Logo + Text + Barcode + QR)
// ===============================
async function renderLabel(doc, shipment, settings = {}, labelWidth = null, labelHeight = null, x = 0, y = 0) {
  const {
    logo = true,
    customerPhone = true,
    dimensions = true,
    weight = true,
    paymentType = true,
    invoiceNumber = true,
    invoiceDate = true,
    companyName = true,
    returnAddress = true,
    qrCode = true,
    useMerchantLogo = true,
    uploadedLogo = null,
    barcodeType = "AWB",
  } = settings;

  // Save current position if we're drawing in a specific area
  const hasPosition = x !== 0 || y !== 0;
  if (hasPosition) {
    doc.save();
    doc.translate(x, y);
  }

  // ===== LOGO =====
  if (logo) {
    let logoImage = null;
    
    if (useMerchantLogo && shipment.merchantId?.logo) {
      logoImage = getLogoBuffer(shipment.merchantId.logo);
    } else if (uploadedLogo) {
      logoImage = uploadedLogo;
    }
    
    if (logoImage) {
      try {
        doc.image(logoImage, {
          fit: [80, 80],
          align: 'center',
          valign: 'top',
        });
        doc.moveDown();
      } catch (err) {
        console.error("Logo loading error:", err);
      }
    }
  }

  // ===== TEXT CONTENT =====
  doc.fontSize(18).text("LOGITRACK SHIPPING LABEL", { align: "center" });
  doc.moveDown();
  
  doc.fontSize(12).text(`AWB: ${shipment.awb}`);
  doc.text(`Courier: ${shipment.courier}`);
  doc.moveDown();
  
  if (shipment.orderId) {
    doc.text(`Customer: ${shipment.orderId.customerName || 'N/A'}`);
    
    if (customerPhone) {
      doc.text(`Phone: ${shipment.orderId.customerPhone || 'N/A'}`);
    }
    
    doc.text(`Address: ${shipment.orderId.customerAddress || 'N/A'}`);
    
    if (dimensions) {
      doc.text(
        `Dimensions: ${shipment.orderId.length || "-"} x ${
          shipment.orderId.width || "-"
        } x ${shipment.orderId.height || "-"} cm`
      );
    }
    
    if (weight) {
      doc.text(`Weight: ${shipment.orderId.weight || "-"} kg`);
    }
    
    if (paymentType) {
      doc.text(`Payment: ${shipment.orderId.paymentMode || 'N/A'}`);
    }
    
    if (invoiceNumber) {
      doc.text(`Invoice: ${shipment.invoiceId?.invoiceNumber || "-"}`);
    }
    
    if (invoiceDate && shipment.invoiceId) {
      doc.text(`Invoice Date: ${shipment.invoiceId.createdAt.toDateString()}`);
    }
    
    doc.text(`Amount: ₹${shipment.orderId.amount || 0}`);
  }

  if (shipment.insuranceEnabled) {
    doc.text(`Insurance: ₹${shipment.insuranceAmount} (Premium: ₹${shipment.insurancePremium})`);
  }
  
  if (companyName) {
    doc.text(`Company: ${shipment.merchantId?.companyName || "LogiTrack"}`);
  }
  
  if (returnAddress) {
    doc.text(`Return Address: ${shipment.merchantId?.address || "Merchant Address"}`);
  }
  
  doc.moveDown();

  // ===== BARCODE =====
  let barcodeValue = shipment.awb;
  
  if (shipment.orderId) {
    if (barcodeType === "ORDER_ID") {
      barcodeValue = shipment.orderId.orderNumber || shipment.awb;
    } else if (barcodeType === "REFERENCE_ID") {
      barcodeValue = shipment.orderId.referenceId || shipment.orderId.orderNumber || shipment.awb;
    }
  }

  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeValue,
      scale: labelWidth ? 2 : 3,
      height: labelWidth ? 8 : 10,
    });

    if (labelWidth) {
      // Multi-label: fit barcode in available space
      doc.image(barcodeBuffer, { 
        width: Math.min(labelWidth - 40, 180),
        x: 20,
        y: (labelHeight || 200) - 60
      });
    } else {
      // Single label: full width
      doc.image(barcodeBuffer, { width: 180 });
    }
  } catch (err) {
    console.error("Barcode generation error:", err);
  }

  // ===== QR CODE =====
  if (qrCode) {
    try {
      const qrBuffer = await QRCode.toBuffer(shipment.awb, {
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: labelWidth ? 3 : 4,
      });

      if (labelWidth) {
        // Multi-label: QR in top-right corner
        doc.image(qrBuffer, { 
          width: 50, 
          x: labelWidth - 70,
          y: 20
        });
      } else {
        // Single label: QR on right side
        doc.image(qrBuffer, { width: 80, align: 'right' });
      }
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }

  // Restore position if we translated
  if (hasPosition) {
    doc.restore();
  }
}

// ===============================
// CREATE SHIPMENT
// ===============================
const createShipment = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);

    const {
      orderId,
      courierId,
      insuranceEnabled = false,
    } = req.body;

    if (!orderId || !courierId) {
      return res.status(400).json({
        success: false,
        message: "OrderId and CourierId are required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      merchantId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const existingShipment = await Shipment.findOne({
      orderId,
      merchantId: req.user.id,
    });

    if (existingShipment) {
      return res.status(400).json({
        success: false,
        message: "Shipment already exists for this order",
      });
    }

    const courier = await Courier.findById(courierId);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId: req.user.id,
      courierId,
      isActive: true,
    });

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        isActive: true,
      });
    }

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "No pricing available for this courier. Please contact administrator.",
      });
    }

    const weight = Number(order.weight || 0);

    let SHIPPING_CHARGE = 0;

    if (weight <= 0.5) {
      SHIPPING_CHARGE = rateCard.forwardRates?.rate500gm || 0;
    } else if (weight <= 1) {
      SHIPPING_CHARGE = rateCard.forwardRates?.rate1kg || 0;
    } else if (weight <= 2) {
      SHIPPING_CHARGE = rateCard.forwardRates?.rate2kg || 0;
    } else if (weight <= 5) {
      SHIPPING_CHARGE = rateCard.forwardRates?.rate5kg || 0;
    } else {
      SHIPPING_CHARGE = 
        (rateCard.forwardRates?.rate5kg || 0) +
        (Math.ceil(weight - 5) * (rateCard.forwardRates?.additionalKg || 0));
    }

    if (order.paymentMode === "COD") {
      SHIPPING_CHARGE += rateCard.codCharge || 0;
    }

    let insurancePremium = 0;

    if (insuranceEnabled) {
      insurancePremium = Math.ceil(
        (order.amount || 0) * 0.02
      );

      SHIPPING_CHARGE += insurancePremium;
    }

    order.shippingCharge = SHIPPING_CHARGE;
    await order.save();

    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        merchantId: req.user.id,
      });
    }

    if (wallet.balance < SHIPPING_CHARGE) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance",
      });
    }

    const awb = await generateAWB();

    console.log("===== BEFORE SHIPMENT CREATE =====");
    console.log({
      orderId,
      merchantId: req.user.id,
      courier: courier.name,
      courierId: courier._id,
      awb,
      insuranceEnabled,
      insuranceAmount: order.amount || 0,
      insurancePremium,
    });

    const shipment = await Shipment.create({
      orderId,
      merchantId: req.user.id,
      courier: courier.name,
      courierPartner: courier.code,
      courierId: courier._id,
      awb,
      status: "PENDING",
      insuranceEnabled,
      insuranceAmount: order.amount || 0,
      insurancePremium,
      trackingEvents: [
        {
          status: "PENDING",
          location: "Warehouse",
          remark: "Shipment Created",
          timestamp: new Date(),
        },
      ],
    });

    console.log("===== SHIPMENT CREATED =====");
    console.log(shipment);

    console.log("===== BEFORE WALLET SAVE =====");
    console.log({
      currentBalance: wallet.balance,
      deductionAmount: SHIPPING_CHARGE,
      newBalance: wallet.balance - SHIPPING_CHARGE,
    });

    wallet.balance -= SHIPPING_CHARGE;
    wallet.transactions.push({
      amount: SHIPPING_CHARGE,
      type: "DEBIT",
      description: `Shipment Charge - ${awb}`,
      createdAt: new Date(),
    });
    await wallet.save();

    console.log("===== WALLET SAVED =====");
    console.log({
      newBalance: wallet.balance,
      transactionCount: wallet.transactions.length,
    });

    console.log("===== BEFORE INVOICE CREATE =====");
    console.log({
      invoiceNumber: generateInvoiceNumber(),
      merchantId: req.user.id,
      orderId: order._id,
      shipmentId: shipment._id,
      amount: order.amount || 0,
      taxAmount: 18,
      shippingCharge: SHIPPING_CHARGE,
      insuranceCharge: insurancePremium,
      paymentMethod: order.paymentMode || "COD",
      status: "PAID",
    });

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      merchantId: req.user.id,
      orderId: order._id,
      shipmentId: shipment._id,
      amount: order.amount || 0,
      taxAmount: 18,
      shippingCharge: SHIPPING_CHARGE,
      insuranceCharge: insurancePremium,
      paymentMethod: order.paymentMode || "COD",
      status: "PAID",
    });

    console.log("INVOICE CREATED =>", invoice);

    const updatedShipment = await Shipment.findByIdAndUpdate(
      shipment._id,
      {
        invoiceId: invoice._id,
      },
      {
        new: true,
      }
    );
    
    const checkShipment = await Shipment.findById(shipment._id);
    console.log("UPDATED SHIPMENT INVOICE =>", checkShipment.invoiceId);
    
    console.log("===== SHIPMENT UPDATED WITH INVOICE ID =====");
    console.log("UPDATED SHIPMENT =>", updatedShipment);
    console.log("UPDATED INVOICE ID =>", updatedShipment.invoiceId);

    console.log("===== BEFORE ORDER SAVE =====");
    console.log({
      orderId: order._id,
      shipmentId: shipment._id,
      invoiceId: invoice._id,
      awb: shipment.awb,
      courierPartner: shipment.courier,
      status: "SHIPPED",
    });

    order.shipmentId = shipment._id;
    order.invoiceId = invoice._id;
    order.awb = shipment.awb;
    order.courierPartner = shipment.courier;
    order.status = "SHIPPED";
    await order.save();

    console.log("===== ORDER SAVED =====");
    console.log("ORDER UPDATED WITH SHIPMENT & INVOICE =>", order);

    const finalShipment = await Shipment.findById(shipment._id)
      .populate("orderId")
      .populate("invoiceId");

    console.log("===== FINAL UPDATED SHIPMENT =====");
    console.log("FINAL INVOICE ID =>", finalShipment.invoiceId);
    console.log("Full final shipment:", finalShipment);

    return res.status(201).json({
      success: true,
      message: "Shipment Created Successfully",
      shipment: finalShipment,
      shippingCharge: SHIPPING_CHARGE,
      insurancePremium,
      insuranceEnabled,
      rateCardUsed: courier.name,
      weight: order.weight,
      paymentMode: order.paymentMode,
    });
  } catch (error) {
    console.log("SHIPMENT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// ===============================
// BULK CREATE SHIPMENTS
// ===============================
const createBulkShipments = async (req, res) => {
  try {
    const { orderIds, courierId } = req.body;

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders selected",
      });
    }

    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: "CourierId is required",
      });
    }

    const courier = await Courier.findById(courierId);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    const shipments = [];
    const failedOrders = [];
    const skippedOrders = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findOne({
          _id: orderId,
          merchantId: req.user.id,
        });

        if (!order) {
          failedOrders.push({ orderId, reason: "Order not found" });
          continue;
        }

        const existingShipment = await Shipment.findOne({
          orderId,
          merchantId: req.user.id,
        });

        if (existingShipment) {
          skippedOrders.push({ orderId, reason: "Shipment already exists" });
          continue;
        }

        const awb = "AWB" + Date.now() + Math.floor(Math.random() * 10000);

        const shipment = await Shipment.create({
          orderId,
          merchantId: req.user.id,
          courier: courier.name,
          courierPartner: courier.code,
          courierId: courier._id,
          awb,
          status: "PENDING",
          trackingEvents: [
            {
              status: "PENDING",
              location: "Warehouse",
              remark: "Bulk Shipment Created",
              timestamp: new Date(),
            },
          ],
        });

        shipments.push(shipment);

        order.shipmentId = shipment._id;
        order.awb = shipment.awb;
        order.courierPartner = shipment.courier;
        order.status = "SHIPPED";
        await order.save();

      } catch (error) {
        console.error(`Error creating shipment for order ${orderId}:`, error);
        failedOrders.push({ orderId, reason: error.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `${shipments.length} shipments created successfully`,
      shipments,
      summary: {
        created: shipments.length,
        skipped: skippedOrders.length,
        failed: failedOrders.length,
        skippedOrders,
        failedOrders,
      },
    });
  } catch (error) {
    console.error("Bulk shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL SHIPMENTS
// ===============================
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      merchantId: req.user.id,
    })
      .populate({
        path: "orderId",
        populate: {
          path: "invoiceId",
        },
      })
      .populate("invoiceId")
      .populate("courierId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE SHIPMENT
// ===============================
const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate({
        path: "orderId",
        populate: {
          path: "invoiceId",
        },
      })
      .populate("invoiceId")
      .populate("courierId");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    return res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// TRACK SHIPMENT BY AWB
// ===============================
const trackShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findOne({
      awb: id,
      merchantId: req.user.id,
    })
      .populate({
        path: "orderId",
        populate: {
          path: "invoiceId",
        },
      })
      .populate("invoiceId")
      .populate("courierId");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    return res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE SHIPMENT STATUS
// ===============================
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "READY_FOR_PICKUP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "NDR",
      "RTO",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment status",
      });
    }

    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (shipment.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Delivered shipment cannot be modified",
      });
    }

    shipment.status = status;

    const order = await Order.findById(shipment.orderId);

    if (order) {
      const orderStatusMap = {
        READY_FOR_PICKUP: "READY_FOR_PICKUP",
        IN_TRANSIT: "SHIPPED",
        OUT_FOR_DELIVERY: "SHIPPED",
        DELIVERED: "DELIVERED",
        NDR: "SHIPPED",
        RTO: "RETURNED",
      };

      order.status = orderStatusMap[status] || order.status;
      await order.save();
    }

    if (status === "NDR") {
      console.log("========== NDR HIT ==========");

      const existingNDR = await NDR.findOne({
        shipmentId: shipment._id,
      });

      console.log("EXISTING =", existingNDR);

      if (!existingNDR) {
        try {
          const ndr = await NDR.create({
            shipmentId: shipment._id,
            orderId: shipment.orderId,
            merchantId: shipment.merchantId,
            awb: shipment.awb,
            reason: "Delivery Failed",
          });

          console.log("NDR CREATED =", ndr);
        } catch (err) {
          console.log("NDR ERROR =", err);
        }
      }
    }

    shipment.trackingEvents.push({
      status,
      location: "Admin Panel",
      remark: `Shipment status changed to ${status}`,
      timestamp: new Date(),
    });

    if (status === "DELIVERED") {
      shipment.deliveryDate = new Date();
    }

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
      shipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// SCHEDULE PICKUP
// ===============================
const schedulePickup = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.status = "READY_FOR_PICKUP";
      await order.save();
    }

    shipment.pickupDate = new Date();
    shipment.status = "READY_FOR_PICKUP";

    shipment.trackingEvents.push({
      status: "READY_FOR_PICKUP",
      location: "Admin Panel",
      remark: "Pickup Scheduled",
      timestamp: new Date(),
    });

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Pickup Scheduled Successfully",
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GENERATE QR CODE (SECURED)
// ===============================
const generateShipmentQR = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found or unauthorized",
      });
    }

    const qrCode = await QRCode.toDataURL(shipment.awb);
    shipment.qrCode = qrCode;
    await shipment.save();

    res.status(200).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GENERATE PDF LABEL - REFACTORED
// ===============================
const generateLabel = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    })
      .populate("merchantId")
      .populate("orderId")
      .populate("invoiceId");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found or unauthorized",
      });
    }

    if (!shipment.orderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this shipment",
      });
    }

    let settings = {};
    if (req.body.settings) {
      settings = JSON.parse(req.body.settings);
    } else {
      settings = req.body;
    }

    if (req.file) {
      settings.uploadedLogo = req.file.path;
    }

    const format = settings.format || "A6";

    // Determine page size and layout
    let pageSize = "A6";
    let margin = 20;
    let labelsPerPage = 1;
    let isMultiLabel = false;

    if (format === "A4_2") {
      pageSize = "A4";
      margin = 20;
      isMultiLabel = true;
      labelsPerPage = 2;
    } else if (format === "A4_4") {
      pageSize = "A4";
      margin = 20;
      isMultiLabel = true;
      labelsPerPage = 4;
    } else if (format === "THERMAL" || format === "4x6") {
      pageSize = [288, 432];
      margin = 15;
      isMultiLabel = false;
      labelsPerPage = 1;
    }

    const doc = new PDFDocument({
      size: pageSize,
      margin,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${shipment.awb}_${format}.pdf`
    );

    doc.pipe(res);

    if (isMultiLabel) {
      // Multi-label on A4
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const cols = labelsPerPage === 2 ? 2 : 2;
      const rows = labelsPerPage === 2 ? 1 : 2;
      const labelWidth = (pageWidth - margin * 2) / cols;
      const labelHeight = (pageHeight - margin * 2) / rows;

      // Draw same shipment multiple times on one page
      for (let i = 0; i < labelsPerPage; i++) {
        const x = (i % cols) * labelWidth;
        const y = Math.floor(i / cols) * labelHeight;

        // Draw label border
        doc.save();
        doc.translate(margin + x, margin + y);
        doc.rect(0, 0, labelWidth - 10, labelHeight - 10).stroke();
        doc.restore();

        // Render label with position and size
        await renderLabel(
          doc, 
          shipment, 
          settings, 
          labelWidth - 10, 
          labelHeight - 10, 
          margin + x, 
          margin + y
        );
      }
    } else {
      // Single label
      await renderLabel(doc, shipment, settings);
    }

    doc.end();

  } catch (error) {
    console.error("Generate label error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// BULK LABELS - REFACTORED (Simple & Clean)
// ===============================
const bulkLabels = async (req, res) => {
  try {
    let settings = {};
    if (req.body.settings) {
      settings = JSON.parse(req.body.settings);
    } else {
      settings = req.body;
    }

    if (req.file) {
      settings.uploadedLogo = req.file.path;
    }

    // Get shipmentIds from req.body directly
    let shipmentIds = req.body.shipmentIds;
    if (typeof shipmentIds === "string") {
      shipmentIds = JSON.parse(shipmentIds);
    }

    const format = settings.format || "A6";

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No shipment IDs provided",
      });
    }

    const shipments = await Shipment.find({
      _id: { $in: shipmentIds },
      merchantId: req.user.id,
    })
      .populate("merchantId")
      .populate("orderId")
      .populate("invoiceId");

    if (shipments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shipments found",
      });
    }

    // Determine page size and layout
    let pageSize = "A6";
    let margin = 20;
    let labelsPerPage = 1;
    let isMultiLabel = false;

    if (format === "A4_2") {
      pageSize = "A4";
      margin = 20;
      isMultiLabel = true;
      labelsPerPage = 2;
    } else if (format === "A4_4") {
      pageSize = "A4";
      margin = 20;
      isMultiLabel = true;
      labelsPerPage = 4;
    } else if (format === "THERMAL" || format === "4x6") {
      pageSize = [288, 432];
      margin = 15;
      isMultiLabel = false;
      labelsPerPage = 1;
    }

    // Create PDF
    const doc = new PDFDocument({
      size: pageSize,
      margin,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bulk_labels_${format}_${Date.now()}.pdf`
    );

    doc.pipe(res);

    if (isMultiLabel) {
      // A4 with multiple labels per page
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const cols = labelsPerPage === 2 ? 2 : 2;
      const rows = labelsPerPage === 2 ? 1 : 2;
      const labelWidth = (pageWidth - margin * 2) / cols;
      const labelHeight = (pageHeight - margin * 2) / rows;

      let labelIndex = 0;

      for (const shipment of shipments) {
        const positionInPage = labelIndex % labelsPerPage;
        
        // Add new page when needed
        if (positionInPage === 0 && labelIndex > 0) {
          doc.addPage();
        }

        const x = (positionInPage % cols) * labelWidth;
        const y = Math.floor(positionInPage / cols) * labelHeight;

        // Draw label border
        doc.save();
        doc.translate(margin + x, margin + y);
        doc.rect(0, 0, labelWidth - 10, labelHeight - 10).stroke();
        doc.restore();

        // Render label with position and size
        await renderLabel(
          doc, 
          shipment, 
          settings, 
          labelWidth - 10, 
          labelHeight - 10, 
          margin + x, 
          margin + y
        );

        labelIndex++;
      }
    } else {
      // Single label per page (A6 or Thermal)
      for (let i = 0; i < shipments.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        await renderLabel(doc, shipments[i], settings);
      }
    }

    doc.end();

  } catch (error) {
    console.error("Bulk labels error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// TRACKING TIMELINE
// ===============================
const getTrackingTimeline = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      timeline: shipment.trackingEvents || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  createShipment,
  createBulkShipments, 
  getShipments,
  getShipmentById,
  trackShipment,
  updateShipmentStatus,
  schedulePickup,
  generateShipmentQR,
  getTrackingTimeline,
  generateLabel,
  bulkLabels, 
};