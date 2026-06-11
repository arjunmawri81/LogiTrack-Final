const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
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

    // AWB
    awb: {
      type: String,
      unique: true,
      required: true,
    },

    // Courier
    courier: {
      type: String,
      required: true,
    },

    // Label & Tracking
    barcode: {
      type: String,
      default: "",
    },

    qrCode: {
      type: String,
      default: "",
    },

    labelUrl: {
      type: String,
      default: "",
    },

    // Pickup
    pickupDate: {
      type: Date,
      default: null,
    },

    deliveryDate: {
      type: Date,
      default: null,
    },

    // Tracking Timeline
    trackingEvents: [
      {
        status: String,
        location: String,
        remark: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status
    status: {
      type: String,
      enum: [
        "PENDING",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RTO",
        "RETURNED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Shipment",
  shipmentSchema
);