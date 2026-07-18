const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "WALLET",
        "UPI",
        "CARD",
        "NETBANKING",
        "COD",
        "PREPAID",
      ],
      default: "PREPAID",
    },

    status: {
      type: String,
      enum: [
        "PAID",
        "PENDING",
        "FAILED",
        "REFUNDED",
      ],
      default: "PAID",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ================================
// AUTO CALCULATE TOTAL AMOUNT
// ================================
invoiceSchema.pre("save", function () {
  this.totalAmount =
    Number(this.amount || 0) +
    Number(this.taxAmount || 0) +
    Number(this.shippingCharge || 0);
});

// ================================
// INDEXES FOR PERFORMANCE
// ================================

// Merchant invoices sorted by latest
invoiceSchema.index({
  merchantId: 1,
  createdAt: -1,
});

// Merchant + Status filter
invoiceSchema.index({
  merchantId: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);