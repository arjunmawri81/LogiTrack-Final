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
// HELPER: Render Complete Label (New Design)
// ===============================
async function renderLabel(doc, shipment, settings = {}, labelWidth = null, labelHeight = null, x = 0, y = 0) {
  const {
    logo = true,
    customerPhone = true,
    weight = true,
    paymentType = true,
    useMerchantLogo = true,
    uploadedLogo = null,
  } = settings;

  // Save current position if we're drawing in a specific area
  const hasPosition = x !== 0 || y !== 0;
  if (hasPosition) {
    doc.save();
    doc.translate(x, y);
  }

  // Determine available width for content
  const maxWidth = labelWidth || doc.page.width - (doc.page.margins?.left || 40) * 2;
  const contentX = hasPosition ? 0 : (doc.page.margins?.left || 40);
  const contentY = hasPosition ? 0 : (doc.page.margins?.top || 40);
  
  let currentY = contentY;
  const lineHeight = 16;
  
  // ============================================
  // 1. HEADER: Logo + Title
  // ============================================
  const headerY = currentY;
  const headerHeight = 28;
  let logoImage = null;
  
  // Logo (left)
  if (logo) {
    if (useMerchantLogo && shipment.merchantId?.logo) {
      logoImage = getLogoBuffer(shipment.merchantId.logo);
    } else if (uploadedLogo) {
      logoImage = uploadedLogo;
    }
    
    if (logoImage) {
      try {
        doc.image(logoImage, contentX, headerY, {
          width: 28,
          height: 28,
        });
      } catch (err) {
        console.error("Logo loading error:", err);
      }
    }
  }

  // LOGITRACK text (left side, next to logo)
  doc.font('Helvetica-Bold')
     .fontSize(16)
     .fillColor('#000000')
     .text('LOGITRACK', contentX + (logoImage ? 38 : 0), headerY + 4, {
       width: 150,
       height: headerHeight,
       align: 'left',
     });

  // SHIPMENT LABEL (right side) - Using calculated position
  const rightX = contentX + maxWidth - 180;
  doc.font('Helvetica-Bold')
     .fontSize(16)
     .fillColor('#000000')
     .text('SHIPMENT LABEL', rightX, headerY + 4, {
       width: 180,
       height: headerHeight,
       align: 'right',
     });

  currentY = headerY + headerHeight + 5;
  
  // Divider line
  doc.strokeColor('#000000')
     .lineWidth(0.5)
     .moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  currentY += 10;

  // ============================================
  // 2. SHIPMENT INFORMATION BLOCK (2-column)
  // ============================================
  const infoFontSize = 8.5;
  const infoLineHeight = 16;
  
  // Column 1: AWB, Courier
  doc.font('Helvetica')
     .fontSize(infoFontSize)
     .fillColor('#000000');
  
  // AWB No
  doc.text('AWB No', contentX, currentY, { width: 70, align: 'left' });
  doc.font('Helvetica-Bold')
     .text(`: ${shipment.awb}`, contentX + 70, currentY, { width: 150, align: 'left' });
  
  currentY += infoLineHeight;
  
  // Courier
  doc.font('Helvetica')
     .text('Courier', contentX, currentY, { width: 70, align: 'left' });
  doc.font('Helvetica-Bold')
     .text(`: ${shipment.courier || 'N/A'}`, contentX + 70, currentY, { width: 150, align: 'left' });
  
  currentY += infoLineHeight;
  
  // Column 2: Order No, Ship Date
  const col2X = maxWidth / 2 + contentX;
  let col2Y = currentY - (infoLineHeight * 2);
  
  // Order No
  doc.font('Helvetica')
     .text('Order No', col2X, col2Y, { width: 70, align: 'left' });
  doc.font('Helvetica-Bold')
     .text(`: ${shipment.orderId?.orderNumber || shipment.orderId?._id?.toString()?.slice(-6) || 'N/A'}`, col2X + 70, col2Y, { width: 120, align: 'left' });
  
  col2Y += infoLineHeight;
  
  // Ship Date
  doc.font('Helvetica')
     .text('Ship Date', col2X, col2Y, { width: 70, align: 'left' });
  doc.font('Helvetica-Bold')
     .text(`: ${shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}`, col2X + 70, col2Y, { width: 120, align: 'left' });
  
  currentY += infoLineHeight;
  currentY += 5;

  // ============================================
  // 3. BARCODE SECTION (Dynamic Width)
  // ============================================
  const barcodeY = currentY;
  const barcodeWidth = Math.min(maxWidth - 40, 230);
  const barcodeHeight = 65;
  
  let barcodeValue = shipment.awb;
  
  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeValue,
      scale: 3.5,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });

    // Center the barcode
    const barcodeX = contentX + (maxWidth - barcodeWidth) / 2;
    
    doc.image(barcodeBuffer, barcodeX, barcodeY, {
      width: barcodeWidth,
      height: barcodeHeight,
    });
    
    // Barcode number text below (bold)
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor('#000000')
       .text(barcodeValue, contentX, barcodeY + barcodeHeight + 3, {
         width: maxWidth,
         align: 'center',
       });
       
    currentY = barcodeY + barcodeHeight + 22;
  } catch (err) {
    console.error("Barcode generation error:", err);
    currentY += 20;
  }

  // ============================================
  // 4. SHIP TO BOX
  // ============================================
  // Draw box border
  const boxPadding = 8;
  const boxWidth = maxWidth - 20;
  const boxHeight = 90;
  const boxX = contentX + 10;
  const boxY = currentY;
  
  doc.strokeColor('#000000')
     .lineWidth(0.5)
     .rect(boxX, boxY, boxWidth, boxHeight)
     .stroke();
  
  // SHIP TO header
  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor('#000000')
     .text('SHIP TO', boxX + boxPadding, boxY + boxPadding, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  // Customer details
  const nameY = boxY + boxPadding + 18;
  const addressY = nameY + 16;
  const phoneY = addressY + 16;
  
  // Customer name (bold)
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#000000')
     .text(shipment.orderId?.customerName || 'N/A', boxX + boxPadding, nameY, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  // Address
  let addressText = shipment.orderId?.customerAddress || 'N/A';
  if (shipment.orderId?.customerCity || shipment.orderId?.customerState) {
    addressText = `${shipment.orderId.customerAddress || ''}, ${shipment.orderId.customerCity || ''}, ${shipment.orderId.customerState || ''} - ${shipment.orderId?.customerPincode || ''}`;
  }
  
  doc.font('Helvetica')
     .fontSize(8.5)
     .fillColor('#000000')
     .text(addressText, boxX + boxPadding, addressY, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  // Phone
  if (customerPhone && shipment.orderId?.customerPhone) {
    doc.font('Helvetica')
       .fontSize(8.5)
       .fillColor('#000000')
       .text(`Phone: ${shipment.orderId.customerPhone}`, boxX + boxPadding, phoneY, {
         width: boxWidth - boxPadding * 2,
         align: 'left',
       });
  }
  
  currentY = boxY + boxHeight + 15;

  // ============================================
  // 5. SHIP FROM BOX
  // ============================================
  const fromBoxY = currentY;
  const fromBoxHeight = 55;
  
  doc.strokeColor('#000000')
     .lineWidth(0.5)
     .rect(boxX, fromBoxY, boxWidth, fromBoxHeight)
     .stroke();
  
  // SHIP FROM header
  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor('#000000')
     .text('SHIP FROM', boxX + boxPadding, fromBoxY + boxPadding, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  // Merchant details
  const fromNameY = fromBoxY + boxPadding + 18;
  const fromAddressY = fromNameY + 16;
  
  // Company name
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#000000')
     .text(shipment.merchantId?.companyName || 'LogiTrack', boxX + boxPadding, fromNameY, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  // Address
  doc.font('Helvetica')
     .fontSize(8.5)
     .fillColor('#000000')
     .text(shipment.merchantId?.address || 'Merchant Address', boxX + boxPadding, fromAddressY, {
       width: boxWidth - boxPadding * 2,
       align: 'left',
     });
  
  currentY = fromBoxY + fromBoxHeight + 15;

  // ============================================
  // 6. SHIPMENT DETAILS + QR (Same Row)
  // ============================================
  const tableY = currentY;
  const tableHeight = 30;
  
  // QR Size - increased to 40 for better reliability
  const qrSize = 40;
  const qrSpacing = 5;
  
  // Available width for table columns (excluding QR)
  const tableWidth = boxWidth - qrSize - qrSpacing - 10;
  const colWidth = (tableWidth - 20) / 4;
  
  // Draw table border
  doc.strokeColor('#000000')
     .lineWidth(0.5)
     .rect(boxX, tableY, tableWidth, tableHeight)
     .stroke();
  
  // Column headers
  const headers = ['Weight', 'Pieces', 'Payment', 'Amount'];
  const headerX = boxX + 10;
  
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#000000');
  
  headers.forEach((header, index) => {
    doc.text(header, headerX + (index * colWidth), tableY + 8, {
      width: colWidth - 5,
      align: 'center',
    });
  });
  
  // Column values
  const values = [
    weight ? `${shipment.orderId?.weight || 0} Kg` : 'N/A',
    '1',
    paymentType ? (shipment.orderId?.paymentMode || 'N/A') : 'N/A',
    `₹${shipment.orderId?.amount || 0}`
  ];
  
  doc.font('Helvetica')
     .fontSize(8.5)
     .fillColor('#000000');
  
  values.forEach((value, index) => {
    doc.text(value, headerX + (index * colWidth), tableY + 8 + 14, {
      width: colWidth - 5,
      align: 'center',
    });
  });
  
  // QR Code (Right side of table)
  if (settings.qrCode !== false) {
    try {
      const qrX = boxX + tableWidth + qrSpacing;
      const qrY = tableY + (tableHeight - qrSize) / 2;
      
      const qrBuffer = await QRCode.toBuffer(shipment.awb, {
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 5,
      });

      doc.image(qrBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });
      
      // "Scan" text below QR
      doc.font('Helvetica')
         .fontSize(6)
         .fillColor('#000000')
         .text('Scan', qrX, qrY + qrSize + 1, {
           width: qrSize,
           align: 'center',
         });
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }
  
  currentY = tableY + tableHeight + 15;

  // ============================================
  // 7. FOOTER
  // ============================================
  // Divider line above footer
  doc.strokeColor('#000000')
     .lineWidth(0.3)
     .moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  currentY += 5;
  
  // Footer text
  doc.font('Helvetica')
     .fontSize(7)
     .fillColor('#000000')
     .text('Generated by LogiTrack', contentX, currentY, {
       width: maxWidth,
       align: 'center',
     });

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
// GENERATE PDF LABEL
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
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const cols = labelsPerPage === 2 ? 2 : 2;
      const rows = labelsPerPage === 2 ? 1 : 2;
      const labelWidth = (pageWidth - margin * 2) / cols;
      const labelHeight = (pageHeight - margin * 2) / rows;

      for (let i = 0; i < labelsPerPage; i++) {
        const x = (i % cols) * labelWidth;
        const y = Math.floor(i / cols) * labelHeight;

        doc.save();
        doc.translate(margin + x, margin + y);
        doc.rect(0, 0, labelWidth - 10, labelHeight - 10).stroke();
        doc.restore();

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
// BULK LABELS
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
      `attachment; filename=bulk_labels_${format}_${Date.now()}.pdf`
    );

    doc.pipe(res);

    if (isMultiLabel) {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const cols = labelsPerPage === 2 ? 2 : 2;
      const rows = labelsPerPage === 2 ? 1 : 2;
      const labelWidth = (pageWidth - margin * 2) / cols;
      const labelHeight = (pageHeight - margin * 2) / rows;

      let labelIndex = 0;

      for (const shipment of shipments) {
        const positionInPage = labelIndex % labelsPerPage;
        
        if (positionInPage === 0 && labelIndex > 0) {
          doc.addPage();
        }

        const x = (positionInPage % cols) * labelWidth;
        const y = Math.floor(positionInPage / cols) * labelHeight;

        doc.save();
        doc.translate(margin + x, margin + y);
        doc.rect(0, 0, labelWidth - 10, labelHeight - 10).stroke();
        doc.restore();

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