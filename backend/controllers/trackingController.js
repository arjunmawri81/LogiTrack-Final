const Shipment = require("../models/Shipment");

// Get Shipment Tracking
const getTracking = async (req, res) => {
  try {
    const shipment = await Shipment.findById(
      req.params.id
    );

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
const updateShipmentStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const shipment =
      await Shipment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment Not Found",
      });
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