const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },

    baseRate: {
      type: Number,
      default: 50,
    },

    ratePerKg: {
      type: Number,
      default: 20,
    },

    estimatedDays: {
      type: Number,
      default: 3,
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
  "Courier",
  courierSchema
);