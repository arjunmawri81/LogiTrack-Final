const Courier = require("../models/Courier");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const { ORDER_STATUS_MAP } = require("../constants/statusConstants");

// ==============================
// CREATE COURIER
// ==============================
const createCourier = async (req, res) => {
  try {
    const exists = await Courier.findOne({
      $or: [
        { name: req.body.name },
        { code: req.body.code },
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Courier already exists",
      });
    }

    const courier = await Courier.create(req.body);

    res.status(201).json({
      success: true,
      message: "Courier created successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET ALL COURIERS (SUPER ADMIN)
// ==============================
const getCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find().sort({
      priority: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: couriers.length,
      couriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET ACTIVE COURIERS (MERCHANT)
// ==============================
const getActiveCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({
      isActive: true,
    }).sort({
      priority: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: couriers.length,
      couriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET SINGLE COURIER
// ==============================
const getCourierById = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE COURIER
// ==============================
const updateCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Courier updated successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// ENABLE / DISABLE COURIER
// ==============================
const toggleCourierStatus = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    courier.isActive = !courier.isActive;

    await courier.save();

    res.status(200).json({
      success: true,
      message: `Courier ${
        courier.isActive ? "Activated" : "Disabled"
      } successfully`,
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE COURIER
// ==============================
const deleteCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndDelete(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Courier deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// COURIER WEBHOOK STATUS UPDATE
// ==============================
const handleWebhook = async (req, res) => {
  try {
    const { awb, status, trackingUrl, location, remarks } = req.body;

    if (!awb || !status || !trackingUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required webhook payload fields: awb, status, trackingUrl",
      });
    }

    const shipment = await Shipment.findOne({ awb });

    if (!shipment) {
      console.warn(`[Webhook] Shipment with AWB ${awb} not found`);
      return res.status(404).json({
        success: false,
        message: `Shipment with AWB ${awb} not found`,
      });
    }

    if (shipment.status === "DELIVERED" || shipment.status === "CANCELLED") {
      console.warn(`[Webhook] Terminal state shipment ${awb} cannot be updated via webhook`);
      return res.status(400).json({
        success: false,
        message: `Terminal state shipment (${shipment.status}) cannot be updated`,
      });
    }

    shipment.trackingUrl = trackingUrl;
    shipment.lastWebhookAt = new Date();

    await shipment.addTrackingEvent(
      status,
      location || "Courier Webhook",
      remarks || `Status updated via webhook: ${status}`
    );

    const order = await Order.findById(shipment.orderId);
    if (order) {
      const mappedStatus = ORDER_STATUS_MAP[status];
      if (mappedStatus) {
        order.status = mappedStatus;
        await order.save();
      }
    }

    console.log(`[Webhook] Successfully updated AWB ${awb} to status ${status}`);

    res.status(200).json({
      success: true,
      message: "Webhook processed and shipment updated successfully",
    });
  } catch (error) {
    console.error("[Webhook Error]", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourier,
  getCouriers,
  getActiveCouriers,
  getCourierById,
  updateCourier,
  toggleCourierStatus,
  deleteCourier,
  handleWebhook,
};