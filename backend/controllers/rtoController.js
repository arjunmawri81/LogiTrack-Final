const mongoose = require("mongoose");
const RTO = require("../models/RTO");
const NDR = require("../models/NDR");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");

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

// Helper to auto-charge RTO Return Fee from merchant wallet
const chargeRTOFee = async (rto, session) => {
  if (!rto || rto.rtoFeeCharged) return; // Charge only once per RTO

  let rateCard = null;
  if (rto.merchantId) {
    rateCard = await RateCard.findOne({
      merchantId: rto.merchantId,
      isActive: true,
    }).session(session);
  }

  if (!rateCard) {
    rateCard = await RateCard.findOne({
      merchantId: null,
      isActive: true,
    }).session(session);
  }

  const rtoFee = rateCard?.rtoCharge && rateCard.rtoCharge > 0 ? rateCard.rtoCharge : 60; // Default ₹60 RTO charge

  let wallet = await Wallet.findOne({ merchantId: rto.merchantId }).session(session);
  if (!wallet) {
    const [newWallet] = await Wallet.create([{ merchantId: rto.merchantId, balance: 0 }], { session });
    wallet = newWallet;
  }

  const awbNumber = rto.awb || "RTO";
  const isSufficient = wallet.balance >= rtoFee;

  // Deduct wallet balance (allowing negative balance / tracking pending status)
  wallet.balance = Math.round((wallet.balance - rtoFee) * 100) / 100;
  
  const desc = isSufficient 
    ? `RTO Return Fee Charged: ₹${rtoFee} - AWB: ${awbNumber}`
    : `RTO Return Fee Charged (Pending Overdraft): ₹${rtoFee} - AWB: ${awbNumber}`;

  wallet.transactions.push({
    amount: rtoFee,
    type: "DEBIT",
    description: desc,
    createdAt: new Date(),
  });

  await wallet.save({ session });

  rto.rtoFee = rtoFee;
  rto.rtoFeeCharged = true;
  rto.rtoChargeStatus = isSufficient ? "PAID" : "PENDING";
  await rto.save({ session });

  const shipment = await Shipment.findById(rto.shipmentId).session(session);
  if (shipment) {
    shipment.rtoChargeStatus = isSufficient ? "PAID" : "PENDING";
    if (!isSufficient) {
      shipment.rtoChargePending = rtoFee;
      shipment.internalRemarks = "RTO_CHARGE_PENDING";
    }
    await shipment.save({ session });
  }
};

// ================================
// CREATE RTO (Merchant)
// ================================
const createRTO = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const {
      shipmentId, orderId, ndrId, reason, rtoReason, remarks, awb, courier,
      customerName, customerPhone, address, pincode, city, state
    } = req.body;

    // Validate ownership
    if (ndrId) {
      const ndr = await NDR.findById(ndrId).session(session);
      if (!ndr || ndr.merchantId.toString() !== req.user.id) {
        if (session) await session.abortTransaction();
        return res.status(403).json({
          success: false,
          message: "Unauthorized or invalid NDR associated with this RTO request",
        });
      }
    }

    const shipment = await Shipment.findById(shipmentId).session(session);
    if (!shipment || shipment.merchantId.toString() !== req.user.id) {
      if (session) await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Unauthorized or invalid shipment associated with this RTO request",
      });
    }

    const rto = await RTO.create([{
      shipmentId, orderId, ndrId, reason, rtoReason, remarks, awb, courier,
      customerName, customerPhone, address, pincode, city, state,
      merchantId: req.user.id,
      status: "INITIATED"
    }], session ? { session } : {});

    const createdRto = rto[0];

    // Sync Shipment
    await shipment.updateRTO("INITIATED", { reason });

    // Sync Order
    const order = await Order.findById(orderId).session(session);
    if (order) {
      order.status = "RTO";
      await order.save({ session });
    }

    // Auto Charge RTO Return Fee from Merchant Wallet
    await chargeRTOFee(createdRto, session);

    if (session) await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "RTO Created Successfully",
      rto: createdRto,
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

