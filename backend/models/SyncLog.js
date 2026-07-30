/**
 * SyncLog.js
 * ──────────
 * Records every Two-Way Sync attempt (success or failure)
 * between LogiTrack and external channels (Shopify, WooCommerce).
 */

const mongoose = require("mongoose");

const syncLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      index: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    channel: {
      type: String,
      enum: ["SHOPIFY", "WOOCOMMERCE", "CUSTOM"],
      required: true,
    },
    channelOrderId: {
      type: String,
      default: "",
    },
    event: {
      type: String,
      enum: [
        "FULFILLMENT_CREATED",
        "FULFILLMENT_FAILED",
        "DELIVERY_UPDATED",
        "DELIVERY_NOTED",
        "RETRY_SUCCESS",
        "PERMANENTLY_FAILED",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING", "PERMANENTLY_FAILED"],
      default: "PENDING",
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
      default: "",
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    nextRetryAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: merchant + order lookups for Sync Status dashboard
syncLogSchema.index({ orderId: 1, channel: 1, status: 1 });
syncLogSchema.index({ status: 1, retryCount: 1, nextRetryAt: 1 });

module.exports = mongoose.model("SyncLog", syncLogSchema);
