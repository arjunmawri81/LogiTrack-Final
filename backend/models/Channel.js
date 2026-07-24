const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channelName: {
      type: String,
      required: true,
      enum: ["SHOPIFY", "WOOCOMMERCE", "CUSTOM"],
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      default: "",
    },
    apiSecret: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoSync: {
      type: Boolean,
      default: true,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Channel", channelSchema);
