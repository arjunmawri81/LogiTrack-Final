const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");
const { ORDER_STATUS_MAP, SHIPMENT_STATUSES } = require("../constants/statusConstants");
const Courier = require("../models/Courier");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// ===============================
// LOGGER (Simple Structured Logger)
// ===============================
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      }));
    }
  }
};

// ===============================
// HELPER: Build Shipment Payload (DRY)
// ===============================
function buildShipmentPayload(order) {
  return {
    order_id: order._id.toString(),
    order_number: order.orderNumber || `ORD${Date.now()}`,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    customer_city: order.customerCity,
    customer_state: order.customerState,
    customer_pincode: order.customerPincode,
    weight: order.weight || 0.5,
    length: order.dimensions?.length || 0,
    breadth: order.dimensions?.breadth || 0,
    height: order.dimensions?.height || 0,
    amount: order.amount || 0,
    payment_mode: order.paymentMode || "PREPAID",
    cod_amount: order.paymentMode === "COD" ? order.amount : 0,
    items: order.items || [],
    created_at: new Date().toISOString()
  };
}

// ===============================
// GENERIC FAKE PROVIDER FACTORY (DRY)
// ===============================
function createFakeProvider(providerName, prefix, deliveryDays) {
  return async function(order) {
    const payload = buildShipmentPayload(order);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      success: true,
      statusCode: 200,
      provider: providerName.toUpperCase(),
      request: payload,
      response: {
        shipment_id: `${prefix}${timestamp}${random}`,
        awb: `AWB${timestamp}${random}`,
        pickup_request_id: `PICK${timestamp}${random}`,
        tracking_id: `TRK${timestamp}${random}`,
        label_url: "",
        manifest_url: "",
        tracking_url: "",
        status: "PICKUP_PENDING",
        estimated_delivery: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  };
}

// ===============================
// FAKE PROVIDER IMPLEMENTATIONS (Using Factory)
// ===============================
const FakeDelhivery = createFakeProvider("Delhivery", "DLV", 5);
const FakeBlueDart = createFakeProvider("BlueDart", "BD", 3);
const FakeDTDC = createFakeProvider("DTDC", "DT", 4);
const FakeXpressbees = createFakeProvider("Xpressbees", "XB", 4);
const FakeShadowfax = createFakeProvider("Shadowfax", "SF", 2);
const FakeEcomExpress = createFakeProvider("EcomExpress", "EC", 4);

// ===============================
// PROVIDER REGISTRY (Production Ready - FIX for XPB)
// ===============================
const PROVIDER_REGISTRY = {
  // Standard codes (as per Courier model)
  DELHIVERY: FakeDelhivery,
  BLUEDART: FakeBlueDart,
  DTDC: FakeDTDC,
  XPRESSBEES: FakeXpressbees,
  SHADOWFAX: FakeShadowfax,
  ECOMEXPRESS: FakeEcomExpress,
  
  // Aliases (for backward compatibility / different codes)
  XPB: FakeXpressbees,      // ✅ Your Xpressbees code
  XB: FakeXpressbees,       // ✅ Alternative Xpressbees code
  ECOM: FakeEcomExpress,    // ✅ Short form
  DLV: FakeDelhivery,       // ✅ Short form
  BD: FakeBlueDart,         // ✅ Short form
  DT: FakeDTDC,             // ✅ Short form
  SF: FakeShadowfax,        // ✅ Short form
};

// ===============================
// GENERIC TRACKING RESPONSE FACTORY
// ===============================
function createTrackingResponse(providerName, awb, deliveryDays) {
  const timeline = [
    {
      status: "PICKUP_PENDING",
      location: "Origin",
      remarks: "Shipment created",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      status: "PICKUP_SCHEDULED",
      location: "Origin",
      remarks: "Pickup scheduled",
      timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      status: "PICKED_UP",
      location: "Origin Hub",
      remarks: "Shipment picked up",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      status: "IN_TRANSIT",
      location: "Sorting Hub",
      remarks: "Shipment in transit",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    success: true,
    statusCode: 200,
    provider: providerName.toUpperCase(),
    response: {
      awb: awb,
      status: "IN_TRANSIT",
      timeline: timeline,
      estimated_delivery: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    }
  };
}

// ===============================
// GENERIC SERVICEABILITY RESPONSE FACTORY
// ===============================
function createServiceabilityResponse(providerName, pincode, isServiceable = true) {
  const daysMap = {
    "DELHIVERY": 4,
    "BLUEDART": 2,
    "DTDC": 4,
    "XPRESSBEES": 4,
    "SHADOWFAX": 1,
    "ECOMEXPRESS": 4
  };

  return {
    success: isServiceable,
    statusCode: isServiceable ? 200 : 404,
    provider: providerName.toUpperCase(),
    response: {
      serviceable: isServiceable,
      pickupAvailable: isServiceable,
      codAvailable: isServiceable,
      prepaidAvailable: isServiceable,
      estimatedDays: daysMap[providerName.toUpperCase()] || 4,
      pincode: pincode || "110001",
      message: isServiceable ? "Service available for this pincode" : "Service not available for this pincode"
    }
  };
}

// ===============================
// GENERIC RATES RESPONSE FACTORY
// ===============================
function createRatesResponse(providerName, order) {
  const rateMap = {
    "DELHIVERY": { forward: 68, cod: 40, fuel: 12, insurance: 10 },
    "BLUEDART": { forward: 85, cod: 50, fuel: 15, insurance: 12 },
    "DTDC": { forward: 72, cod: 42, fuel: 13, insurance: 10 },
    "XPRESSBEES": { forward: 65, cod: 38, fuel: 11, insurance: 9 },
    "SHADOWFAX": { forward: 55, cod: 35, fuel: 10, insurance: 8 },
    "ECOMEXPRESS": { forward: 70, cod: 40, fuel: 12, insurance: 10 }
  };

  const rates = rateMap[providerName.toUpperCase()] || rateMap["DELHIVERY"];
  const weight = order.weight || 0.5;
  let weightCharge = rates.forward;
  
  if (weight > 0.5) {
    weightCharge = rates.forward + Math.ceil((weight - 0.5) * 0.5) * 15;
  }

  const isCOD = order.paymentMode === "COD";
  const total = weightCharge + (isCOD ? rates.cod : 0) + rates.fuel + (order.insuranceEnabled ? rates.insurance : 0);

  return {
    success: true,
    statusCode: 200,
    provider: providerName.toUpperCase(),
    response: {
      rates: {
        forward: Math.round(weightCharge),
        cod: isCOD ? rates.cod : 0,
        fuel: rates.fuel,
        insurance: order.insuranceEnabled ? rates.insurance : 0,
        total: Math.round(total)
      },
      weight: weight,
      payment_mode: order.paymentMode || "PREPAID",
      currency: "INR",
      message: "Rates calculated successfully"
    }
  };
}

// ===============================
// GENERIC PICKUP RESPONSE FACTORY
// ===============================
function createPickupResponse(providerName, shipmentId) {
  return {
    success: true,
    statusCode: 200,
    provider: providerName.toUpperCase(),
    response: {
      pickup_request_id: `PICK${Date.now()}`,
      shipment_id: shipmentId,
      status: "SCHEDULED",
      scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      message: "Pickup scheduled successfully"
    }
  };
}

// ===============================
// GENERIC CANCEL RESPONSE FACTORY
// ===============================
function createCancelResponse(providerName, shipmentId) {
  return {
    success: true,
    statusCode: 200,
    provider: providerName.toUpperCase(),
    response: {
      shipment_id: shipmentId,
      status: "CANCELLED",
      message: `${providerName} shipment cancelled successfully`,
      cancelled_at: new Date().toISOString()
    }
  };
}

// ===============================
// COURIER SERVICE (PROVIDER SWITCH - FIXED)
// ===============================
const CourierService = {
  async createShipment(courier, order) {
    logger.info(`Creating shipment for courier: ${courier.code}`, { 
      orderId: order._id,
      courierCode: courier.code 
    });

    // ✅ Get provider from registry
    const provider = PROVIDER_REGISTRY[courier.code?.toUpperCase()];
    
    if (!provider) {
      logger.error(`Unsupported courier: ${courier.code}`, { 
        courierCode: courier.code,
        availableCodes: Object.keys(PROVIDER_REGISTRY) 
      });
      throw new Error(`Courier ${courier.code} is not supported`);
    }

    const result = await provider(order);

    logger.info(`Shipment created successfully`, { 
      awb: result.response.awb,
      provider: result.provider 
    });

    // Transform to controller expected format
    return {
      success: result.success,
      provider: result.provider,
      providerShipmentId: result.response.shipment_id,
      providerTrackingId: result.response.tracking_id,
      awb: result.response.awb,
      labelUrl: result.response.label_url,
      manifestUrl: result.response.manifest_url,
      trackingUrl: result.response.tracking_url,
      status: result.response.status,
      estimatedDeliveryDate: new Date(result.response.estimated_delivery),
      rawResponse: result
    };
  },

  async cancelShipment(courier, shipmentId) {
    logger.info(`Cancelling shipment for courier: ${courier.code}`, { shipmentId });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Get provider name from registry key
    const providerKey = courier.code?.toUpperCase();
    const providerName = Object.keys(PROVIDER_REGISTRY).find(key => key === providerKey) || courier.code;
    
    // ✅ Check if provider exists
    if (!PROVIDER_REGISTRY[providerKey]) {
      logger.error(`Unsupported courier for cancellation: ${courier.code}`);
      throw new Error(`Courier ${courier.code} is not supported`);
    }

    const result = createCancelResponse(providerName, shipmentId);

    logger.info(`Shipment cancelled successfully`, { shipmentId });
    return result;
  },

  async trackShipment(courier, awb) {
    logger.info(`Tracking shipment for courier: ${courier.code}`, { awb });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Get provider key
    const providerKey = courier.code?.toUpperCase();
    
    // ✅ Check if provider exists
    if (!PROVIDER_REGISTRY[providerKey]) {
      logger.error(`Unsupported courier for tracking: ${courier.code}`);
      throw new Error(`Courier ${courier.code} is not supported`);
    }

    // Determine delivery days based on provider
    const deliveryDaysMap = {
      "DELHIVERY": 3,
      "BLUEDART": 2,
      "DTDC": 3,
      "XPRESSBEES": 3,
      "XPB": 3,
      "SHADOWFAX": 1,
      "ECOMEXPRESS": 3
    };

    const deliveryDays = deliveryDaysMap[providerKey] || 3;
    const providerName = Object.keys(PROVIDER_REGISTRY).find(key => key === providerKey) || courier.code;
    
    const result = createTrackingResponse(providerName, awb, deliveryDays);

    logger.info(`Tracking retrieved successfully`, { awb, status: result.response.status });
    return result;
  },

  async serviceability(courier, pincode) {
    logger.info(`Checking serviceability for courier: ${courier.code}`, { pincode });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Get provider key
    const providerKey = courier.code?.toUpperCase();
    
    // ✅ Check if provider exists in registry
    const isSupported = !!PROVIDER_REGISTRY[providerKey];
    
    const result = createServiceabilityResponse(
      isSupported ? providerKey : courier.code, 
      pincode, 
      isSupported
    );

    logger.info(`Serviceability check completed`, { 
      courier: courier.code, 
      serviceable: result.response.serviceable 
    });
    return result;
  },

  async getRates(courier, order) {
    logger.info(`Getting rates for courier: ${courier.code}`, { 
      orderId: order._id,
      weight: order.weight 
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Get provider key
    const providerKey = courier.code?.toUpperCase();
    
    // ✅ Check if provider exists
    if (!PROVIDER_REGISTRY[providerKey]) {
      logger.error(`Unsupported courier for rates: ${courier.code}`);
      throw new Error(`Courier ${courier.code} is not supported`);
    }

    const result = createRatesResponse(providerKey, order);
    
    logger.info(`Rates calculated successfully`, { 
      courier: courier.code,
      total: result.response.rates.total 
    });
    return result;
  },

  async schedulePickup(courier, shipmentId) {
    logger.info(`Scheduling pickup for courier: ${courier.code}`, { shipmentId });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Get provider key
    const providerKey = courier.code?.toUpperCase();
    
    // ✅ Check if provider exists
    if (!PROVIDER_REGISTRY[providerKey]) {
      logger.error(`Unsupported courier for pickup: ${courier.code}`);
      throw new Error(`Courier ${courier.code} is not supported`);
    }

    const providerName = Object.keys(PROVIDER_REGISTRY).find(key => key === providerKey) || courier.code;
    const result = createPickupResponse(providerName, shipmentId);

    logger.info(`Pickup scheduled successfully`, { shipmentId });
    return result;
  }
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
    logger.error("Logo loading error", { error: error.message, logoPath });
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

  const hasPosition = x !== 0 || y !== 0;
  if (hasPosition) {
    doc.save();
    doc.translate(x, y);
  }

  const maxWidth = labelWidth || doc.page.width - (doc.page.margins?.left || 40) * 2;
  const contentX = hasPosition ? 0 : (doc.page.margins?.left || 40);
  const contentY = hasPosition ? 0 : (doc.page.margins?.top || 40);
  
  let currentY = contentY;
  const padding = 10;
  const fontSize = 7.5;
  const headerFontSize = 8.5;
  const boldFont = 'Helvetica-Bold';
  const regularFont = 'Helvetica';
  
  const totalHeight = labelHeight || 420;
  
  // SECTION 1: SHIP TO + LOGO (18%)
  const section1Height = totalHeight * 0.18;
  const section1Y = currentY;
  
  doc.strokeColor('#000000')
     .lineWidth(0.3)
     .rect(contentX, section1Y, maxWidth, totalHeight)
     .stroke();
  
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
  
  const nameY = section1Y + padding + 16;
  doc.font(boldFont)
     .fontSize(9)
     .fillColor('#000000')
     .text(shipment.orderId?.customerName || 'N/A', leftX, nameY, {
       width: leftWidth - padding,
       align: 'left',
     });
  
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
  
  const addressY = phoneY + 13;
  let addressText = shipment.orderId?.customerAddress || 'N/A';
  if (shipment.orderId?.customerCity && shipment.orderId?.customerState) {
    addressText = `${shipment.orderId?.customerAddress || ''}, ${shipment.orderId?.customerCity || ''}, ${shipment.orderId?.customerState || ''}`;
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
        logger.error("Logo rendering error", { error: err.message });
        doc.strokeColor('#E0E0E0')
           .lineWidth(0.5)
           .rect(rightX + 10, section1Y + section1Height/2 - 15, rightWidth - 20, 30)
           .stroke();
      }
    }
  }
  
  currentY = section1Y + section1Height;
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // SECTION 2: BARCODE (52%) + SHIPMENT INFO (48%)
  const section2Height = totalHeight * 0.25;
  const section2Y = currentY;
  
  const dividerX = contentX + maxWidth * 0.52;
  doc.moveTo(dividerX, section2Y)
     .lineTo(dividerX, section2Y + section2Height)
     .stroke();
  
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
    
    const awbTextY = section2Y + section2Height - 16;
    const awbTextWidth = maxWidth * 0.52 - padding * 2;
    const isThermal = maxWidth < 300;
    const awbFontSize = isThermal ? 6.5 : 8;
    
    doc.font(boldFont)
       .fontSize(awbFontSize)
       .fillColor('#000000')
       .text(barcodeValue, contentX + padding, awbTextY, {
         width: awbTextWidth,
         align: 'center',
         lineBreak: false,
       });
  } catch (err) {
    logger.error("Barcode generation error", { error: err.message });
    doc.font(boldFont)
       .fontSize(10)
       .fillColor('#000000')
       .text(barcodeValue, contentX + padding, section2Y + section2Height/2 - 6, {
         width: maxWidth * 0.52 - padding * 2,
         align: 'center',
       });
  }
  
  const infoX = dividerX + padding;
  const infoWidth = maxWidth * 0.48 - padding * 2;
  const infoStartY = section2Y + padding + 5;
  const infoLineHeight = 16;
  const labelWidth_ = 50;
  const valueWidth = infoWidth - labelWidth_ - 5;
  
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
  
  const awbY = infoStartY + infoLineHeight;
  doc.font(regularFont)
     .fontSize(6.5)
     .fillColor('#666666')
     .text('AWB', infoX, awbY, { width: labelWidth_, align: 'left' });
  
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
       lineBreak: false,
     });
  
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
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // SECTION 3: SHIP FROM + ORDER DETAILS (20%)
  const section3Height = totalHeight * 0.20;
  const section3Y = currentY;
  
  const dividerX3 = contentX + maxWidth / 2;
  doc.moveTo(dividerX3, section3Y)
     .lineTo(dividerX3, section3Y + section3Height)
     .stroke();
  
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
      logger.error("Order barcode error", { error: err.message });
    }
  }
  
  const paymentStatusY = barcodeOrderY + 26;
  doc.font(boldFont)
     .fontSize(9)
     .fillColor('#000000')
     .text(isCOD ? 'COD' : 'PREPAID', rightOrderX, paymentStatusY, {
       width: rightOrderWidth,
       align: 'left',
     });
  
  currentY = section3Y + section3Height;
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // SECTION 4: ITEM DETAILS (Minimal - 12%)
  const section4Height = totalHeight * 0.12;
  const section4Y = currentY;
  
  doc.font(boldFont)
     .fontSize(headerFontSize)
     .fillColor('#000000')
     .text('ITEM DETAILS', contentX + padding, section4Y + padding, {
       width: maxWidth - padding * 2,
       align: 'left',
     });
  
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
  
  doc.strokeColor('#CCCCCC')
     .lineWidth(0.3)
     .moveTo(startX, tableY + 12)
     .lineTo(startX + descCol + qtyCol + amountCol, tableY + 12)
     .stroke();
  
  const items = shipment.orderId?.items || [];
  const itemY = tableY + 16;
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
  doc.moveTo(contentX, currentY)
     .lineTo(contentX + maxWidth, currentY)
     .stroke();
  
  // SECTION 5: QR CODE + TERMS (10%)
  const section5Height = totalHeight * 0.10;
  const section5Y = currentY;
  
  const dividerX5 = contentX + maxWidth * 0.25;
  doc.moveTo(dividerX5, section5Y)
     .lineTo(dividerX5, section5Y + section5Height)
     .stroke();
  
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
      logger.error("QR generation error", { error: err.message });
    }
  }
  
  const termsX = dividerX5 + 18;
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

  if (hasPosition) {
    doc.restore();
  }
}

