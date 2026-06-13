const NDR = require("../models/NDR");

// =================================
// CREATE NDR
// =================================
const createNDR = async (req, res) => {
  try {
    const ndr = await NDR.create({
      ...req.body,
      merchantId: req.user.id,
    });

    res.status(201).json({
      success: true,
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// GET ALL NDRS
// =================================
const getNDRs = async (req, res) => {
  try {
    const ndrs = await NDR.find({
      merchantId: req.user.id,
    }).populate("orderId");

    res.status(200).json({
      success: true,
      count: ndrs.length,
      ndrs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// RESOLVE NDR
// =================================
const resolveNDR = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    ndr.status = "RESOLVED";

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "NDR Resolved",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// REATTEMPT DELIVERY
// =================================
const reattemptNDR = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    ndr.status = "REATTEMPT";
    ndr.actionTaken = "REATTEMPT";

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "Delivery Reattempt Scheduled",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// MARK DELIVERED
// =================================
const markDelivered = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    ndr.status = "DELIVERED";

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "Shipment Delivered Successfully",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// CONVERT TO RTO
// =================================
const convertToRTO = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    ndr.status = "RTO";
    ndr.actionTaken = "RTO";

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "NDR Converted To RTO",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNDR,
  getNDRs,
  resolveNDR,
  reattemptNDR,
  markDelivered,
  convertToRTO,
};