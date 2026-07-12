const NDR = require("../models/NDR");
const RTO = require("../models/RTO");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");

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

    // ✅ Save new address, phone, and pincode if corrected
    if (req.body.address) ndr.address = req.body.address;
    if (req.body.customerPhone) ndr.customerPhone = req.body.customerPhone;
    if (req.body.pincode) ndr.pincode = req.body.pincode;

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

    // ✅ Sync details to Order, update Order and Shipment status, and update timeline
    const order = await Order.findById(ndr.orderId);
    if (order) {
      if (ndr.address) order.customerAddress = ndr.address;
      if (ndr.customerPhone) order.customerPhone = ndr.customerPhone;
      if (ndr.pincode) order.customerPincode = ndr.pincode;
      order.status = "SHIPPED"; // Map to business status
      await order.save();
    }

    const shipment = await Shipment.findById(ndr.shipmentId);
    if (shipment) {
      shipment.status = "IN_TRANSIT";
      shipment.tracking.push({
        status: "IN_TRANSIT",
        location: "Sorting Hub",
        remarks: `Reattempt approved by admin. Remarks: ${ndr.adminNote || ndr.actionNote || "Delivery details updated."}`,
        eventTime: new Date(),
      });
      await shipment.save();
    }

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

    // ✅ Update Order and Shipment statuses, and push tracking timeline
    const order = await Order.findById(ndr.orderId);
    if (order) {
      order.status = "RTO";
      await order.save();
    }

    const shipment = await Shipment.findById(ndr.shipmentId);
    if (shipment) {
      shipment.status = "RTO";
      shipment.tracking.push({
        status: "RTO",
        location: "Sorting Hub",
        remarks: `RTO approved by admin. Package is returning to origin. Remarks: ${ndr.adminNote || ndr.actionNote || ""}`,
        eventTime: new Date(),
      });
      await shipment.save();
    }

    // ✅ Create RTO record in RTO collection
    await RTO.create({
      shipmentId: ndr.shipmentId,
      merchantId: ndr.merchantId,
      orderId: ndr.orderId,
      ndrId: ndr._id,
      awb: ndr.awb,
      courier: (shipment && shipment.courier) || ndr.courier || "Courier",
      reason: ndr.reason || "Marked RTO from NDR",
      rtoReason: ndr.reason || "",
      customerName: ndr.customerName || (order && order.customerName) || "",
      customerPhone: ndr.customerPhone || (order && order.customerPhone) || "",
      address: ndr.address || (order && order.customerAddress) || "",
      pincode: ndr.pincode || (order && order.customerPincode) || "",
      city: (order && order.customerCity) || "",
      state: (order && order.customerState) || "",
      status: "INITIATED",
      rtoRequestedAt: ndr.createdAt,
      rtoApprovedAt: new Date(),
      rtoApprovedBy: req.user?.id || null,
      source: "ndr_rto_approval",
      createdBy: "merchant",
    });

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