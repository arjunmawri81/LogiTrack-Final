const mongoose = require("mongoose");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");

// Helper to check replica set for Mongoose transactions
const checkReplicaSet = async () => {
  try {
    if (!mongoose.connection || !mongoose.connection.db) return false;
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    return !!hello.setName;
  } catch (err) {
    return false;
  }
};

// =================================
// CREATE NDR
// =================================
const createNDR = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const {
      orderId, shipmentId, awb, reason, remarks, actionNote,
      customerName, customerPhone, address, pincode, expectedDeliveryDate
    } = req.body;
    
    if (!orderId || !shipmentId || !awb || !reason) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, shipmentId, awb, reason",
      });
    }

    // Force default status "PENDING"
    const ndr = await NDR.create([{
      orderId,
      shipmentId,
      awb,
      reason,
      status: "PENDING",
      remarks,
      actionNote,
      customerName,
      customerPhone,
      address,
      pincode,
      expectedDeliveryDate,
      merchantId: req.user.id,
    }], session ? { session } : {});

    const createdNdr = ndr[0];

    // Update Shipment Status and Timeline via Mongoose updateNDR method
    const shipment = await Shipment.findOne({ _id: shipmentId, merchantId: req.user.id }).session(session);
    if (!shipment) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Associated shipment not found",
      });
    }
    await shipment.updateNDR("PENDING", { reason });

    // Update Order Status
    const order = await Order.findById(orderId).session(session);
    if (order) {
      order.status = "NDR";
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.status(201).json({
      success: true,
      ndr: createdNdr,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
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
      .populate("shipmentId", "courier awb status")
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
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    }).session(session);

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    ndr.status = "RESOLVED";
    ndr.actionTaken = "RESOLVED";
    await ndr.save({ session });

    // Update Shipment
    const shipment = await Shipment.findById(ndr.shipmentId).session(session);
    if (shipment) {
      await shipment.updateNDR("RESOLVED");
    }

    // Update Order status based on Shipment mapping
    const order = await Order.findById(ndr.orderId).session(session);
    if (order && shipment) {
      order.status = "SHIPPED"; // Map to business status
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "NDR Resolved Successfully",
      ndr,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
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

    // Check if NDR is in PENDING status
    if (ndr.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot request reattempt. Current status: ${ndr.status}`,
      });
    }

    // Check max attempts
    if (ndr.deliveryAttempts >= (ndr.maxAttempts || 3)) {
      return res.status(400).json({
        success: false,
        message: `Maximum delivery attempts (${ndr.maxAttempts || 3}) reached. Cannot request further reattempts.`,
      });
    }

    // Update status to REATTEMPT_REQUESTED
    ndr.status = "REATTEMPT_REQUESTED";
    ndr.actionTaken = "REATTEMPT_REQUESTED";
    
    // Save merchant's note
    if (req.body.note) {
      ndr.actionNote = req.body.note;
    }

    // Save new address, phone, and pincode
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

    // Check if NDR is in PENDING status
    if (ndr.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot request RTO. Current status: ${ndr.status}`,
      });
    }

    // Update status to RTO_REQUESTED
    ndr.status = "RTO_REQUESTED";
    ndr.actionTaken = "RTO_REQUESTED";
    
    // Save merchant's note
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
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const ndr = await NDR.findOne({
      _id: req.params.id,
    }).session(session);

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // Check if NDR is in REATTEMPT_REQUESTED status
    if (ndr.status !== "REATTEMPT_REQUESTED") {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `NDR is not in REATTEMPT_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    ndr.deliveryAttempts += 1;

    // Auto-convert to RTO if max attempts reached
    if (ndr.deliveryAttempts >= (ndr.maxAttempts || 3)) {
      ndr.status = "RTO_REQUESTED";
      ndr.actionTaken = "AUTO_RTO_MAX_ATTEMPTS";
      ndr.adminNote = "Max reattempts reached — auto-converted to RTO";
      await ndr.save({ session });

      const shipmentForRTO = await Shipment.findById(ndr.shipmentId).session(session);
      await RTO.create([{
        shipmentId: ndr.shipmentId,
        merchantId: ndr.merchantId,
        orderId: ndr.orderId,
        ndrId: ndr._id,
        awb: ndr.awb,
        courier: shipmentForRTO?.courier || ndr.courier || "Courier",
        reason: "Max delivery attempts exceeded",
        rtoReason: "Max delivery attempts exceeded",
        status: "INITIATED",
        source: "auto_max_attempts",
      }], session ? { session } : {});

      if (shipmentForRTO) {
        shipmentForRTO.rtoStatus = "INITIATED";
        await shipmentForRTO.save({ session });
      }

      if (session) await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: "Max reattempts reached. Shipment auto-converted to RTO.",
        ndr,
      });
    }

    ndr.status = "REATTEMPT";
    ndr.actionTaken = "REATTEMPT";
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    ndr.nextAttemptDate = nextDate;

    await ndr.save({ session });

    const order = await Order.findById(ndr.orderId).session(session);
    if (order) {
      if (ndr.address) order.customerAddress = ndr.address;
      if (ndr.customerPhone) order.customerPhone = ndr.customerPhone;
      if (ndr.pincode) order.customerPincode = ndr.pincode;
      order.status = "SHIPPED";
      await order.save({ session });
    }

    const shipment = await Shipment.findById(ndr.shipmentId).session(session);
    if (shipment) {
      await shipment.addTrackingEvent(
        "IN_TRANSIT",
        "Sorting Hub",
        `Reattempt approved by admin. Remarks: ${ndr.adminNote || ndr.actionNote || "Delivery details updated."}`
      );
    }

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Reattempt approved successfully",
      ndr,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
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

    // Check if NDR is in REATTEMPT_REQUESTED status
    if (ndr.status !== "REATTEMPT_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in REATTEMPT_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // Revert back to PENDING
    ndr.status = "PENDING";
    ndr.actionTaken = "NONE";
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
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const ndr = await NDR.findOne({
      _id: req.params.id,
    }).session(session);

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // Check if NDR is in RTO_REQUESTED status
    if (ndr.status !== "RTO_REQUESTED") {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `NDR is not in RTO_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    ndr.status = "RTO";
    ndr.actionTaken = "RTO";
    if (req.body.adminNote) {
      ndr.adminNote = req.body.adminNote;
    }
    await ndr.save({ session });

    const order = await Order.findById(ndr.orderId).session(session);
    if (order) {
      order.status = "RTO";
      await order.save({ session });
    }

    const shipment = await Shipment.findById(ndr.shipmentId).session(session);
    if (shipment) {
      await shipment.addTrackingEvent(
        "RTO_INITIATED",
        "Sorting Hub",
        `RTO approved by admin. Package is returning to origin. Remarks: ${ndr.adminNote || ndr.actionNote || ""}`
      );
      shipment.rtoStatus = "INITIATED";
      shipment.rtoDetails = {
        reason: ndr.reason || "Marked RTO from NDR",
        initiatedDate: new Date()
      };
      await shipment.save({ session });
    }

    // Create RTO record in RTO collection
    await RTO.create([{
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
    }], { session });

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "RTO approved successfully",
      ndr,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
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

    // Check if NDR is in RTO_REQUESTED status
    if (ndr.status !== "RTO_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `NDR is not in RTO_REQUESTED status. Current: ${ndr.status}`,
      });
    }

    // Revert back to PENDING
    ndr.status = "PENDING";
    ndr.actionTaken = "NONE";
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