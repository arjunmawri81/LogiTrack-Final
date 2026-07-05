const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    awb: {
      type: String,
      required: true,
      unique: true,
      match: [/^[A-Za-z0-9-_]{6,40}$/, 'AWB must be 6-40 characters and can include letters, numbers, hyphens, and underscores']
    },

    // ✅ UPDATED: Removed enum restriction
    courier: {
      type: String,
      required: true,
      trim: true,
    },

    courierPartner: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ ADDED: courierId field for proper relationship
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "READY_FOR_PICKUP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "NDR",
        "RTO",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    trackingEvents: [
      {
        status: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          default: "",
        },
        remark: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    pickupDate: {
      type: Date,
      default: null,
    },

    deliveryDate: {
      type: Date,
      default: null,
    },

    qrCode: {
      type: String,
      default: "",
    },

    labelUrl: {
      type: String,
      default: "",
    },

    manifestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manifest",
      default: null,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    insuranceEnabled: {
      type: Boolean,
      default: false,
    },

    insuranceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    insurancePremium: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedDeliveryDate: {
      type: Date,
      default: null,
    },

    codCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    fuelCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    dimensions: {
      length: { type: Number, default: 0, min: 0 },
      breadth: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },

    isCOD: {
      type: Boolean,
      default: false,
    },

    codAmount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function(v) {
          if (this.isCOD && v <= 0) return false;
          return true;
        },
        message: 'COD amount must be greater than 0 when isCOD is true'
      }
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
    },

    ndrStatus: {
      type: String,
      enum: ["NONE", "PENDING", "RESOLVED", "FAILED"],
      default: "NONE",
    },

    ndrDetails: {
      reason: { type: String, default: "" },
      attemptedDate: { type: Date, default: null },
      nextAttemptDate: { type: Date, default: null },
      customerContacted: { type: Boolean, default: false },
    },

    rtoStatus: {
      type: String,
      enum: ["NONE", "INITIATED", "IN_TRANSIT", "COMPLETED"],
      default: "NONE",
    },

    rtoDetails: {
      reason: { type: String, default: "" },
      initiatedDate: { type: Date, default: null },
      completedDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// ============ PRE-SAVE HOOK ============
shipmentSchema.pre("save", function () {
  if (!this.trackingEvents || this.trackingEvents.length === 0) {
    this.trackingEvents = [
      {
        status: this.status || "PENDING",
        location: "Warehouse",
        remark: "Shipment Created",
        timestamp: new Date(),
      },
    ];
  }

  if (this.status === "READY_FOR_PICKUP" && !this.pickupDate) {
    this.pickupDate = new Date();
  }

  if (this.status === "DELIVERED" && !this.deliveryDate) {
    this.deliveryDate = new Date();
  }

  if (this.rtoStatus === "COMPLETED" && !this.rtoDetails.completedDate) {
    this.rtoDetails.completedDate = new Date();
  }
});

// ============ INSTANCE METHODS ============

// Check if shipment is deliverable
shipmentSchema.methods.isDeliverable = function() {
  return ["PENDING", "READY_FOR_PICKUP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(this.status);
};

// Check if shipment is completed
shipmentSchema.methods.isCompleted = function() {
  return ["DELIVERED", "CANCELLED", "RTO"].includes(this.status);
};

// Add tracking event
shipmentSchema.methods.addTrackingEvent = function(status, location, remark) {
  this.trackingEvents.push({
    status,
    location: location || "",
    remark: remark || "",
    timestamp: new Date(),
  });
  
  this.status = status;

  // Auto-update dates
  if (status === "READY_FOR_PICKUP" && !this.pickupDate) {
    this.pickupDate = new Date();
  }
  if (status === "DELIVERED" && !this.deliveryDate) {
    this.deliveryDate = new Date();
  }

  return this.save();
};

// Update NDR status
shipmentSchema.methods.updateNDR = function(ndrStatus, ndrDetails) {
  this.ndrStatus = ndrStatus;
  if (ndrDetails) {
    this.ndrDetails = { ...this.ndrDetails, ...ndrDetails };
  }
  return this.save();
};

// Update RTO status
shipmentSchema.methods.updateRTO = function(rtoStatus, rtoDetails) {
  this.rtoStatus = rtoStatus;
  if (rtoDetails) {
    this.rtoDetails = { ...this.rtoDetails, ...rtoDetails };
  }
  
  if (rtoStatus === "INITIATED" && !this.rtoDetails.initiatedDate) {
    this.rtoDetails.initiatedDate = new Date();
  }
  if (rtoStatus === "COMPLETED" && !this.rtoDetails.completedDate) {
    this.rtoDetails.completedDate = new Date();
  }
  
  return this.save();
};

// ============ VIRTUAL PROPERTIES ============

// Virtual for tracking URL
shipmentSchema.virtual("trackingUrl").get(function() {
  if (!this.awb) return null;

  // Note: These URLs are best-effort and may change over time.
  // Since this is a virtual property, broken URLs won't affect your core logic.
  const courierTrackingUrls = {
    dtdc: `https://www.dtdc.in/tracking.asp?awb=${this.awb}`,
    delhivery: `https://www.delhivery.com/track/${this.awb}`,
    xpressbees: `https://track.xpressbees.com/${this.awb}`,
    bluedart: `https://www.bluedart.com/tracking/${this.awb}`,
    ecom: `https://www.ecomtrack.in/track/${this.awb}`,
    shadowfax: `https://www.shadowfax.in/tracking/${this.awb}`,
    other: null,
  };

  const courierLower = this.courier?.toLowerCase() || "";
  return courierTrackingUrls[courierLower] || null;
});

// Virtual for total shipment cost
shipmentSchema.virtual("totalCost").get(function() {
  return (
    (this.shippingCharge || 0) +
    (this.codCharge || 0) +
    (this.fuelCharge || 0) +
    (this.insurancePremium || 0)
  );
});

// Virtual for isInsured
shipmentSchema.virtual("isInsured").get(function() {
  return this.insuranceEnabled === true;
});

// ============ JSON/OBJECT TRANSFORM ============
shipmentSchema.set("toJSON", {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

shipmentSchema.set("toObject", {
  virtuals: true,
});

// ============ INDEXES ============
// Primary query indexes
shipmentSchema.index({ merchantId: 1, createdAt: -1 });
shipmentSchema.index({ merchantId: 1, status: 1, createdAt: -1 });

// Unique indexes
shipmentSchema.index({ orderId: 1 }, { unique: true });

// Filter indexes
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ courier: 1 });
shipmentSchema.index({ courierPartner: 1 });
shipmentSchema.index({ courierId: 1 }); // ✅ ADDED: Index for courierId
shipmentSchema.index({ expectedDeliveryDate: 1 });

// Compound indexes for common queries
shipmentSchema.index({ isCOD: 1, status: 1 });
shipmentSchema.index({ merchantId: 1, isCOD: 1 });
shipmentSchema.index({ status: 1, createdAt: -1 });

// ============ EXPORT ============
module.exports = mongoose.model("Shipment", shipmentSchema);