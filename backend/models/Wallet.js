const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    transactions: [
      {
        amount: Number,

        type: {
          type: String,
          enum: ["CREDIT", "DEBIT"],
        },

        description: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);