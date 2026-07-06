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
// HELPER: Render Label V2 (Professional - Premium)
// ===============================
async function renderLabelV2(doc, shipment, settings = {}, labelWidth = null, labelHeight = null, x = 0, y = 0) {
  const {
    logo = true,
    customerPhone = true,
    weight = true,
    paymentType = true,
    useMerchantLogo = true,
    uploadedLogo = null,
    qrCode = true,
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
  const padding = 10;
  const fontSize = 7.5;
  const headerFontSize = 8.5;
  const boldFont = 'Helvetica-Bold';
  const regularFont = 'Helvetica';
  
  // Total label height
  const totalHeight = labelHeight || 420;
  
  // ============================================
  // SECTION 1: SHIP TO + LOGO (18%)
  // ============================================
  const section1Height = totalHeight * 0.18;
  const section1Y = currentY;
  
  // Outer border only
  doc.strokeColor('#000000')
     .lineWidth(0.3)
     .rect(contentX, section1Y, maxWidth, totalHeight)
     .stroke();
  
  // Left: SHIP TO (adjust based on logo width)
  const rightWidth = 85;
  const rightX = contentX + maxWidth - rightWidth - 10;
  const leftWidth = maxWidth - rightWidth - padding - 15;
  const leftX = contentX + padding;
  
  doc.font(boldFont)
     .fontSize(headerFontSize)
     .fillColor('#000000')
     .text('SHIP TO', leftX, section1Y + padding, {
       width: leftWidth - padding,
       align: 'left',
     });
  
  // Customer Name - More prominent (fontSize 9)
  const nameY = section1Y + padding + 16;
  doc.font(boldFont)
     .fontSize(9)
     .fillColor('#000000')
     .text(shipment.orderId?.customerName || 'N/A', leftX, nameY, {
       width: leftWidth - padding,
       align: 'left',
     });
  
  // Phone
  const phoneY = nameY + 15;
  if (customerPhone && shipment.orderId?.customerPhone) {
    doc.font(regularFont)
       .fontSize(fontSize)
       .fillColor('#000000')
       .text(`Phone: ${shipment.orderId.customerPhone}`, leftX, phoneY, {
         width: leftWidth - padding,
         align: 'left',
       });
  }
  
  // Address - Smaller font (size 7)
  const addressY = phoneY + 13;
  let addressText = shipment.orderId?.customerAddress || 'N/A';
  if (shipment.orderId?.customerCity && shipment.orderId?.customerState) {
    addressText = `${shipment.orderId.customerAddress || ''}, ${shipment.orderId.customerCity || ''}, ${shipment.orderId.customerState || ''}`;
  }
  
  doc.font(regularFont)
     .fontSize(7)
     .fillColor('#333333')
     .text(addressText, leftX, addressY, {
       width: leftWidth - padding,
       align: 'left',
     });
  
  const pincodeY = addressY + 11;
  let locationText = '';
  if (shipment.orderId?.customerCity) locationText += shipment.orderId.customerCity;
  if (shipment.orderId?.customerState) locationText += ` • ${shipment.orderId.customerState}`;
  if (shipment.orderId?.customerPincode) locationText += ` • ${shipment.orderId.customerPincode}`;
  
  if (locationText) {
    doc.font(regularFont)
       .fontSize(7)
       .fillColor('#333333')
       .text(locationText, leftX, pincodeY, {
         width: leftWidth - padding,
         align: 'left',
       });
  }
  
  // Right: LOGO
  if (logo) {
    let logoImage = null;
    if (useMerchantLogo && shipment.merchantId?.logo) {
      logoImage = getLogoBuffer(shipment.merchantId.logo);
    } else if (uploadedLogo) {
      logoImage = uploadedLogo;
    }
    
    if (logoImage) {
      try {
        const logoX = rightX + 10;
        const logoY = section1Y + (section1Height - 40) / 2;
        doc.image(logoImage, logoX, logoY, {
          fit: [65, 40],
          align: 'center',
          valign: 'center',
        });
      } catch (err) {
        console.error("Logo loading error:", err);
        // FIX 4: Only grey border, no text
        doc.strokeColor('#E0E0E0')
           .lineWidth(0.5)
           .rect(rightX + 10, section1Y + section1Height/2 - 15, rightWidth - 20, 30)
           .stroke();
      }
    } else {
      // FIX 4: No logo = nothing, or just a very subtle border
      // Professional labels don't show placeholder text
      // Only draw a very subtle border if you want
      // Commented out for clean look
      // doc.strokeColor('#F0F0F0')
      //    .lineWidth(0.3)
      //    .rect(rightX + 10, section1Y + section1Height/2 - 15, rightWidth - 20, 30)
      //    .stroke();
    }
  }
  
  currentY = section1Y + section1Height;
  
  // Divider line between section 1 and 2
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // ============================================
  // SECTION 2: BARCODE (52%) + SHIPMENT INFO (48%)
  // ============================================
  const section2Height = totalHeight * 0.25;
  const section2Y = currentY;
  
  const dividerX = contentX + maxWidth * 0.52;
  doc.moveTo(dividerX, section2Y)
     .lineTo(dividerX, section2Y + section2Height)
     .stroke();
  
  // LEFT: BIG BARCODE (52%)
  const leftBarcodeWidth = maxWidth * 0.52 - padding * 2;
  const barcodeCenterX = contentX + (maxWidth * 0.52) / 2;
  const barcodeWidth = Math.min(leftBarcodeWidth - 20, 210);
  const barcodeHeight = section2Height - 35;
  
  let barcodeValue = shipment.awb;
  
  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: false,
    });

    const barcodeX = barcodeCenterX - barcodeWidth / 2;
    const barcodeY = section2Y + 8;
    
    doc.image(barcodeBuffer, barcodeX, barcodeY, {
      width: barcodeWidth,
      height: barcodeHeight - 15,
    });
    
    // FIX: AWB Number below barcode - smaller font (size 8)
    const awbTextY = section2Y + section2Height - 16;
    const awbTextWidth = maxWidth * 0.52 - padding * 2;
    
    // Check if label is thermal (small width)
    const isThermal = maxWidth < 300;
    const awbFontSize = isThermal ? 6.5 : 8; // Smaller font for AWB text
    
    doc.font(boldFont)
       .fontSize(awbFontSize)
       .fillColor('#000000')
       .text(barcodeValue, contentX + padding, awbTextY, {
         width: awbTextWidth,
         align: 'center',
         lineBreak: false,
       });
  } catch (err) {
    console.error("Barcode generation error:", err);
    doc.font(boldFont)
       .fontSize(10)
       .fillColor('#000000')
       .text(barcodeValue, contentX + padding, section2Y + section2Height/2 - 6, {
         width: maxWidth * 0.52 - padding * 2,
         align: 'center',
       });
  }
  
  // RIGHT: Shipment Info (48%)
  const infoX = dividerX + padding;
  const infoWidth = maxWidth * 0.48 - padding * 2;
  const infoStartY = section2Y + padding + 5;
  const infoLineHeight = 16;
  const labelWidth_ = 50;
  const valueWidth = infoWidth - labelWidth_ - 5;
  
  // Courier
  doc.font(regularFont)
     .fontSize(6.5)
     .fillColor('#666666')
     .text('Courier', infoX, infoStartY, { width: labelWidth_, align: 'left' });
  
  let courierName = shipment.courier || 'N/A';
  const courierAbbreviations = {
    'Xpressbees': 'XBEE',
    'Xpressbees Surface': 'XBEE',
    'Delhivery': 'DLVRY',
    'Blue Dart': 'BLDART',
    'DTDC': 'DTDC',
    'Amazon Shipping': 'AMZN',
    'Flipkart': 'FLPK',
    'Ecom Express': 'ECOM',
    'Shadowfax': 'SHDW',
    'Porter': 'PRTR',
  };
  
  for (const [key, short] of Object.entries(courierAbbreviations)) {
    if (courierName.includes(key)) {
      courierName = short;
      break;
    }
  }
  
  if (courierName.length > 10) {
    courierName = courierName.substring(0, 10) + '...';
  }
  
  doc.font(boldFont)
     .fontSize(7)
     .fillColor('#000000')
     .text(courierName, infoX + labelWidth_, infoStartY, { 
       width: valueWidth, 
       align: 'left',
       ellipsis: true 
     });
  
  // FIX 1: AWB in right panel - show shortened version in one line
  const awbY = infoStartY + infoLineHeight;
  doc.font(regularFont)
     .fontSize(6.5)
     .fillColor('#666666')
     .text('AWB', infoX, awbY, { width: labelWidth_, align: 'left' });
  
  // Shorten AWB for right panel display
  let shortAwb = barcodeValue;
  if (shortAwb.length > 14) {
    shortAwb = '...' + shortAwb.slice(-10);
  }
  
  doc.font(boldFont)
     .fontSize(7)
     .fillColor('#000000')
     .text(shortAwb, infoX + labelWidth_, awbY, { 
       width: valueWidth, 
       align: 'left',
       lineBreak: false, // FIX 1: One line only
     });
  
  // Weight
  if (weight) {
    const weightY = awbY + infoLineHeight;
    doc.font(regularFont)
       .fontSize(6.5)
       .fillColor('#666666')
       .text('Weight', infoX, weightY, { width: labelWidth_, align: 'left' });
    doc.font(boldFont)
       .fontSize(7)
       .fillColor('#000000')
       .text(`${shipment.orderId?.weight || 0} Kg`, infoX + labelWidth_, weightY, { 
         width: valueWidth, 
         align: 'left' 
       });
  }
  
  // Payment - Always black
  const paymentY = awbY + infoLineHeight * 2;
  const paymentMode = shipment.orderId?.paymentMode || 'N/A';
  const isCOD = paymentMode.toUpperCase() === 'COD';
  
  doc.font(regularFont)
     .fontSize(6.5)
     .fillColor('#666666')
     .text('Payment', infoX, paymentY, { width: labelWidth_, align: 'left' });
  
  doc.font(boldFont)
     .fontSize(7)
     .fillColor('#000000')
     .text(`${isCOD ? 'COD' : 'PREPAID'}${isCOD ? ` ₹${shipment.orderId?.amount || 0}` : ''}`, 
       infoX + labelWidth_, paymentY, { 
       width: valueWidth, 
       align: 'left' 
     });
  
  currentY = section2Y + section2Height;
  
  // Divider line between section 2 and 3
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // ============================================
  // SECTION 3: SHIP FROM + ORDER DETAILS (20%)
  // ============================================
  const section3Height = totalHeight * 0.20;
  const section3Y = currentY;
  
  const dividerX3 = contentX + maxWidth / 2;
  doc.moveTo(dividerX3, section3Y)
     .lineTo(dividerX3, section3Y + section3Height)
     .stroke();
  
  // LEFT: SHIP FROM
  const leftFromX = contentX + padding;
  const leftFromWidth = maxWidth / 2 - padding * 2;
  const fromStartY = section3Y + padding + 5;
  
  doc.font(boldFont)
     .fontSize(headerFontSize)
     .fillColor('#000000')
     .text('SHIP FROM', leftFromX, section3Y + padding, {
       width: leftFromWidth,
       align: 'left',
     });
  
  const companyY = fromStartY + 16;
  doc.font(boldFont)
     .fontSize(fontSize + 1)
     .fillColor('#000000')
     .text(shipment.merchantId?.companyName || 'LogiTrack', leftFromX, companyY, {
       width: leftFromWidth,
       align: 'left',
     });
  
  const gstY = companyY + 14;
  if (shipment.merchantId?.gst) {
    doc.font(regularFont)
       .fontSize(fontSize)
       .fillColor('#000000')
       .text(`GST: ${shipment.merchantId.gst}`, leftFromX, gstY, {
         width: leftFromWidth,
         align: 'left',
       });
  }
  
  const fromPhoneY = gstY + 14;
  if (shipment.merchantId?.phone) {
    doc.font(regularFont)
       .fontSize(fontSize)
       .fillColor('#000000')
       .text(`Phone: ${shipment.merchantId.phone}`, leftFromX, fromPhoneY, {
         width: leftFromWidth,
         align: 'left',
       });
  }
  
  // RIGHT: ORDER DETAILS
  const rightOrderX = dividerX3 + padding;
  const rightOrderWidth = maxWidth / 2 - padding * 2;
  const orderStartY = section3Y + padding + 5;
  
  doc.font(boldFont)
     .fontSize(headerFontSize)
     .fillColor('#000000')
     .text('ORDER DETAILS', rightOrderX, section3Y + padding, {
       width: rightOrderWidth,
       align: 'left',
     });
  
  const orderNumY = orderStartY + 16;
  let orderNumber = shipment.orderId?.orderNumber || shipment.orderId?._id?.toString()?.slice(-6) || 'N/A';
  
  // If order number is too long, show only last 12-14 characters
  if (orderNumber.length > 14) {
    orderNumber = '...' + orderNumber.slice(-12);
  }
  
  doc.font(regularFont)
     .fontSize(6.5)
     .fillColor('#666666')
     .text('Order No', rightOrderX, orderNumY, { width: 55, align: 'left' });
  
  const isThermal = maxWidth < 300;
  const orderFontSize = isThermal ? 6.5 : 8;
  
  doc.font(boldFont)
     .fontSize(orderFontSize)
     .fillColor('#000000')
     .text(orderNumber, rightOrderX + 55, orderNumY, { 
       width: rightOrderWidth - 55, 
       align: 'left',
       lineBreak: false
     });
  
  // Order Barcode
  const barcodeOrderY = orderNumY + 18;
  if (orderNumber) {
    try {
      const smallBarcode = await bwipjs.toBuffer({
        bcid: "code128",
        text: orderNumber.replace('...', ''),
        scale: 2.5,
        height: 8,
        includetext: false,
      });
      
      const barcodeX = rightOrderX + 10;
      const barcodeWidthSmall = Math.min(rightOrderWidth - 40, 130);
      doc.image(smallBarcode, barcodeX, barcodeOrderY, {
        width: barcodeWidthSmall,
        height: 22,
      });
    } catch (err) {
      console.error("Order barcode error:", err);
    }
  }
  
  // COD / PREPAID - Black
  const paymentStatusY = barcodeOrderY + 26;
  doc.font(boldFont)
     .fontSize(9)
     .fillColor('#000000')
     .text(isCOD ? 'COD' : 'PREPAID', rightOrderX, paymentStatusY, {
       width: rightOrderWidth,
       align: 'left',
     });
  
  currentY = section3Y + section3Height;
  
  // Divider line between section 3 and 4
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // ============================================
  // SECTION 4: ITEM DETAILS (Minimal - 12%)
  // ============================================
  const section4Height = totalHeight * 0.12;
  const section4Y = currentY;
  
  doc.font(boldFont)
     .fontSize(headerFontSize)
     .fillColor('#000000')
     .text('ITEM DETAILS', contentX + padding, section4Y + padding, {
       width: maxWidth - padding * 2,
       align: 'left',
     });
  
  // Responsive table columns
  const tableY = section4Y + padding + 16;
  const descCol = maxWidth * 0.60;
  const qtyCol = maxWidth * 0.15;
  const amountCol = maxWidth * 0.25;
  const startX = contentX + padding;
  
  doc.font(boldFont)
     .fontSize(7)
     .fillColor('#000000')
     .text('Description', startX, tableY, { width: descCol - 5, align: 'left' })
     .text('Qty', startX + descCol, tableY, { width: qtyCol, align: 'center' })
     .text('Amount', startX + descCol + qtyCol, tableY, { width: amountCol - 5, align: 'right' });
  
  // Divider line
  doc.strokeColor('#CCCCCC')
     .lineWidth(0.3)
     .moveTo(startX, tableY + 12)
     .lineTo(startX + descCol + qtyCol + amountCol, tableY + 12)
     .stroke();
  
  // Item Data - Only 1 row
  const items = shipment.orderId?.items || [];
  const itemY = tableY + 16;
  
  // FIX 2: Amount padding from right border
  const amountPadding = 8;
  
  if (items.length > 0) {
    const item = items[0];
    const desc = item.name || item.productName || item.sku || 'Product';
    const descDisplay = desc.length > 30 ? desc.substring(0, 30) + '...' : desc;
    
    doc.font(regularFont)
       .fontSize(7.5)
       .fillColor('#000000')
       .text(descDisplay, startX + 4, itemY, { width: descCol - 8, align: 'left' })
       .text(item.quantity || 1, startX + descCol, itemY, { width: qtyCol, align: 'center' })
       // FIX 2: Add padding from right edge
       .text(`₹${(item.price || item.amount || 0) * (item.quantity || 1)}`, 
         startX + descCol + qtyCol + amountPadding, itemY, { 
         width: amountCol - amountPadding - 4, 
         align: 'right' 
       });
    
    if (items.length > 1) {
      doc.font(regularFont)
         .fontSize(6)
         .fillColor('#999999')
         .text(`+ ${items.length - 1} more`, startX + descCol + 10, itemY + 14, { 
           width: descCol - 20, 
           align: 'left' 
         });
    }
  } else {
    doc.font(regularFont)
       .fontSize(7.5)
       .fillColor('#000000')
       .text('Product', startX + 4, itemY, { width: descCol - 8, align: 'left' })
       .text('1', startX + descCol, itemY, { width: qtyCol, align: 'center' })
       .text(`₹${shipment.orderId?.amount || 0}`, startX + descCol + qtyCol + amountPadding, itemY, { 
         width: amountCol - amountPadding - 4, 
         align: 'right' 
       });
  }
  
  currentY = section4Y + section4Height;
  
  // Divider line between section 4 and 5
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // ============================================
  // SECTION 5: QR CODE + TERMS (10%)
  // ============================================
  const section5Height = totalHeight * 0.10;
  const section5Y = currentY;
  
  const dividerX5 = contentX + maxWidth * 0.25;
  doc.moveTo(dividerX5, section5Y)
     .lineTo(dividerX5, section5Y + section5Height)
     .stroke();
  
  // LEFT: QR CODE (25%)
  const qrLeftX = contentX + padding;
  const qrWidth = maxWidth * 0.25 - padding * 2;
  
  if (qrCode) {
    try {
      const qrSize = Math.min(38, section5Height - 16);
      const qrX = qrLeftX + (qrWidth - qrSize) / 2;
      const qrY = section5Y + (section5Height - qrSize) / 2;
      
      const qrBuffer = await QRCode.toBuffer(shipment.awb, {
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 5,
      });

      doc.image(qrBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }
  
  // RIGHT: Terms & Conditions (75%)
  // FIX 3: More gap between QR and text
  const termsX = dividerX5 + 18; // Increased from padding to 18
  const termsWidth = maxWidth * 0.75 - padding * 2 - 8;
  
  doc.font(regularFont)
     .fontSize(7)
     .fillColor('#555555');
  
  const termsStartY = section5Y + padding + 8;
  const termsLineHeight = 16;
  
  const terms = [
    'Handle With Care',
    'Track using QR',
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, termsX, termsStartY + (index * termsLineHeight), {
      width: termsWidth,
      align: 'left',
    });
  });

  // Restore position if we translated
  if (hasPosition) {
    doc.restore();
  }
}

// ===============================
// HELPER: Render Complete Label (Keep for backward compatibility)
// ===============================
async function renderLabel(doc, shipment, settings = {}, labelWidth = null, labelHeight = null, x = 0, y = 0) {
  return renderLabelV2(doc, shipment, settings, labelWidth, labelHeight, x, y);
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