const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      // ✅ No index: true here - using compound index below
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ Optional but good for single-field queries
    },

    awb: {
      type: String,
      required: true,
      unique: true, // ✅ Unique constraint - no separate index needed
      match: [/^[A-Za-z0-9-_]{6,40}$/, 'AWB must be 6-40 characters and can include letters, numbers, hyphens, and underscores']
    },

    // ✅ Snapshot of courier name at time of shipment creation
    courier: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Reference to courier master data
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PICKUP_PENDING",
        "PICKUP_SCHEDULED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "NDR",
        "RTO",
        "CANCELLED",
      ],
      default: "PICKUP_PENDING",
      index: true,
    },

    lastTrackingUpdate: {
      type: Date,
      default: Date.now,
    },

    tracking: [
      {
        status: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          default: "",
        },
        remarks: {
          type: String,
          default: "",
        },
        eventTime: {
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

    // ==============================
    // COURIER PROVIDER DETAILS
    // ==============================

    // Provider Name
    provider: {
      type: String,
      default: "",
    },

    // Shipment ID returned by courier
    providerShipmentId: {
      type: String,
      default: "",
    },

    // Tracking ID returned by courier
    providerTrackingId: {
      type: String,
      default: "",
    },

    // Status returned by courier API
    providerStatus: {
      type: String,
      default: "",
    },

    // Tracking URL from courier
    trackingUrl: {
      type: String,
      default: "",
    },

    // Manifest URL
    manifestUrl: {
      type: String,
      default: "",
    },

    // Pickup Request ID
    pickupRequestId: {
      type: String,
      default: "",
    },

    // Courier estimated delivery
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },

    // Last API Sync
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // Last Webhook Received
    lastWebhookAt: {
      type: Date,
      default: null,
    },

    // Courier API Raw Response
    apiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

    internalRemarks: {
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
shipmentSchema.pre("save", function() {
  if (!this.tracking || this.tracking.length === 0) {
    this.tracking = [
      {
        status: this.status || "PICKUP_PENDING",
        location: "Origin Hub",
        remarks: "Shipment Created",
        eventTime: new Date(),
      },
    ];
  }

  this.lastTrackingUpdate = new Date();

  if (this.status === "PICKED_UP" && !this.pickupDate) {
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

shipmentSchema.methods.isDeliverable = function() {
  return ["PICKUP_PENDING", "PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(this.status);
};

shipmentSchema.methods.isCompleted = function() {
  return ["DELIVERED", "CANCELLED", "RTO"].includes(this.status);
};

shipmentSchema.methods.addTrackingEvent = function(status, location, remarks) {
  this.tracking.push({
    status,
    location: location || "",
    remarks: remarks || "",
    eventTime: new Date(),
  });

  this.status = status;
  this.lastTrackingUpdate = new Date();

  if (status === "PICKED_UP" && !this.pickupDate) {
    this.pickupDate = new Date();
  }
  if (status === "DELIVERED" && !this.deliveryDate) {
    this.deliveryDate = new Date();
  }

  return this.save();
};

shipmentSchema.methods.getLastTrackingEvent = function() {
  if (!this.tracking.length) return null;
  return this.tracking[this.tracking.length - 1];
};

shipmentSchema.methods.updateNDR = function(ndrStatus, ndrDetails) {
  this.ndrStatus = ndrStatus;
  if (ndrDetails) {
    this.ndrDetails = { ...this.ndrDetails, ...ndrDetails };
  }
  
  if (ndrStatus === "PENDING") {
    return this.addTrackingEvent("NDR", "NDR Created", ndrDetails?.reason || "NDR initiated");
  } else if (ndrStatus === "RESOLVED") {
    return this.addTrackingEvent(this.status, "NDR Resolved", "NDR issue resolved");
  }
  
  return this.save();
};

shipmentSchema.methods.updateRTO = function(rtoStatus, rtoDetails) {
  this.rtoStatus = rtoStatus;
  if (rtoDetails) {
    this.rtoDetails = { ...this.rtoDetails, ...rtoDetails };
  }
  
  if (rtoStatus === "INITIATED" && !this.rtoDetails.initiatedDate) {
    this.rtoDetails.initiatedDate = new Date();
    return this.addTrackingEvent("RTO", "RTO Initiated", rtoDetails?.reason || "RTO initiated");
  }
  
  if (rtoStatus === "COMPLETED" && !this.rtoDetails.completedDate) {
    this.rtoDetails.completedDate = new Date();
    return this.addTrackingEvent("RTO", "RTO Completed", "RTO completed");
  }
  
  return this.save();
};

// ============ VIRTUAL PROPERTIES ============

shipmentSchema.virtual("totalCost").get(function() {
  return (
    (this.shippingCharge || 0) +
    (this.codCharge || 0) +
    (this.fuelCharge || 0) +
    (this.insurancePremium || 0)
  );
});

shipmentSchema.virtual("isInsured").get(function() {
  return this.insuranceEnabled === true;
});

shipmentSchema.virtual("lastScan").get(function() {
  const lastEvent = this.getLastTrackingEvent();
  if (lastEvent) {
    return {
      status: lastEvent.status,
      location: lastEvent.location,
      remarks: lastEvent.remarks,
      timestamp: lastEvent.eventTime || this.lastTrackingUpdate,
    };
  }
  return {
    status: this.status,
    location: "Origin Hub",
    remarks: "Shipment Created",
    timestamp: this.createdAt || this.lastTrackingUpdate,
  };
});

// ============ JSON/OBJECT TRANSFORM ============
shipmentSchema.set("toJSON", {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.lastScan = doc.lastScan;
    return ret;
  },
});

shipmentSchema.set("toObject", {
  virtuals: true,
});

// ============ FINAL PRODUCTION INDEXES ============

// ✅ Compound index for merchant queries - covers merchantId + createdAt
shipmentSchema.index({ merchantId: 1, createdAt: -1 });

// ✅ Compound index for merchant + status filtering
shipmentSchema.index({ merchantId: 1, status: 1, createdAt: -1 });

// ✅ Unique index for orderId - one shipment per order
shipmentSchema.index({ orderId: 1 }, { unique: true });

// ✅ Courier indexes for different query patterns
shipmentSchema.index({ courier: 1 });
shipmentSchema.index({ courierId: 1 });

// ✅ Date-based indexes for filtering and sorting
shipmentSchema.index({ expectedDeliveryDate: 1 });
shipmentSchema.index({ lastTrackingUpdate: -1 });

// ✅ COD and status combinations
shipmentSchema.index({ isCOD: 1, status: 1 });
shipmentSchema.index({ merchantId: 1, isCOD: 1 });

// ✅ Status + createdAt for recent shipments queries
shipmentSchema.index({ status: 1, createdAt: -1 });

// ✅ AWB + merchant queries (AWB has unique:true, but this covers merchant-specific lookups)
shipmentSchema.index({ awb: 1, merchantId: 1 });

// ✅ Most specific compound index for merchant AWB lookups with status
shipmentSchema.index({
  merchantId: 1,
  awb: 1,
  status: 1,
});

// ============ COURIER PROVIDER INDEXES ============

// ✅ Index for courier provider shipment ID lookups
shipmentSchema.index({ providerShipmentId: 1 });

// ✅ Index for courier provider tracking ID lookups
shipmentSchema.index({ providerTrackingId: 1 });

// ✅ Index for provider name queries
shipmentSchema.index({ provider: 1 });

// ✅ Index for provider status queries
shipmentSchema.index({ providerStatus: 1 });

// ✅ Index for last sync date queries
shipmentSchema.index({ lastSyncedAt: -1 });

// ============ EXPORT ============
module.exports = mongoose.model("Shipment", shipmentSchema);