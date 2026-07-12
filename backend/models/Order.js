const mongoose = require("mongoose");
const { ORDER_STATUSES } = require("../constants/statusConstants");

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
    },

    // ===== CUSTOMER DETAILS =====
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

    // ✅ Production fields (used by shipment controller)
    customerCity: {
      type: String,
      required: true,
    },

    customerState: {
      type: String,
      required: true,
    },

    customerPincode: {
      type: String,
      required: true,
    },

    // ===== ORDER ITEMS =====
    // ✅ Primary items array (future standard)
    items: {
      type: [
        {
          name: { type: String, required: true },
          sku: { type: String, default: "" },
          quantity: { type: Number, default: 1, min: 1 },
          price: { type: Number, required: true, min: 0 },
          weight: { type: Number, default: 0 },
        },
      ],
      default: [],
    },

    // ⚠️ Legacy fields (backward compatibility - will be removed in v3)
    productName: {
      type: String,
      default: "",
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

    // ===== SHIPMENT DIMENSIONS =====
    // ✅ Primary dimensions object (future standard)
    dimensions: {
      type: {
        length: { type: Number, default: 0 },
        breadth: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
      },
      default: () => ({}),
    },

    // ⚠️ Legacy fields (backward compatibility - will be removed in v3)
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

    weight: {
      type: Number,
      default: 0,
    },

    // ===== PAYMENT =====
    paymentMode: {
      type: String,
      enum: ["COD", "PREPAID"],
      default: "PREPAID",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

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

    // ===== SHIPMENT REFERENCES =====
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

    // ===== ORDER STATUS - Production Lifecycle =====
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "NEW",
    },

    // ===== ORDER TIMELINE (Audit Log) =====
    timeline: {
      type: [
        {
          status: { type: String, required: true },
          message: { type: String, default: "" },
          timestamp: { type: Date, default: Date.now },
          updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// INDEXES (Performance)
// ===============================

// ✅ Merchant + Status (Admin dashboard filters)
orderSchema.index({ merchantId: 1, status: 1 });

// ✅ Merchant + CreatedAt (Recent orders)
orderSchema.index({ merchantId: 1, createdAt: -1 });

// ✅ AWB (Tracking lookup)
orderSchema.index({ awb: 1 });

// ✅ Shipment ID (Join lookups)
orderSchema.index({ shipmentId: 1 });



// ✅ Status alone (Bulk operations)
orderSchema.index({ status: 1 });

// ===============================
// PRE-SAVE HOOKS
// ===============================

// ✅ Generate unique order number
orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    this.orderNumber = "ORD" + Date.now() + Math.floor(1000 + Math.random() * 9000);
  }
});

// ✅ Auto-add first timeline entry on creation
orderSchema.pre("save", function () {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: this.status || "NEW",
      message: "Order created",
      timestamp: new Date(),
    });
  }
});

// ===============================
// INSTANCE METHODS
// ===============================

// ✅ Add status change to timeline
orderSchema.methods.addTimelineEvent = function (status, message, userId = null) {
  this.timeline.push({
    status,
    message: message || `Order status changed to ${status}`,
    timestamp: new Date(),
    updatedBy: userId,
  });
  this.status = status;
  return this.save();
};

// ✅ Check if shipment can be created (ONLY for NEW orders)
orderSchema.methods.isShippable = function () {
  // ✅ FIX: Only NEW orders can create shipment
  return this.status === "NEW";
};

// ✅ Check if order is delivered
orderSchema.methods.isDelivered = function () {
  return this.status === "DELIVERED";
};

// ✅ Check if order is cancelled
orderSchema.methods.isCancelled = function () {
  return this.status === "CANCELLED";
};

// ✅ Check if order has shipment created
orderSchema.methods.hasShipment = function () {
  return !!this.shipmentId;
};

// ✅ Get primary item (for backward compatibility)
orderSchema.methods.getPrimaryItem = function () {
  if (this.items && this.items.length > 0) {
    return this.items[0];
  }
  return {
    name: this.productName || "Product",
    sku: this.sku || "",
    quantity: this.quantity || 1,
    price: this.amount / (this.quantity || 1),
    weight: this.weight || 0,
  };
};

// ===============================
// STATIC METHODS
// ===============================

// ✅ Get orders by merchant with filters
orderSchema.statics.getMerchantOrders = function (merchantId, filters = {}) {
  const query = { merchantId: new mongoose.Types.ObjectId(merchantId) };
  
  if (filters.status) query.status = filters.status;
  if (filters.fromDate) query.createdAt = { $gte: new Date(filters.fromDate) };
  if (filters.toDate) {
    if (!query.createdAt) query.createdAt = {};
    query.createdAt.$lte = new Date(filters.toDate);
  }
  if (filters.search) {
    query.$or = [
      { orderNumber: { $regex: filters.search, $options: "i" } },
      { customerName: { $regex: filters.search, $options: "i" } },
      { customerPhone: { $regex: filters.search, $options: "i" } },
    ];
  }

  return this.find(query).sort({ createdAt: -1 });
};

// ✅ Get pending shipments count (ONLY NEW orders without shipment)
orderSchema.statics.getPendingShipmentsCount = function (merchantId) {
  // ✅ FIX: Only NEW orders that don't have shipment yet
  return this.countDocuments({
    merchantId: new mongoose.Types.ObjectId(merchantId),
    status: "NEW",
    shipmentId: null,
  });
};

// ✅ Get delivery stats with ObjectId fix
orderSchema.statics.getDeliveryStats = function (merchantId) {
  return this.aggregate([
    { 
      $match: { 
        merchantId: new mongoose.Types.ObjectId(merchantId) 
      } 
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

// ✅ Get orders by status (bulk operations)
orderSchema.statics.getByStatus = function (merchantId, status) {
  return this.find({
    merchantId: new mongoose.Types.ObjectId(merchantId),
    status: status,
  });
};

// ✅ Get orders without shipment
orderSchema.statics.getOrdersWithoutShipment = function (merchantId) {
  return this.find({
    merchantId: new mongoose.Types.ObjectId(merchantId),
    status: "NEW",
    shipmentId: null,
  });
};

// ===============================
// VIRTUAL PROPERTIES
// ===============================

// ✅ Total items count
orderSchema.virtual("totalItems").get(function () {
  if (this.items && this.items.length > 0) {
    return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
  return this.quantity || 1;
});

// ✅ Total weight
orderSchema.virtual("totalWeight").get(function () {
  if (this.items && this.items.length > 0) {
    return this.items.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
  }
  return this.weight || 0;
});

// ✅ Display name
orderSchema.virtual("displayName").get(function () {
  return this.orderNumber || `ORD-${this._id.toString().slice(-6)}`;
});

// ✅ Is COD
orderSchema.virtual("isCOD").get(function () {
  return this.paymentMode === "COD";
});

// ✅ Is Prepaid
orderSchema.virtual("isPrepaid").get(function () {
  return this.paymentMode === "PREPAID";
});

// ✅ Full customer address (for display)
orderSchema.virtual("fullAddress").get(function () {
  return `${this.customerAddress}, ${this.customerCity}, ${this.customerState} - ${this.customerPincode}`;
});

// ✅ Can be cancelled?
orderSchema.virtual("canCancel").get(function () {
  return ["NEW", "READY_FOR_PICKUP"].includes(this.status);
});

// Enable virtuals in JSON
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);