const mongoose = require("mongoose");
const { SHIPMENT_STATUSES } = require("../constants/statusConstants");

const pickupAddressSchema = new mongoose.Schema(
  {
    warehouseName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

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

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    pickupAddress: {
      type: pickupAddressSchema,
      immutable: true,
    },

    awb: {
      type: String,
      required: true,
      match: [/^[A-Za-z0-9-_]{6,40}$/, 'AWB must be 6-40 characters and can include letters, numbers, hyphens and underscores']
    },

    courier: {
      type: String,
      required: true,
      trim: true,
    },

    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
    },

    status: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: "PICKUP_PENDING",
      index: true,
    },

    statusBeforeNDR: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: null,
    },

    statusBeforeRTO: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: null,
    },

    lastTrackingUpdate: {
      type: Date,
      default: Date.now,
    },

    tracking: [
      {
        status: {
          type: String,
          enum: SHIPMENT_STATUSES,
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

    provider: {
      type: String,
      default: "",
    },

    providerShipmentId: {
      type: String,
      default: "",
    },

    providerTrackingId: {
      type: String,
      default: "",
    },

    providerStatus: {
      type: String,
      default: "",
    },

    trackingUrl: {
      type: String,
      default: "",
    },

    manifestUrl: {
      type: String,
      default: "",
    },

    pickupRequestId: {
      type: String,
      default: "",
    },

    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },

    lastWebhookAt: {
      type: Date,
      default: null,
    },

    apiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    manifestId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Manifest" — removed: Manifest model does not exist yet.
      // Add ref back when the Manifest feature is implemented.
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

    serviceType: {
      type: String,
      enum: ["Surface", "Air"],
      default: "Surface",
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

    courierCost: {
      type: Number,
      default: 0,
      min: 0,
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

    marginEarned: {
      type: Number,
      default: 0,
    },

    codBuyCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    codMarginEarned: {
      type: Number,
      default: 0,
    },

    rtoFeeDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },

    rtoBuyCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    rtoMarginEarned: {
      type: Number,
      default: 0,
    },

    totalNetProfit: {
      type: Number,
      default: 0,
    },

    rtoChargeStatus: {
      type: String,
      enum: ["NOT_APPLICABLE", "PAID", "PENDING"],
      default: "NOT_APPLICABLE",
    },

    rtoChargePending: {
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

shipmentSchema.methods.isDeliverable = function() {
  return ["PICKUP_PENDING", "PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(this.status);
};

shipmentSchema.methods.isCompleted = function() {
  return ["DELIVERED", "CANCELLED", "RTO_COMPLETED"].includes(this.status);
};

shipmentSchema.methods.addTrackingEvent = function(status, location, remarks) {
  if (!SHIPMENT_STATUSES.includes(status)) {
    throw new Error(`Invalid tracking status: ${status}`);
  }

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
  if (!this.tracking || !this.tracking.length) return null;
  return this.tracking[this.tracking.length - 1];
};

shipmentSchema.methods.updateNDR = function(ndrStatus, ndrDetails) {
  this.ndrStatus = ndrStatus;
  if (ndrDetails) {
    this.ndrDetails = { ...this.ndrDetails, ...ndrDetails };
  }
  
  if (ndrStatus === "PENDING") {
    if (!this.statusBeforeNDR) {
      this.statusBeforeNDR = this.status;
    }
    return this.addTrackingEvent("NDR", "NDR Created", ndrDetails?.reason || "NDR initiated");
  } else if (ndrStatus === "RESOLVED") {
    const resumeStatus = this.statusBeforeNDR || "IN_TRANSIT";
    this.statusBeforeNDR = null;
    this.ndrStatus = "NONE";
    return this.addTrackingEvent(resumeStatus, "NDR Resolved", "NDR issue resolved");
  } else if (ndrStatus === "FAILED") {
    return this.updateRTO("INITIATED", { 
      reason: ndrDetails?.reason || "NDR attempts failed" 
    });
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
    
    if (!this.statusBeforeRTO) {
      this.statusBeforeRTO = this.status;
    }
    return this.addTrackingEvent("RTO_INITIATED", "RTO Initiated", rtoDetails?.reason || "RTO initiated");
  }
  
  if (rtoStatus === "IN_TRANSIT") {
    return this.addTrackingEvent("RTO_IN_TRANSIT", "RTO In Transit", "RTO in transit");
  }
  
  if (rtoStatus === "COMPLETED" && !this.rtoDetails.completedDate) {
    this.rtoDetails.completedDate = new Date();
    this.statusBeforeRTO = null;
    return this.addTrackingEvent("RTO_COMPLETED", "RTO Completed", "RTO completed");
  }
  
  return this.save();
};

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

shipmentSchema.index({ merchantId: 1, createdAt: -1 });
shipmentSchema.index({ merchantId: 1, status: 1, createdAt: -1 });
shipmentSchema.index({ orderId: 1 }, { unique: true });
shipmentSchema.index({ courier: 1 });
shipmentSchema.index({ courierId: 1 });
shipmentSchema.index({ expectedDeliveryDate: 1 });
shipmentSchema.index({ lastTrackingUpdate: -1 });
shipmentSchema.index({ isCOD: 1, status: 1 });
shipmentSchema.index({ merchantId: 1, isCOD: 1 });
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ merchantId: 1, awb: 1 }, { unique: true });
shipmentSchema.index({ providerShipmentId: 1 });
shipmentSchema.index({ providerTrackingId: 1 });
shipmentSchema.index({ provider: 1 });
shipmentSchema.index({ providerStatus: 1 });
shipmentSchema.index({ lastSyncedAt: -1 });
shipmentSchema.index({ warehouseId: 1 });
shipmentSchema.index({ merchantId: 1, warehouseId: 1 });

module.exports =
  mongoose.models.Shipment ||
  mongoose.model("Shipment", shipmentSchema);