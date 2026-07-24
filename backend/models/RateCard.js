const mongoose = require("mongoose");

const rateCardSchema = new mongoose.Schema(
  {
    // null = Super Admin Default Rate
    // merchantId = Merchant Custom Rate
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Courier reference
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
    },

    // DEPRECATED: For backward compatibility during migration
    // TODO: Remove after frontend migration
    courierPartner: {
      type: String,
      uppercase: true,
      trim: true,
    },

    serviceType: {
      type: String,
      enum: ["Surface", "Air"],
      default: "Surface",
      required: true,
    },

    gst: {
      type: Number,
      default: 18,
    },

    odaCharge: {
      type: Number,
      default: 0,
    },

    handlingCharge: {
      type: Number,
      default: 0,
    },

    effectiveFrom: {
      type: Date,
    },

    effectiveTo: {
      type: Date,
    },

    forwardRates: {
      rate500gm: { type: Number, default: 0 },
      rate1kg: { type: Number, default: 0 },
      rate2kg: { type: Number, default: 0 },
      rate5kg: { type: Number, default: 0 },
      additionalKg: { type: Number, default: 0 },
    },

    zoneRates: {
      local: { type: Number, default: 0 },
      regional: { type: Number, default: 0 },
      national: { type: Number, default: 0 },
    },

    codCharge: {
      type: Number,
      default: 0,
    },

    codPercentage: {
      type: Number,
      default: 0,
    },

    codBuyCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    codBuyPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    internalCostPercent: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    volumetricDivisor: {
      type: Number,
      default: 5000,
    },

    rtoCharge: {
      type: Number,
      default: 0,
    },

    rtoBuyCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    reversePickup: {
      type: Number,
      default: 0,
    },

    fuelCharge: {
      type: Number,
      default: 0,
    },

    buyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    insuranceCharge: {
      type: Number,
      default: 0,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    serviceability: {
      codEnabled: { type: Boolean, default: true },
      prepaidEnabled: { type: Boolean, default: true },
      rtoEnabled: { type: Boolean, default: true },
      reversePickup: { type: Boolean, default: true },
      pincodes: [{ type: String }], // Optional: specific pincodes
    },
  },
  {
    timestamps: true,
  }
);

// UNIQUE INDEX: Merchant + Courier ID + Service Type (Primary)
rateCardSchema.index(
  {
    merchantId: 1,
    courierId: 1,
    serviceType: 1,
  },
  {
    unique: true,
  }
);

//  DEPRECATED: Keep for backward compatibility during migration
// TODO: Remove after frontend migration
rateCardSchema.index(
  {
    merchantId: 1,
    courierPartner: 1,
    serviceType: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const RateCard =
  mongoose.models.RateCard ||
  mongoose.model("RateCard", rateCardSchema);



module.exports = RateCard;