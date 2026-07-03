const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const NDR = require("../models/NDR"); // ✅ Added NDR model
const AdmZip = require("adm-zip"); // ✅ Added for bulk labels

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
// CREATE SHIPMENT (UPDATED WITH INSURANCE & RATE CARD ENGINE)
// ===============================
const createShipment = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);

    const {
      orderId,
      courier,
      insuranceEnabled = false,
    } = req.body;

    if (!orderId || !courier) {
      return res.status(400).json({
        success: false,
        message: "OrderId and Courier are required",
      });
    }

    // ✅ CHANGED: Normalize courier name to UPPERCASE for consistency with RateCard
    const normalizedCourier = courier.trim().toUpperCase();

    // 1. Find Order
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

    // 2. DUPLICATE SHIPMENT CHECK
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

    // =====================================
    // ✅ UPDATED: RATE CARD ENGINE WITH rate5kg SUPPORT
    // 1. Merchant Rate
    // 2. Default Rate (Super Admin)
    // =====================================

    // Merchant Custom Rate
    let rateCard = await RateCard.findOne({
      merchantId: req.user.id,
      courierPartner: normalizedCourier,
      isActive: true,
    });

    // Default Rate (Super Admin)
    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierPartner: normalizedCourier,
        isActive: true,
      });
    }

    // Future Courier API Fallback
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "No pricing available for this courier. Please contact administrator.",
      });
    }

    const weight = Number(order.weight || 0);

    let SHIPPING_CHARGE = 0;

    // ✅ UPDATED: Weight logic with rate5kg support
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

    // ✅ Add COD charge if payment mode is COD
    if (order.paymentMode === "COD") {
      SHIPPING_CHARGE += rateCard.codCharge || 0;
    }

    // ✅ INSURANCE PREMIUM CALCULATION
    let insurancePremium = 0;

    if (insuranceEnabled) {
      insurancePremium = Math.ceil(
        (order.amount || 0) * 0.02 // 2% of order amount
      );

      SHIPPING_CHARGE += insurancePremium;
    }

    // ✅ Save shipping charge in order
    order.shippingCharge = SHIPPING_CHARGE;
    await order.save();

    // 4. Wallet Check
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

    // 5. Generate AWB and Create Shipment
    const awb = await generateAWB();

    console.log("===== BEFORE SHIPMENT CREATE =====");
    console.log({
      orderId,
      merchantId: req.user.id,
      courier: normalizedCourier,
      awb,
      insuranceEnabled,
      insuranceAmount: order.amount || 0,
      insurancePremium,
    });

    const shipment = await Shipment.create({
      orderId,
      merchantId: req.user.id,
      courier: normalizedCourier,
      courierPartner: normalizedCourier,
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

    // 6. Wallet Deduction
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

    // 7. Create Invoice
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

    // ✅ UPDATE ORDER WITH SHIPMENT AND INVOICE REFERENCES
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
      rateCardUsed: rateCard.courierPartner,
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
    const { orderIds, courier } = req.body;

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders selected",
      });
    }

    if (!courier) {
      return res.status(400).json({
        success: false,
        message: "Courier is required",
      });
    }

    // ✅ CHANGED: Normalize to UPPERCASE
    const normalizedCourier = courier.trim().toUpperCase();
    const shipments = [];
    const failedOrders = [];
    const skippedOrders = [];

    for (const orderId of orderIds) {
      try {
        // Check if order exists and belongs to merchant
        const order = await Order.findOne({
          _id: orderId,
          merchantId: req.user.id,
        });

        if (!order) {
          failedOrders.push({ orderId, reason: "Order not found" });
          continue;
        }

        // Check if shipment already exists
        const existingShipment = await Shipment.findOne({
          orderId,
          merchantId: req.user.id,
        });

        if (existingShipment) {
          skippedOrders.push({ orderId, reason: "Shipment already exists" });
          continue;
        }

        // Generate AWB
        const awb = "AWB" + Date.now() + Math.floor(Math.random() * 10000);

        // Create shipment
        const shipment = await Shipment.create({
          orderId,
          merchantId: req.user.id,
          courier: normalizedCourier,
          courierPartner: normalizedCourier,
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

        // ✅ UPDATE ORDER WITH SHIPMENT REFERENCE
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
// GET ALL SHIPMENTS (UPDATED WITH NESTED POPULATE)
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
      .populate("invoiceId");

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
      .populate("invoiceId");

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
// UPDATE SHIPMENT STATUS (FIXED WITH ORDER STATUS MAPPING)
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
// GENERATE PDF LABEL (SECURED)
// ===============================
const generateLabel = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    }).populate("orderId");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found or unauthorized",
      });
    }

    const doc = new PDFDocument({ size: "A6", margin: 20 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${shipment.awb}.pdf`);

    doc.pipe(res);

    doc.fontSize(18).text("LOGITRACK SHIPPING LABEL", { align: "center" });
    doc.moveDown();
    
    doc.fontSize(12).text(`AWB: ${shipment.awb}`);
    doc.text(`Courier: ${shipment.courier}`);
    doc.moveDown();
    
    doc.text(`Customer: ${shipment.orderId.customerName}`);
    doc.text(`Phone: ${shipment.orderId.customerPhone}`);
    doc.text(`Address: ${shipment.orderId.customerAddress}`);
    doc.text(`Order No: ${shipment.orderId.orderNumber}`);
    doc.text(`Payment: ${shipment.orderId.paymentMode}`);
    doc.text(`Amount: ₹${shipment.orderId.amount}`);
    
    if (shipment.insuranceEnabled) {
      doc.text(`Insurance: ₹${shipment.insuranceAmount} (Premium: ₹${shipment.insurancePremium})`);
    }
    
    doc.moveDown();

    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: shipment.awb,
      scale: 3,
      height: 10,
    });

    doc.image(barcodeBuffer, { width: 180 });
    doc.end();
  } catch (error) {
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
// BULK LABELS (NEW FUNCTION)
// ===============================
const bulkLabels = async (req, res) => {
  try {
    const { shipmentIds } = req.body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No shipment IDs provided",
      });
    }

    const shipments = await Shipment.find({
      _id: { $in: shipmentIds },
      merchantId: req.user.id,
    }).populate("orderId");

    if (shipments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shipments found",
      });
    }

    const zip = new AdmZip();

    for (const shipment of shipments) {
      try {
        const doc = new PDFDocument({ size: "A6", margin: 20 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          zip.addFile(`label_${shipment.awb}.pdf`, pdfBuffer);
        });

        doc.fontSize(18).text("LOGITRACK SHIPPING LABEL", { align: "center" });
        doc.moveDown();
        
        doc.fontSize(12).text(`AWB: ${shipment.awb}`);
        doc.text(`Courier: ${shipment.courier}`);
        doc.moveDown();
        
        if (shipment.orderId) {
          doc.text(`Customer: ${shipment.orderId.customerName || 'N/A'}`);
          doc.text(`Phone: ${shipment.orderId.customerPhone || 'N/A'}`);
          doc.text(`Address: ${shipment.orderId.customerAddress || 'N/A'}`);
          doc.text(`Order No: ${shipment.orderId.orderNumber || 'N/A'}`);
          doc.text(`Amount: ₹${shipment.orderId.amount || 0}`);
        }

        if (shipment.insuranceEnabled) {
          doc.text(`Insurance: ₹${shipment.insuranceAmount} (Premium: ₹${shipment.insurancePremium})`);
        }

        doc.moveDown();

        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: "code128",
          text: shipment.awb,
          scale: 3,
          height: 10,
        });

        doc.image(barcodeBuffer, { width: 180 });
        doc.end();

      } catch (error) {
        console.error(`Error generating label for ${shipment.awb}:`, error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=labels_${Date.now()}.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error("Bulk labels error:", error);
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