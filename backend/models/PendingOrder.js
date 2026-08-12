const mongoose = require("mongoose");

const pendingOrderSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true, // Amount in Rupees
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 Hours TTL Index - Auto cleanup of stale pending orders
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.PendingOrder || mongoose.model("PendingOrder", pendingOrderSchema);
