const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema(
  {
    // Basic Details
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["DOMESTIC", "INTERNATIONAL"],
      default: "DOMESTIC",
    },

    logo: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // Priority (Auto Courier Selection)
    priority: {
      type: Number,
      default: 1,
    },

    // API Information
    apiProvider: {
      type: String,
      default: "",
    },

    apiIntegrated: {
      type: Boolean,
      default: false,
    },

    apiStatus: {
      type: String,
      enum: ["CONNECTED", "DISCONNECTED", "PENDING"],
      default: "PENDING",
    },

    // Supported Services
    supportsCOD: {
      type: Boolean,
      default: true,
    },

    supportsPrepaid: {
      type: Boolean,
      default: true,
    },

    supportsReversePickup: {
      type: Boolean,
      default: true,
    },

    supportsInternational: {
      type: Boolean,
      default: false,
    },

    // Tracking
    trackingUrl: {
      type: String,
      default: "",
    },

    // Contact Details
    website: {
      type: String,
      default: "",
    },

    contactEmail: {
      type: String,
      default: "",
    },

    contactPhone: {
      type: String,
      default: "",
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courierSchema.index({ type: 1 });
courierSchema.index({ isActive: 1 });
courierSchema.index({ priority: 1 });

module.exports = mongoose.models.Courier || mongoose.model("Courier", courierSchema);