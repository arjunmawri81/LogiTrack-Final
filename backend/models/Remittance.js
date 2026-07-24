const mongoose = require("mongoose");

const remittanceSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true },
    awb: String,
    codAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "RECEIVED_FROM_COURIER", "PAID_TO_MERCHANT"],
      default: "PENDING",
    },
    receivedDate: Date,
    paidDate: Date,
    utrNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Remittance", remittanceSchema);