// ===============================
// HELPER: Render Complete Label
// ===============================
async function renderLabel(doc, shipment, settings = {}, labelWidth = null, labelHeight = null, x = 0, y = 0) {
  return renderLabelV2(doc, shipment, settings, labelWidth, labelHeight, x, y);
}

// ===============================
// CREATE SHIPMENT WITH TRANSACTION
// ===============================
const createShipment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info("Create shipment request received", { 
      userId: req.user?.id,
      body: req.body 
    });

    const {
      orderId,
      courierId,
      insuranceEnabled = false,
    } = req.body;

    if (!orderId || !courierId) {
      await session.abortTransaction();
      logger.warn("Missing required fields", { orderId, courierId });
      return res.status(400).json({
        success: false,
        message: "OrderId and CourierId are required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      merchantId: req.user.id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      logger.warn("Order not found", { orderId, userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const existingShipment = await Shipment.findOne({
      orderId,
      merchantId: req.user.id,
    }).session(session);

    if (existingShipment) {
      await session.abortTransaction();
      logger.warn("Shipment already exists", { orderId });
      return res.status(400).json({
        success: false,
        message: "Shipment already exists for this order",
      });
    }

    const courier = await Courier.findById(courierId).session(session);

    if (!courier) {
      await session.abortTransaction();
      logger.warn("Courier not found", { courierId });
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId: req.user.id,
      courierId,
      isActive: true,
    }).session(session);

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        isActive: true,
      }).session(session);
    }

    if (!rateCard) {
      await session.abortTransaction();
      logger.warn("No rate card found", { merchantId: req.user.id, courierId });
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
    } else if (weight <= 10) {
      SHIPPING_CHARGE = rateCard.forwardRates?.rate10kg || 0;
    } else {
      SHIPPING_CHARGE = 
        (rateCard.forwardRates?.rate10kg || 0) +
        (Math.ceil(weight - 10) * (rateCard.forwardRates?.additionalKg || 0));
    }

    if (order.paymentMode === "COD") {
      SHIPPING_CHARGE += rateCard.codCharge || 0;
    }

    // ✅ Convert env values to numbers
    const insurancePercentage = Number(process.env.INSURANCE_PERCENTAGE || 2);
    let insurancePremium = 0;

    if (insuranceEnabled) {
      insurancePremium = Math.ceil(
        (order.amount || 0) * (insurancePercentage / 100)
      );
      SHIPPING_CHARGE += insurancePremium;
    }

    order.shippingCharge = SHIPPING_CHARGE;
    await order.save({ session });

    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    }).session(session);

    if (!wallet) {
      const [newWallet] = await Wallet.create(
        [{
          merchantId: req.user.id,
          balance: 0,
        }],
        { session }
      );
      wallet = newWallet;
    }

    if (wallet.balance < SHIPPING_CHARGE) {
      await session.abortTransaction();
      logger.warn("Insufficient wallet balance", { 
        balance: wallet.balance, 
        required: SHIPPING_CHARGE 
      });
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance",
        balance: wallet.balance,
        required: SHIPPING_CHARGE,
      });
    }

    // ===============================
    // COURIER API INTEGRATION (FIXED)
    // ===============================
    const courierResponse = await CourierService.createShipment(
      courier,
      order
    );

    const awb = courierResponse.awb;
    const labelUrl = courierResponse.labelUrl;

    const shipment = await Shipment.create([{
      orderId,
      merchantId: req.user.id,
      courier: courier.name,
      courierId: courier._id,
      awb,
      labelUrl,
      status: "PICKUP_PENDING",
      insuranceEnabled,
      insuranceAmount: order.amount || 0,
      insurancePremium,
      provider: courierResponse.provider,
      providerShipmentId: courierResponse.providerShipmentId,
      providerTrackingId: courierResponse.providerTrackingId,
      providerStatus: courierResponse.status,
      trackingUrl: courierResponse.trackingUrl,
      manifestUrl: courierResponse.manifestUrl,
      apiResponse: courierResponse.rawResponse,
      expectedDeliveryDate: courierResponse.estimatedDeliveryDate,
      tracking: [
        {
          status: "PICKUP_PENDING",
          location: courier.name,
          remarks: "Shipment Created",
          eventTime: new Date(),
        },
      ],
    }], { session });

    const createdShipment = shipment[0];

    wallet.balance -= SHIPPING_CHARGE;
    wallet.transactions.push({
      amount: SHIPPING_CHARGE,
      type: "DEBIT",
      description: `Shipment Charge - Order #${order.orderNumber || order._id.toString().slice(-6)}`,
      createdAt: new Date(),
    });
    await wallet.save({ session });

    // ✅ Convert env values to numbers
    const taxPercentage = Number(process.env.GST_PERCENTAGE || 18);
    const taxAmount = Math.ceil((order.amount || 0) * (taxPercentage / 100));

    const invoice = await Invoice.create([{
      invoiceNumber: generateInvoiceNumber(),
      merchantId: req.user.id,
      orderId: order._id,
      shipmentId: createdShipment._id,
      amount: order.amount || 0,
      taxAmount: taxAmount,
      shippingCharge: SHIPPING_CHARGE,
      insuranceCharge: insurancePremium,
      paymentMethod: order.paymentMode || "COD",
      status: "PAID",
    }], { session });

    const createdInvoice = invoice[0];

    createdShipment.invoiceId = createdInvoice._id;
    await createdShipment.save({ session });

    order.shipmentId = createdShipment._id;
    order.invoiceId = createdInvoice._id;
    order.awb = createdShipment.awb;
    
    // ✅ Keep if Order model has courierPartner field, else remove
    if (order.schema.paths && order.schema.paths.courierPartner) {
      order.courierPartner = createdShipment.courier;
    }
    
    order.status = ORDER_STATUS_MAP[createdShipment.status] || "READY_FOR_PICKUP";
    await order.save({ session });

    await session.commitTransaction();

    logger.info("Shipment created successfully", { 
      shipmentId: createdShipment._id,
      awb: createdShipment.awb,
      orderId: order._id 
    });

    const finalShipment = await Shipment.findById(createdShipment._id)
      .populate("orderId")
      .populate("invoiceId")
      .populate("merchantId", "companyName phone logo gst");

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
    await session.abortTransaction();
    logger.error("Shipment creation failed", { 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      userId: req.user?.id 
    });

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    await session.endSession(); // ✅ Always cleanup
  }
};

