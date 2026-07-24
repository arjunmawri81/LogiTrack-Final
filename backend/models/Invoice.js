const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
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
// AUTO GENERATE INVOICE NUMBER + CALCULATE TOTAL
// ================================
invoiceSchema.pre("save", function () {
  // Auto-generate invoiceNumber if not provided
  if (!this.invoiceNumber) {
    this.invoiceNumber = "INV" + Date.now() + Math.floor(1000 + Math.random() * 9000);
  }

  // Auto-calculate totalAmount (shipping charge + tax)
  this.totalAmount =
    Number(this.shippingCharge || 0) +
    Number(this.taxAmount || 0);
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

module.exports = mongoose.models.Invoice || mongoose.model(
  "Invoice",
  invoiceSchema
);