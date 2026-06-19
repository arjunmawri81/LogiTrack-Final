const mongoose = require("mongoose");

const rateCardSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    courierPartner: {
      type: String,
      required: true,
    },

    forwardRates: {
      rate500gm: Number,
      rate1kg: Number,
      rate2kg: Number,
      additionalKg: Number,
    },

    zoneRates: {
      local: Number,
      regional: Number,
      national: Number,
    },

    codCharge: {
      type: Number,
      default: 0,
    },

    rtoCharge: {
      type: Number,
      default: 0,
    },

    reversePickup: {
      type: Number,
      default: 0,
    },

    fuelCharge: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RateCard",
  rateCardSchema
);