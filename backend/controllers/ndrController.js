const NDR = require("../models/NDR");

// =================================
// CREATE NDR
// =================================
const createNDR = async (req, res) => {
  try {
    // Validate required fields
    const { orderId, shipmentId, awb, reason } = req.body;
    
    if (!orderId || !shipmentId || !awb || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, shipmentId, awb, reason",
      });
    }

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
    })
      .populate("orderId", "orderNumber customerName customerPhone")
      .populate("shipmentId", "courier trackingNumber")
      .sort({ createdAt: -1 });

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
    ndr.actionTaken = "RESOLVED";

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "NDR Resolved Successfully",
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
// MERCHANT: REQUEST REATTEMPT
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

    // ✅ Check if NDR is in PENDING status
    if (ndr.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot request reattempt. Current status: ${ndr.status}`,
      });
    }

    // ✅ Update status to REATTEMPT_REQUESTED
    ndr.status = "REATTEMPT_REQUESTED";
    ndr.actionTaken = "REATTEMPT_REQUESTED";
    
    // ✅ Save merchant's note
    if (req.body.note) {
      ndr.actionNote = req.body.note;
    }

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "Reattempt requested successfully. Waiting for admin approval.",
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
// MERCHANT: REQUEST RTO
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

    // ✅ Check if NDR is in PENDING status
    if (ndr.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot request RTO. Current status: ${ndr.status}`,
      });
    }

    // ✅ Update status to RTO_REQUESTED
    ndr.status = "RTO_REQUESTED";
    ndr.actionTaken = "RTO_REQUESTED";
    
    // ✅ Save merchant's note
    if (req.body.note) {
      ndr.actionNote = req.body.note;
    }

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "RTO requested successfully. Waiting for admin approval.",
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
// ADMIN: APPROVE REATTEMPT
// =================================
const approveReattempt = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // ✅ Check if NDR is in REATTEMPT_REQUESTED status
    if (ndr.status !== "REATTEMPT_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in REATTEMPT_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // ✅ Update status to REATTEMPT
    ndr.status = "REATTEMPT";
    ndr.actionTaken = "REATTEMPT_APPROVED";
    
    // ✅ Save admin's note
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }

    // ✅ Increment attempt count
    ndr.deliveryAttempts += 1;
    
    // ✅ Set next attempt date (e.g., 2 days from now)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    ndr.nextAttemptDate = nextDate;

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "Reattempt approved successfully",
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
// ADMIN: REJECT REATTEMPT
// =================================
const rejectReattempt = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // ✅ Check if NDR is in REATTEMPT_REQUESTED status
    if (ndr.status !== "REATTEMPT_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in REATTEMPT_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // ✅ Revert back to PENDING
    ndr.status = "PENDING";
    ndr.actionTaken = "REATTEMPT_REJECTED";
    
    // ✅ Save admin's note
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "Reattempt request rejected",
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
// ADMIN: APPROVE RTO
// =================================
const approveRTO = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // ✅ Check if NDR is in RTO_REQUESTED status
    if (ndr.status !== "RTO_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in RTO_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // ✅ Update status to RTO
    ndr.status = "RTO";
    ndr.actionTaken = "RTO_APPROVED";
    
    // ✅ Save admin's note
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "RTO approved successfully",
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
// ADMIN: REJECT RTO
// =================================
const rejectRTO = async (req, res) => {
  try {
    const ndr = await NDR.findOne({
      _id: req.params.id,
    });

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // ✅ Check if NDR is in RTO_REQUESTED status
    if (ndr.status !== "RTO_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in RTO_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // ✅ Revert back to PENDING
    ndr.status = "PENDING";
    ndr.actionTaken = "RTO_REJECTED";
    
    // ✅ Save admin's note
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }

    await ndr.save();

    res.status(200).json({
      success: true,
      message: "RTO request rejected",
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
  convertToRTO,
  approveReattempt,
  rejectReattempt,
  approveRTO,
  rejectRTO,
};