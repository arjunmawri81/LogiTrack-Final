const Shipment = require("../models/Shipment");

// Get Shipment Tracking
const getTracking = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      awb: req.params.id,
      merchantId: req.user.id,
    }).populate("orderId");

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
    const { status } = req.body;

    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment Not Found",
      });
    }

    shipment.status = status;

    shipment.trackingEvents.push({
      status,
      location: "System Update",
      remark: `Shipment status changed to ${status}`,
      timestamp: new Date(),
    });

    await shipment.save();

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