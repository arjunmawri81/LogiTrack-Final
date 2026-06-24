const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },

    customerAddress: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    productName: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    weight: {
      type: Number,
      default: 0,
    },

    length: {
      type: Number,
      default: 0,
    },

    breadth: {
      type: Number,
      default: 0,
    },

    height: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      enum: ["COD", "PREPAID"],
      default: "PREPAID",
    },

    amount: {
      type: Number,
      required: true,
    },

    // ✅ INSURANCE FIELDS ADDED HERE
    insuranceEnabled: {
      type: Boolean,
      default: false,
    },

    insuranceAmount: {
      type: Number,
      default: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    courierPartner: {
      type: String,
      default: "",
    },

    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    awb: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "PACKED",
        "READY_FOR_PICKUP",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
        "NDR",
        "RTO",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    this.orderNumber =
      "ORD" +
      Date.now() +
      Math.floor(1000 + Math.random() * 9000);
  }
});

module.exports = mongoose.model("Order", orderSchema);