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
        "REATTEMPT",
        "DELIVERED",
        "RTO",
        "RESOLVED",
        "FAILED",
      ],
      default: "PENDING",
    },

    remarks: {
      type: String,
      default: "",
    },

    actionTaken: {
      type: String,
      enum: [
        "NONE",
        "CALL_CUSTOMER",
        "ADDRESS_UPDATED",
        "REATTEMPT",
        "RTO",
      ],
      default: "NONE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NDR", ndrSchema);