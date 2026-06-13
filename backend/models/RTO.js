const mongoose = require("mongoose");

const rtoSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    returnAwb: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "INITIATED",
        "IN_TRANSIT",
        "OUT_FOR_RETURN",
        "RECEIVED_AT_WAREHOUSE",
        "COMPLETED",
      ],
      default: "INITIATED",
    },

    receivedDate: {
      type: Date,
      default: null,
    },

    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RTO", rtoSchema);