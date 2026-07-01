// ================================
// IMPORTS
// ================================
const RTO = require("../models/RTO");
const NDR = require("../models/NDR");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");

// ================================
// CREATE RTO (Merchant)
// ================================
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

// ================================
// GET ALL RTO (Merchant) - ✅ FIXED
// ================================
const getRTOs = async (req, res) => {
  try {
    const rtos = await RTO.find({
      merchantId: req.user.id,
    })
    .populate("shipmentId", "awb courier status trackingUrl")
    .populate("orderId", "orderNumber customerName customerPhone customerEmail")
    .populate("ndrId", "ndrReason status")
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
// UPDATE RTO STATUS (Merchant)
// ================================
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

    // Check if merchant owns this RTO
    if (rto.merchantId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this RTO",
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

    // Add to attempt history
    rto.attemptHistory = rto.attemptHistory || [];
    rto.attemptHistory.push({
      date: new Date(),
      status: status,
      remarks: remarks || "",
      updatedBy: req.user.id,
    });

    await rto.save();

    res.status(200).json({
      success: true,
      message: "RTO Status Updated Successfully",
      rto,
    });
  } catch (error) {
    console.error("Error in updateRTOStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// REQUEST RTO FROM NDR (Merchant)
// ================================
const requestRTOFromNDR = async (req, res) => {
  try {
    const { ndrId } = req.params;
    const { remarks, rtoReason, rtoSubReason } = req.body;

    // Find the NDR record
    const ndr = await NDR.findById(ndrId)
      .populate("shipmentId")
      .populate("orderId");

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR record not found",
      });
    }

    // Check if merchant owns this NDR
    if (ndr.merchantId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to request RTO for this NDR",
      });
    }

    // Check if RTO already requested
    if (ndr.status === "RTO_REQUESTED" || ndr.status === "RTO") {
      return res.status(400).json({
        success: false,
        message: `RTO already ${ndr.status === "RTO" ? "approved" : "requested"}`,
      });
    }

    // Update NDR status to RTO_REQUESTED
    ndr.status = "RTO_REQUESTED";
    ndr.rtoReason = rtoReason || ndr.ndrReason || "Customer requested return";
    ndr.rtoSubReason = rtoSubReason || ndr.ndrSubReason || "";
    ndr.remarks = remarks || ndr.remarks || "RTO requested by merchant";
    ndr.rtoRequestedAt = new Date();
    ndr.rtoRequestedBy = req.user.id;

    await ndr.save();

    // Create a pending RTO record
    const rtoData = {
      merchantId: req.user.id,
      shipmentId: ndr.shipmentId?._id || ndr.shipmentId,
      orderId: ndr.orderId?._id || ndr.orderId,
      ndrId: ndr._id,
      
      // Customer Info
      customerName: ndr.customerName || ndr.orderId?.customerName || "",
      customerPhone: ndr.customerPhone || ndr.orderId?.customerPhone || "",
      customerEmail: ndr.customerEmail || ndr.orderId?.customerEmail || "",
      address: ndr.address || ndr.orderId?.address || "",
      pincode: ndr.pincode || ndr.orderId?.pincode || "",
      city: ndr.city || ndr.orderId?.city || "",
      state: ndr.state || ndr.orderId?.state || "",
      
      // Shipment Info
      awb: ndr.awb || ndr.shipmentId?.awb || "",
      courier: ndr.courier || ndr.shipmentId?.courier || "",
      
      // RTO Specific
      rtoReason: rtoReason || ndr.ndrReason || "Customer requested return",
      rtoSubReason: rtoSubReason || ndr.ndrSubReason || "",
      reason: rtoReason || ndr.ndrReason || "Customer requested return",
      status: "INITIATED",
      
      // Timestamps
      rtoRequestedAt: new Date(),
      
      // Remarks
      remarks: remarks || "RTO requested by merchant from NDR",
      
      // Metadata
      createdBy: "merchant",
      source: "ndr_rto_request"
    };

    const rto = await RTO.create(rtoData);

    res.status(201).json({
      success: true,
      message: "RTO requested successfully. Waiting for admin approval.",
      data: {
        ndr: {
          id: ndr._id,
          status: ndr.status,
        },
        rto: {
          id: rto._id,
          status: rto.status,
          rtoReason: rto.rtoReason,
        },
      },
    });
  } catch (error) {
    console.error("Error in requestRTOFromNDR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const rto = await RTO.findById(id);

    if (!rto) {
      return res.status(404).json({
        success: false,
        message: "RTO not found",
      });
    }

    // Check if merchant owns this RTO
    if (rto.merchantId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this RTO",
      });
    }

    // Only allow cancellation if status is INITIATED or PICKUP_SCHEDULED
    if (!["INITIATED", "PICKUP_SCHEDULED"].includes(rto.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel RTO in ${rto.status} status`,
      });
    }

    rto.status = "CANCELLED";
    rto.remarks = remarks || "RTO cancelled by merchant";
    
    // Add to attempt history
    rto.attemptHistory = rto.attemptHistory || [];
    rto.attemptHistory.push({
      date: new Date(),
      status: "CANCELLED",
      remarks: remarks || "RTO cancelled by merchant",
      updatedBy: req.user.id,
    });

    await rto.save();

    // Update NDR if exists
    if (rto.ndrId) {
      const ndr = await NDR.findById(rto.ndrId);
      if (ndr && ndr.status === "RTO_REQUESTED") {
        ndr.status = "PENDING";
        ndr.remarks = (ndr.remarks || "") + " | RTO cancelled by merchant";
        await ndr.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "RTO cancelled successfully",
      rto,
    });
  } catch (error) {
    console.error("Error in cancelRTO:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// EXPORT ALL FUNCTIONS
// ================================
module.exports = {
  createRTO,
  getRTOs,           // ✅ FIXED - Now properly populates all fields
  getRTOById,
  updateRTOStatus,
  requestRTOFromNDR,
  getRTOStats,
  cancelRTO,
};