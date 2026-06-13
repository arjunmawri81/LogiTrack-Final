const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");

// ===============================
// GENERATE UNIQUE AWB
// ===============================
const generateAWB = async () => {
  let awb;
  let exists = true;

  while (exists) {
    awb =
      "AWB" +
      Date.now() +
      Math.floor(1000 + Math.random() * 9000);

    const found = await Shipment.findOne({ awb });

    if (!found) {
      exists = false;
    }
  }

  return awb;
};

// ===============================
// CREATE SHIPMENT
// ===============================
const createShipment = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);

    const { orderId, courier } = req.body;

    if (!orderId || !courier) {
      return res.status(400).json({
        success: false,
        message: "OrderId and Courier are required",
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

    const awb = await generateAWB();

    const shipment = await Shipment.create({
      orderId,
      merchantId: req.user.id,
      courier,
      awb,
      status: "PENDING",
      trackingEvents: [
        {
          status: "PENDING",
          location: "Warehouse",
          remark: "Shipment Created",
        },
      ],
    });

    const invoice = await Invoice.create({
      invoiceNumber:
        "INV" +
        Date.now() +
        Math.floor(Math.random() * 1000),

      merchantId: req.user.id,
      orderId: order._id,
      shipmentId: shipment._id,
      amount: order.amount || 0,
      taxAmount: 18,
      shippingCharge: 50,
      paymentMethod: order.paymentMode || "COD",
      status: "PAID",
    });

    console.log("INVOICE CREATED =>", invoice);

    return res.status(201).json({
      success: true,
      message: "Shipment Created Successfully",
      shipment,
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
// GET ALL SHIPMENTS
// ===============================
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      merchantId: req.user.id,
    })
      .populate("orderId")
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
// TRACK SINGLE SHIPMENT
// ===============================
const trackShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findOne({
      awb: id,
      merchantId: req.user.id,
    }).populate("orderId");

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

    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    shipment.status = status;

    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.status = status;
      await order.save();
    }

    shipment.trackingEvents.push({
      status,
      location: "System Update",
      remark: `Shipment status changed to ${status}`,
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

    shipment.pickupDate = new Date();
    shipment.status = "READY_FOR_PICKUP";

    shipment.trackingEvents.push({
      status: "READY_FOR_PICKUP",
      location: "Warehouse",
      remark: "Pickup Scheduled",
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

module.exports = {
  createShipment,
  getShipments,
  trackShipment,
  updateShipmentStatus,
  schedulePickup,
  generateShipmentQR,
  getTrackingTimeline,
  generateLabel,
};