// ================================
// GET ALL RTO (Admin & Merchant)
// ================================
const getRTOs = async (req, res) => {
  try {
    let query = {};

    // Merchant → sirf apne RTO
    if (req.user.role === "MERCHANT") {
      query.merchantId = req.user.id;
    }

    // Admin & Super Admin → sab RTO
    const rtos = await RTO.find(query)
      .populate("merchantId", "name companyName email")
      .populate("shipmentId")
      .populate("orderId")
      .populate("ndrId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rtos.length,
      rtos,
    });
  } catch (error) {
    console.error("Error in getRTOs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET RTO BY ID (Merchant)
// ================================
const getRTOById = async (req, res) => {
  try {
    const rto = await RTO.findById(req.params.id)
      .populate("shipmentId", "awb courier status trackingUrl")
      .populate("orderId", "orderNumber customerName customerPhone customerEmail items totalAmount")
      .populate("merchantId", "name companyName email phone")
      .populate("ndrId", "ndrReason ndrSubReason status")
      .populate("rtoApprovedBy", "name email");

    if (!rto) {
      return res.status(404).json({
        success: false,
        message: "RTO not found",
      });
    }

    if (req.user.role === "MERCHANT" && rto.merchantId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      rto,
    });
  } catch (error) {
    console.error("Error in getRTOById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// UPDATE RTO STATUS (Merchant / Admin)
// ================================
const updateRTOStatus = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const { status, remarks } = req.body;

    const allowedStatuses = [
      "INITIATED",
      "PICKUP_SCHEDULED",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_RETURN",
      "RECEIVED_AT_WAREHOUSE",
      "COMPLETED",
      "CANCELLED",
    ];

    if (status && !allowedStatuses.includes(status)) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid RTO status: ${status}. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "RTO not found",
      });
    }

    // Check if merchant owns this RTO (if merchant is calling)
    if (req.user.role === "MERCHANT") {
      if (rto.merchantId.toString() !== req.user.id) {
        if (session) await session.abortTransaction();
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this RTO",
        });
      }
      if (status !== "CANCELLED") {
        if (session) await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Merchants can only cancel an RTO request",
        });
      }
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

    // Add to attempt history
    rto.attemptHistory = rto.attemptHistory || [];
    rto.attemptHistory.push({
      date: new Date(),
      status: status,
      remarks: remarks || "",
      updatedBy: req.user.id,
    });

    await rto.save({ session });

    // Sync Shipment & Order Statuses
    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      if (status === "IN_TRANSIT") {
        await shipment.updateRTO("IN_TRANSIT");
      } else if (status === "RECEIVED_AT_WAREHOUSE" || status === "COMPLETED") {
        await shipment.updateRTO("COMPLETED");
      } else if (status === "CANCELLED") {
        shipment.rtoStatus = "NONE";
        await shipment.addTrackingEvent(shipment.statusBeforeRTO || "IN_TRANSIT", "Sorting Hub", "RTO cancelled");
        shipment.statusBeforeRTO = null;
        await shipment.save({ session });
      }
    }

    const order = await Order.findById(rto.orderId).session(session);
    if (order) {
      if (status === "CANCELLED") {
        order.status = "SHIPPED"; // Revert from RTO to SHIPPED
      } else {
        order.status = "RTO";
      }
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "RTO Status Updated Successfully",
      rto,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    console.error("Error in updateRTOStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// ================================
// REQUEST RTO FROM NDR (Merchant)
// ================================
const requestRTOFromNDR = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const { ndrId } = req.params;
    const { remarks, rtoReason } = req.body;

    // Find the NDR record
    const ndr = await NDR.findById(ndrId).session(session)
      .populate("shipmentId")
      .populate("orderId");

    if (!ndr) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "NDR record not found",
      });
    }

    // Check if merchant owns this NDR
    if (ndr.merchantId.toString() !== req.user.id) {
      if (session) await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Unauthorized to request RTO for this NDR",
      });
    }

    // Check if RTO already requested
    if (ndr.status === "RTO_REQUESTED" || ndr.status === "RTO") {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `RTO already ${ndr.status === "RTO" ? "approved" : "requested"}`,
      });
    }

    // Update NDR status to RTO_REQUESTED
    ndr.status = "RTO_REQUESTED";
    ndr.actionTaken = "RTO_REQUESTED";
    ndr.actionNote = rtoReason || remarks || "Customer requested return";
    ndr.remarks = remarks || ndr.remarks || "RTO requested by merchant";

    await ndr.save({ session });

    // Create a pending RTO record
    const rtoData = {
      merchantId: req.user.id,
      shipmentId: ndr.shipmentId?._id || ndr.shipmentId,
      orderId: ndr.orderId?._id || ndr.orderId,
      ndrId: ndr._id,
      
      // Customer Info
      customerName: ndr.customerName || ndr.orderId?.customerName || "",
      customerPhone: ndr.customerPhone || ndr.orderId?.customerPhone || "",
      address: ndr.address || ndr.orderId?.customerAddress || ndr.orderId?.address || "",
      pincode: ndr.pincode || ndr.orderId?.pincode || "",
      city: ndr.city || ndr.orderId?.customerCity || ndr.orderId?.city || "",
      state: ndr.state || ndr.orderId?.customerState || ndr.orderId?.state || "",
      
      // Shipment Info
      awb: ndr.awb || ndr.shipmentId?.awb || "",
      courier: ndr.courier || ndr.shipmentId?.courier || "",
      
      // RTO Specific
      rtoReason: rtoReason || ndr.reason || "Customer requested return",
      reason: rtoReason || ndr.reason || "Customer requested return",
      status: "INITIATED",
      
      // Timestamps
      rtoRequestedAt: new Date(),
      
      // Remarks
      remarks: remarks || "RTO requested by merchant from NDR",
      
      // Metadata
      createdBy: "merchant",
      source: "ndr_rto_approval"
    };

    const rto = await RTO.create([rtoData], session ? { session } : {});
    const createdRto = rto[0];

    // Sync Shipment & Order statuses
    const shipment = await Shipment.findById(rtoData.shipmentId).session(session);
    if (shipment) {
      await shipment.updateRTO("INITIATED", { reason: rtoData.rtoReason });
    }

    const order = await Order.findById(rtoData.orderId).session(session);
    if (order) {
      order.status = "RTO";
      await order.save({ session });
    }

    // Auto Charge RTO Return Fee from Merchant Wallet
    await chargeRTOFee(createdRto, session);

    if (session) await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "RTO requested successfully. Waiting for admin approval.",
      data: {
        ndr: {
          id: ndr._id,
          status: ndr.status,
        },
        rto: {
          id: createdRto._id,
          status: createdRto.status,
          rtoReason: createdRto.rtoReason,
        },
      },
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    console.error("Error in requestRTOFromNDR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// ================================
// GET RTO STATS (Merchant)
// ================================
const getRTOStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const [total, initiated, pickupScheduled, pickedUp, inTransit, received, completed, cancelled] = await Promise.all([
      RTO.countDocuments({ merchantId }),
      RTO.countDocuments({ merchantId, status: "INITIATED" }),
      RTO.countDocuments({ merchantId, status: "PICKUP_SCHEDULED" }),
      RTO.countDocuments({ merchantId, status: "PICKED_UP" }),
      RTO.countDocuments({ merchantId, status: "IN_TRANSIT" }),
      RTO.countDocuments({ merchantId, status: "RECEIVED_AT_WAREHOUSE" }),
      RTO.countDocuments({ merchantId, status: "COMPLETED" }),
      RTO.countDocuments({ merchantId, status: "CANCELLED" }),
    ]);

    const pending = initiated + pickupScheduled;

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        initiated,
        pickupScheduled,
        pickedUp,
        inTransit,
        received,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    console.error("Error in getRTOStats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// CANCEL RTO (Merchant)
// ================================
const cancelRTO = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const { id } = req.params;
    const { remarks } = req.body;

    const rto = await RTO.findById(id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "RTO not found",
      });
    }

    // Check if merchant owns this RTO
    if (rto.merchantId.toString() !== req.user.id) {
      if (session) await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this RTO",
      });
    }

    // Only allow cancellation if status is INITIATED or PICKUP_SCHEDULED
    if (!["INITIATED", "PICKUP_SCHEDULED"].includes(rto.status)) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel RTO in ${rto.status} status`,
      });
    }

    rto.status = "CANCELLED";
    rto.remarks = remarks || "RTO cancelled by merchant";
    
    rto.attemptHistory = rto.attemptHistory || [];
    rto.attemptHistory.push({
      date: new Date(),
      status: "CANCELLED",
      remarks: remarks || "RTO cancelled by merchant",
      updatedBy: req.user.id,
    });

    await rto.save({ session });

    // Update NDR if exists
    if (rto.ndrId) {
      const ndr = await NDR.findById(rto.ndrId).session(session);
      if (ndr && ndr.status === "RTO_REQUESTED") {
        ndr.status = "PENDING";
        ndr.remarks = (ndr.remarks || "") + " | RTO cancelled by merchant";
        await ndr.save({ session });
      }
    }

    // Revert Shipment & Order status
    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      shipment.rtoStatus = "NONE";
      const originalStatus = shipment.statusBeforeRTO || "IN_TRANSIT";
      shipment.statusBeforeRTO = null;
      await shipment.addTrackingEvent(originalStatus, "Sorting Hub", "RTO request cancelled by merchant");
    }

    const order = await Order.findById(rto.orderId).session(session);
    if (order) {
      order.status = "SHIPPED"; // Revert to SHIPPED
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "RTO cancelled successfully",
      rto,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (err) {}
    }
    console.error("Error in cancelRTO:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// ================================
// ADMIN RTO STATUS UPDATES
// ================================

// 1. Schedule Pickup
const schedulePickup = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "RTO not found" 
      });
    }

    rto.status = "PICKUP_SCHEDULED";
    await rto.save({ session });

    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      await shipment.addTrackingEvent("RTO_INITIATED", "Origin Hub", "RTO Pickup Scheduled");
    }

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Pickup Scheduled",
      rto,
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// 2. Picked Up
const markPickedUp = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "RTO not found" 
      });
    }

    rto.status = "PICKED_UP";
    await rto.save({ session });

    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      await shipment.updateRTO("IN_TRANSIT", { reason: "RTO Package Picked Up" });
    }

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Marked as Picked Up",
      rto,
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// 3. Move to Transit
const moveTransit = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "RTO not found" 
      });
    }

    rto.status = "IN_TRANSIT";
    await rto.save({ session });

    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      await shipment.updateRTO("IN_TRANSIT");
    }

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Moved to In Transit",
      rto,
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// 4. Warehouse Received
const warehouseReceived = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "RTO not found" 
      });
    }

    rto.status = "RECEIVED_AT_WAREHOUSE";
    rto.receivedDate = new Date();
    await rto.save({ session });

    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      await shipment.updateRTO("COMPLETED");
    }

    const order = await Order.findById(rto.orderId).session(session);
    if (order) {
      order.status = "RTO";
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Received at Warehouse",
      rto,
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// 5. Complete RTO
const completeRTO = async (req, res) => {
  let session = null;
  try {
    const isReplSet = await checkReplicaSet();
    if (isReplSet) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const rto = await RTO.findById(req.params.id).session(session);

    if (!rto) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "RTO not found" 
      });
    }

    rto.status = "COMPLETED";
    rto.completedDate = new Date();
    await rto.save({ session });

    const shipment = await Shipment.findById(rto.shipmentId).session(session);
    if (shipment) {
      await shipment.updateRTO("COMPLETED");
    }

    const order = await Order.findById(rto.orderId).session(session);
    if (order) {
      order.status = "RTO";
      await order.save({ session });
    }

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "RTO Completed",
      rto,
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};

// ================================
// EXPORT ALL FUNCTIONS
// ================================
module.exports = {
  createRTO,
  getRTOs,
  getRTOById,
  updateRTOStatus,
  requestRTOFromNDR,
  getRTOStats,
  cancelRTO,

  // Admin RTO Status Update Functions
  schedulePickup,
  markPickedUp,
  moveTransit,
  warehouseReceived,
  completeRTO,
};