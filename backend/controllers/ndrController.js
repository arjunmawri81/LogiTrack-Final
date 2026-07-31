const mongoose = require("mongoose");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const courierService = require("../services/courier/courierService");
const { chargeRTOFee } = require("./rtoController");

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
// MERCHANT: REQUEST REATTEMPT (DIRECT COURIER API CALL FOR ATTEMPTS <= 3)
// =================================
const reattemptNDR = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const saveOpts = isReplSet && session ? { session } : {};

    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    }, null, saveOpts);

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    const currentAttempts = ndr.deliveryAttempts || 0;
    const maxAttempts = ndr.maxAttempts || 3;

    // Check max attempts
    if (currentAttempts >= maxAttempts) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Maximum delivery attempts (${maxAttempts}) reached. Cannot request further reattempts.`,
      });
    }

    // BYPASS ADMIN APPROVAL FOR ATTEMPTS <= 3 — DIRECT COURIER API CALL
    const newAttemptNumber = currentAttempts + 1;
    ndr.deliveryAttempts = newAttemptNumber;
    ndr.status = "REATTEMPT";
    ndr.actionTaken = "REATTEMPT";
    ndr.adminNote = `AUTO_EXECUTED_COURIER_API_ATTEMPT_${newAttemptNumber}`;
    ndr.approvedAt = new Date();

    if (req.body.note) ndr.actionNote = req.body.note;
    if (req.body.address) ndr.address = req.body.address;
    if (req.body.customerPhone) ndr.customerPhone = req.body.customerPhone;
    if (req.body.pincode) ndr.pincode = req.body.pincode;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    ndr.nextAttemptDate = nextDate;
    ndr.lastAttemptDate = new Date();

    if (!ndr.attemptHistory) ndr.attemptHistory = [];
    ndr.attemptHistory.push({
      date: new Date().toISOString(),
      status: `REATTEMPT_ATTEMPT_${newAttemptNumber}_COURIER_API_EXECUTED`,
    });

    await ndr.save(saveOpts);

    // Sync Order details & status
    const order = await Order.findById(ndr.orderId, null, saveOpts);
    if (order) {
      if (ndr.address) order.customerAddress = ndr.address;
      if (ndr.customerPhone) order.customerPhone = ndr.customerPhone;
      if (ndr.pincode) order.customerPincode = ndr.pincode;
      if (!order.customerCity) order.customerCity = order.city || "N/A";
      if (!order.customerState) order.customerState = order.state || "N/A";
      order.status = "SHIPPED";
      await order.save(saveOpts);
    }

    // Sync Shipment & Add Tracking Event
    const shipment = await Shipment.findById(ndr.shipmentId, null, saveOpts);
    if (shipment) {
      if (!shipment.tracking) shipment.tracking = [];
      shipment.tracking.push({
        status: "IN_TRANSIT",
        location: "Out for Reattempt Hub",
        remarks: `Reattempt #${newAttemptNumber} submitted directly to Courier API (${shipment.courier || 'Partner'}). Remarks: ${ndr.actionNote || "Delivery details updated."}`,
        eventTime: new Date(),
      });
      shipment.status = "IN_TRANSIT";
      await shipment.save(saveOpts);
    }

    // DIRECT COURIER API CALL
    const courierApiResult = await courierService.requestReattemptApi({
      courierCode: shipment?.courier || ndr.courier || "DELHIVERY",
      awb: ndr.awb,
      address: ndr.address,
      customerPhone: ndr.customerPhone,
      pincode: ndr.pincode,
      actionNote: ndr.actionNote,
      attemptNumber: newAttemptNumber,
    });

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Reattempt #${newAttemptNumber} directly sent to Courier API successfully without requiring admin approval!`,
      ndr,
      courierApiResponse: courierApiResult,
    });
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); } catch (err) {}
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
// MERCHANT: REQUEST RTO (DIRECT COURIER API CALL)
// =================================
const convertToRTO = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const saveOpts = isReplSet && session ? { session } : {};

    const ndr = await NDR.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    }, null, saveOpts);

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR not found",
      });
    }

    // BYPASS ADMIN APPROVAL FOR RTO — DIRECT COURIER API CALL
    ndr.status = "RTO";
    ndr.actionTaken = "RTO";
    ndr.approvedAt = new Date();
    ndr.adminNote = "AUTO_APPROVED_RTO_DIRECT_COURIER_API";

    if (req.body.note) ndr.actionNote = req.body.note;
    await ndr.save(saveOpts);

    const order = await Order.findById(ndr.orderId, null, saveOpts);
    if (order) {
      order.status = "RTO";
      await order.save(saveOpts);
    }

    const shipment = await Shipment.findById(ndr.shipmentId, null, saveOpts);
    if (shipment) {
      if (!shipment.tracking) shipment.tracking = [];
      shipment.tracking.push({
        status: "RTO_INITIATED",
        location: "Sorting Hub",
        remarks: `RTO initiated directly via Courier API (${shipment.courier || 'Partner'}) without requiring admin approval.`,
        eventTime: new Date(),
      });
      shipment.rtoStatus = "INITIATED";
      shipment.status = "RTO";
      shipment.rtoDetails = {
        reason: ndr.reason || req.body.note || "Marked RTO from NDR",
        initiatedDate: new Date(),
      };
      await shipment.save(saveOpts);
    }

    // Create RTO record in database
    const rtoDocs = await RTO.create([{
      shipmentId: ndr.shipmentId,
      merchantId: ndr.merchantId,
      orderId: ndr.orderId,
      ndrId: ndr._id,
      awb: ndr.awb,
      courier: shipment?.courier || ndr.courier || "Courier",
      reason: ndr.reason || req.body.note || "Marked RTO from NDR",
      rtoReason: ndr.reason || req.body.note || "",
      customerName: ndr.customerName || order?.customerName || "",
      customerPhone: ndr.customerPhone || order?.customerPhone || "",
      address: ndr.address || order?.customerAddress || "",
      pincode: ndr.pincode || order?.customerPincode || "",
      city: order?.customerCity || "",
      state: order?.customerState || "",
      status: "INITIATED",
      rtoRequestedAt: ndr.createdAt,
      rtoApprovedAt: new Date(),
      source: "ndr_direct_courier_api_rto",
      createdBy: "merchant",
    }], session ? { session } : {});

    const createdRto = rtoDocs[0];
    await chargeRTOFee(createdRto, session);

    // DIRECT COURIER API CALL FOR RTO
    const courierApiResult = await courierService.requestRTOApi({
      courierCode: shipment?.courier || ndr.courier || "DELHIVERY",
      awb: ndr.awb,
      reason: ndr.reason || req.body.note,
    });

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "RTO initiated directly with Courier API successfully without requiring admin approval!",
      ndr,
      courierApiResponse: courierApiResult,
    });
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); } catch (err) {}
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