const mongoose = require("mongoose");

const ndrSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    awb: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },


    status: {
      type: String,
      enum: [
        "PENDING",
        "REATTEMPT_REQUESTED",  // Merchant requested reattempt
        "REATTEMPT",            // Admin approved reattempt
        "RTO_REQUESTED",        // Merchant requested RTO
        "RTO",                  // Admin approved RTO
        "DELIVERED",
        "RESOLVED",
        "FAILED",
      ],
      default: "PENDING",
    },

    remarks: {
      type: String,
      default: "",
    },

    // Action taken
    actionTaken: {
      type: String,
      enum: [
        "NONE",
        "CALL_CUSTOMER",
        "ADDRESS_UPDATED",
        "REATTEMPT_REQUESTED",
        "REATTEMPT",
        "RTO_REQUESTED",
        "RTO",
        "RESOLVED",
      ],
      default: "NONE",
    },

    // Store merchant's note when requesting action
    actionNote: {
      type: String,
      default: "",
    },

    // Store admin's note when approving/rejecting
    adminNote: {
      type: String,
      default: "",
    },

    // Track delivery attempts
    deliveryAttempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 3,
    },

    lastAttemptDate: {
      type: Date,
    },

    nextAttemptDate: {
      type: Date,
    },


    rejectReason: {
      type: String,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    // Customer details
    customerName: {
      type: String,
    },

    customerPhone: {
      type: String,
    },

    address: {
      type: String,
    },

    pincode: {
      type: String,
    },

    courierRemarks: {
      type: String,
    },

    // Track attempt history
    attemptHistory: [
      {
        date: String,
        status: String,
      },
    ],

    expectedDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.NDR || mongoose.model("NDR", ndrSchema);