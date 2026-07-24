const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const { SHIPMENT_STATUSES, ORDER_STATUS_MAP } = require("../constants/statusConstants");

// Get Shipment Tracking
const getTracking = async (req, res) => {
  try {
    // Build query: admins can see any shipment, merchants only their own
    const query = { awb: req.params.id };
    if (req.user.role === "MERCHANT") {
      query.merchantId = req.user.id;
    }

    const shipment = await Shipment.findOne(query)
      .populate("orderId")
      .populate("merchantId", "companyName name email");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Shipment Status
const updateShipmentStatus = async (req, res) => {
  try {
    const { status, location, remarks } = req.body;

    // Validate status against the enum
    if (!status || !SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${SHIPMENT_STATUSES.join(", ")}`,
      });
    }

    const query = { _id: req.params.id };
    if (req.user.role === "MERCHANT") {
      query.merchantId = req.user.id;
    }

    const shipment = await Shipment.findOne(query);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment Not Found",
      });
    }

    // Prevent modification of terminal-state shipments
    if (shipment.status === "DELIVERED" || shipment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: `${shipment.status} shipment cannot be modified`,
      });
    }

    // Use the model's addTrackingEvent method (pushes to `tracking`, sets status, calls save)
    await shipment.addTrackingEvent(
      status,
      location || "System Update",
      remarks || `Shipment status changed to ${status}`
    );

    // Sync Order status
    const order = await Order.findById(shipment.orderId);
    if (order) {
      const mappedStatus = ORDER_STATUS_MAP[status];
      if (mappedStatus) {
        order.status = mappedStatus;
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Shipment Status Updated",
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTracking,
  updateShipmentStatus,
};