// ===============================
// BULK CREATE SHIPMENTS WITH TRANSACTION
// ===============================
const createBulkShipments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info("Bulk shipment request received", { 
      userId: req.user?.id,
      body: req.body 
    });

    const { orderIds, courierId } = req.body;

    if (!orderIds || orderIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "No orders selected",
      });
    }

    if (!courierId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "CourierId is required",
      });
    }

    const courier = await Courier.findById(courierId).session(session);

    if (!courier) {
      await session.abortTransaction();
      logger.warn("Courier not found", { courierId });
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId: req.user.id,
      courierId,
      isActive: true,
    }).session(session);

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        isActive: true,
      }).session(session);
    }

    if (!rateCard) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "No pricing available for this courier. Please contact administrator.",
      });
    }

    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    }).session(session);

    if (!wallet) {
      const [newWallet] = await Wallet.create(
        [{
          merchantId: req.user.id,
          balance: 0,
        }],
        { session }
      );
      wallet = newWallet;
    }

    const shipments = [];
    const failedOrders = [];
    const skippedOrders = [];
    let totalCharges = 0;
    const createdShipmentIds = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findOne({
          _id: orderId,
          merchantId: req.user.id,
        }).session(session);

        if (!order) {
          failedOrders.push({ orderId, reason: "Order not found" });
          continue;
        }

        const existingShipment = await Shipment.findOne({
          orderId,
          merchantId: req.user.id,
        }).session(session);

        if (existingShipment) {
          skippedOrders.push({ orderId, reason: "Shipment already exists" });
          continue;
        }

        const weight = Number(order.weight || 0);
        let shippingCharge = 0;

        if (weight <= 0.5) {
          shippingCharge = rateCard.forwardRates?.rate500gm || 0;
        } else if (weight <= 1) {
          shippingCharge = rateCard.forwardRates?.rate1kg || 0;
        } else if (weight <= 2) {
          shippingCharge = rateCard.forwardRates?.rate2kg || 0;
        } else if (weight <= 5) {
          shippingCharge = rateCard.forwardRates?.rate5kg || 0;
        } else if (weight <= 10) {
          shippingCharge = rateCard.forwardRates?.rate10kg || 0;
        } else {
          shippingCharge = 
            (rateCard.forwardRates?.rate10kg || 0) +
            (Math.ceil(weight - 10) * (rateCard.forwardRates?.additionalKg || 0));
        }

        if (order.paymentMode === "COD") {
          shippingCharge += rateCard.codCharge || 0;
        }

        totalCharges += shippingCharge;

        if (wallet.balance < totalCharges) {
          failedOrders.push({ 
            orderId, 
            reason: `Insufficient wallet balance. Required: ${totalCharges}, Available: ${wallet.balance}` 
          });
          continue;
        }

        // ===============================
        // COURIER API INTEGRATION (Bulk - FIXED)
        // ===============================
        const courierResponse = await CourierService.createShipment(
          courier,
          order
        );

        const awb = courierResponse.awb;
        const labelUrl = courierResponse.labelUrl;

        const shipment = await Shipment.create([{
          orderId,
          merchantId: req.user.id,
          courier: courier.name,
          courierId: courier._id,
          awb,
          labelUrl,
          status: "PICKUP_PENDING",
          insuranceEnabled: false,
          insuranceAmount: 0,
          insurancePremium: 0,
          provider: courierResponse.provider,
          providerShipmentId: courierResponse.providerShipmentId,
          providerTrackingId: courierResponse.providerTrackingId,
          providerStatus: courierResponse.status,
          trackingUrl: courierResponse.trackingUrl,
          manifestUrl: courierResponse.manifestUrl,
          apiResponse: courierResponse.rawResponse,
          expectedDeliveryDate: courierResponse.estimatedDeliveryDate,
          tracking: [
            {
              status: "PICKUP_PENDING",
              location: courier.name,
              remarks: "Bulk Shipment Created",
              eventTime: new Date(),
            },
          ],
        }], { session });

        const createdShipment = shipment[0];
        createdShipmentIds.push(createdShipment._id);

        const taxPercentage = Number(process.env.GST_PERCENTAGE || 18);
        const taxAmount = Math.ceil((order.amount || 0) * (taxPercentage / 100));

        const invoice = await Invoice.create([{
          invoiceNumber: generateInvoiceNumber(),
          merchantId: req.user.id,
          orderId: order._id,
          shipmentId: createdShipment._id,
          amount: order.amount || 0,
          taxAmount: taxAmount,
          shippingCharge: shippingCharge,
          insuranceCharge: 0,
          paymentMethod: order.paymentMode || "COD",
          status: "PAID",
        }], { session });

        const createdInvoice = invoice[0];

        createdShipment.invoiceId = createdInvoice._id;
        await createdShipment.save({ session });

        order.shipmentId = createdShipment._id;
        order.invoiceId = createdInvoice._id;
        order.awb = createdShipment.awb;
        
        // ✅ Keep if Order model has courierPartner field, else remove
        if (order.schema.paths && order.schema.paths.courierPartner) {
          order.courierPartner = createdShipment.courier;
        }
        
        order.status = ORDER_STATUS_MAP[createdShipment.status] || "READY_FOR_PICKUP";
        order.shippingCharge = shippingCharge;
        await order.save({ session });

        shipments.push(createdShipment);

        wallet.balance -= shippingCharge;
        wallet.transactions.push({
          amount: shippingCharge,
          type: "DEBIT",
          description: `Bulk Shipment Charge - Order #${order.orderNumber || order._id.toString().slice(-6)}`,
          createdAt: new Date(),
        });

      } catch (error) {
        logger.error("Bulk shipment error for order", { 
          orderId, 
          error: error.message 
        });
        failedOrders.push({ orderId, reason: error.message });
      }
    }

    await wallet.save({ session });

    await session.commitTransaction();

    logger.info("Bulk shipments created", { 
      total: shipments.length,
      skipped: skippedOrders.length,
      failed: failedOrders.length 
    });

    const populatedShipments = await Shipment.find({
      _id: { $in: shipments.map(s => s._id) }
    })
      .populate("orderId")
      .populate("invoiceId")
      .populate("merchantId", "companyName phone logo gst");

    return res.status(201).json({
      success: true,
      message: `${shipments.length} shipments created successfully`,
      shipments: populatedShipments,
      summary: {
        created: shipments.length,
        skipped: skippedOrders.length,
        failed: failedOrders.length,
        totalCharges,
        skippedOrders,
        failedOrders,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error("Bulk shipment creation failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession(); // ✅ Always cleanup
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
      .populate("courierId", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    logger.error("Get shipments failed", { error: error.message });
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
      .populate("courierId", "name code");

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
    logger.error("Get shipment by ID failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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
      .populate("courierId", "name code");

    if (!shipment) {
      logger.warn("Shipment not found for tracking", { awb: id });
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // ===============================
    // TRACK WITH COURIER SERVICE (Provider Switch - FIXED)
    // ===============================
    const courier = await Courier.findById(shipment.courierId);
    const tracking = await CourierService.trackShipment(courier, shipment.awb);

    logger.info("Shipment tracked successfully", { 
      awb: shipment.awb,
      status: tracking.response.status 
    });

    return res.status(200).json({
      success: true,
      shipment,
      tracking: tracking.response.timeline || [],
      courierStatus: tracking.response.status,
      estimatedDelivery: tracking.response.estimated_delivery,
    });
  } catch (error) {
    logger.error("Track shipment failed", { 
      error: error.message,
      awb: req.params.id 
    });
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

    if (!SHIPMENT_STATUSES.includes(status)) {
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

    if (shipment.status === "DELIVERED" || shipment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: `${shipment.status} shipment cannot be modified`,
      });
    }

    await shipment.addTrackingEvent(
      status,
      "Admin Panel",
      `Shipment status changed to ${status}`
    );

    const order = await Order.findById(shipment.orderId);

    if (order) {
      order.status = ORDER_STATUS_MAP[status] || order.status;
      await order.save();
    }

    // NDR LOGIC
    if (status === "NDR") {
      logger.info("NDR hit for shipment", { shipmentId: shipment._id });

      const existingNDR = await NDR.findOne({
        shipmentId: shipment._id,
      });

      if (!existingNDR) {
        try {
          const ndr = await NDR.create({
            shipmentId: shipment._id,
            orderId: shipment.orderId,
            merchantId: shipment.merchantId,
            awb: shipment.awb,
            reason: "Delivery Failed",
          });
          logger.info("NDR created", { ndrId: ndr._id });
        } catch (err) {
          logger.error("NDR creation error", { error: err.message });
        }
      }
    }

    // RTO LOGIC
    if (status === "RTO") {
      logger.info("RTO hit for shipment", { shipmentId: shipment._id });

      const existingRTO = await RTO.findOne({
        shipmentId: shipment._id,
      });

      if (!existingRTO) {
        try {
          const orderData = await Order.findById(shipment.orderId);

          const rto = await RTO.create({
            shipmentId: shipment._id,
            merchantId: shipment.merchantId,
            orderId: shipment.orderId,
            awb: shipment.awb,
            courier: shipment.courier,
            reason: "Returned To Origin",
            rtoReason: "Shipment marked as RTO by Admin",
            customerName: orderData?.customerName || "",
            customerPhone: orderData?.customerPhone || "",
            address: orderData?.customerAddress || "",
            pincode: orderData?.customerPincode || "",
            city: orderData?.customerCity || "",
            state: orderData?.customerState || "",
            status: "INITIATED",
            rtoRequestedAt: new Date(),
            createdBy: "admin",
            source: "manual",
            lastUpdatedBy: req.user.id,
            attemptHistory: [
              {
                date: new Date(),
                status: "INITIATED",
                remarks: "Shipment marked as RTO by Admin",
                updatedBy: req.user.id,
              },
            ],
          });

          logger.info("RTO created", { rtoId: rto._id });
        } catch (err) {
          logger.error("RTO creation error", { error: err.message });
          return res.status(500).json({
            success: false,
            message: "Failed to create RTO record",
            error: err.message,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
      shipment,
    });
  } catch (error) {
    logger.error("Update shipment status failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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

    // ===============================
    // SCHEDULE PICKUP WITH COURIER SERVICE (Provider Switch - FIXED)
    // ===============================
    const courier = await Courier.findById(shipment.courierId);
    await CourierService.schedulePickup(courier, shipment._id);

    await shipment.addTrackingEvent(
      "PICKUP_SCHEDULED",
      "Admin Panel",
      "Pickup Scheduled"
    );

    shipment.pickupDate = new Date();

    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.status = ORDER_STATUS_MAP["PICKUP_SCHEDULED"] || "READY_FOR_PICKUP";
      await order.save();
    }

    logger.info("Pickup scheduled successfully", { shipmentId: shipment._id });

    res.status(200).json({
      success: true,
      message: "Pickup Scheduled Successfully",
      shipment,
    });
  } catch (error) {
    logger.error("Schedule pickup failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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

    logger.info("QR code generated", { shipmentId: shipment._id });

    res.status(200).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    logger.error("QR generation failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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
      .populate("merchantId", "companyName phone logo gst")
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

    logger.info("Label generated", { 
      shipmentId: shipment._id,
      format: format 
    });

  } catch (error) {
    logger.error("Label generation failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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
      .populate("merchantId", "companyName phone logo gst")
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

    logger.info("Bulk labels generated", { 
      count: shipments.length,
      format: format 
    });

  } catch (error) {
    logger.error("Bulk labels generation failed", { 
      error: error.message 
    });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// CANCEL SHIPMENT
// ===============================
const cancelShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // ===============================
    // CANCEL WITH COURIER SERVICE (Provider Switch - FIXED)
    // ===============================
    const courier = await Courier.findById(shipment.courierId);
    await CourierService.cancelShipment(courier, shipment._id);

    shipment.status = "CANCELLED";
    await shipment.save();

    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.status = ORDER_STATUS_MAP["CANCELLED"] || "CANCELLED";
      await order.save();
    }

    logger.info("Shipment cancelled", { 
      shipmentId: shipment._id,
      awb: shipment.awb 
    });

    res.status(200).json({
      success: true,
      message: "Shipment cancelled successfully",
      shipment,
    });
  } catch (error) {
    logger.error("Cancel shipment failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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
      tracking: shipment.tracking || [],
    });
  } catch (error) {
    logger.error("Get tracking timeline failed", { 
      error: error.message,
      shipmentId: req.params.id 
    });
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
  cancelShipment,
};