const RTO = require("../models/RTO");

// Create RTO
const createRTO = async (req, res) => {
  try {
    const rto = await RTO.create({
      ...req.body,
      merchantId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "RTO Created Successfully",
      rto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All RTO
const getRTOs = async (req, res) => {
  try {
    const rtos = await RTO.find({
      merchantId: req.user.id,
    }).populate("shipmentId");

    res.status(200).json({
      success: true,
      count: rtos.length,
      rtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update RTO Status
const updateRTOStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const rto = await RTO.findById(req.params.id);

    if (!rto) {
      return res.status(404).json({
        success: false,
        message: "RTO not found",
      });
    }

    rto.status = status;

    if (remarks) {
      rto.remarks = remarks;
    }

    if (status === "RECEIVED_AT_WAREHOUSE") {
      rto.receivedDate = new Date();
    }

    if (status === "COMPLETED") {
      rto.completedDate = new Date();
    }

    await rto.save();

    res.status(200).json({
      success: true,
      message: "RTO Status Updated Successfully",
      rto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRTO,
  getRTOs,
  updateRTOStatus,
};