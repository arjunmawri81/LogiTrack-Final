const mongoose = require("mongoose");

const rtoSchema = new mongoose.Schema(
  {
    // ======================
    // RELATIONSHIPS
    // ======================
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ STEP 1: Added orderId and ndrId
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    ndrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NDR",
    },

    // ======================
    // SHIPMENT INFO
    // ======================
    // ✅ STEP 2: Added awb and courier
    awb: {
      type: String,
      default: "",
    },

    courier: {
      type: String,
      default: "",
    },

    // ======================
    // RTO REASON
    // ======================
    reason: {
      type: String,
      required: true,
    },

    // ✅ STEP 4: Added rtoReason (more specific)
    rtoReason: {
      type: String,
      default: "",
    },

    // ======================
    // CUSTOMER INFO
    // ======================
    // ✅ STEP 3: Added customer details
    customerName: {
      type: String,
      default: "",
    },

    customerPhone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    // ======================
    // RTO TRACKING
    // ======================
    returnAwb: {
      type: String,
      default: "",
    },

    // ======================
    // REMARKS
    // ======================
    remarks: {
      type: String,
      default: "",
    },

    // ✅ STEP 4: Added courierRemarks
    courierRemarks: {
      type: String,
      default: "",
    },

    // ======================
    // STATUS & TIMESTAMPS
    // ======================
    status: {
      type: String,
      enum: [
        "INITIATED",
        "PICKUP_SCHEDULED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_RETURN",
        "RECEIVED_AT_WAREHOUSE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "INITIATED",
    },

    receivedDate: {
      type: Date,
      default: null,
    },

    completedDate: {
      type: Date,
      default: null,
    },

    // ✅ STEP 5: Added RTO approval timestamps
    rtoRequestedAt: {
      type: Date,
      default: null,
    },

    rtoApprovedAt: {
      type: Date,
      default: null,
    },

    rtoApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================
    // ADDITIONAL FIELDS
    // ======================
    returnAttempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 3,
    },

    nextAttemptDate: {
      type: Date,
      default: null,
    },

    lastAttemptDate: {
      type: Date,
      default: null,
    },

    trackingUrl: {
      type: String,
      default: "",
    },

    courierAccount: {
      type: String,
      default: "",
    },

    createdBy: {
      type: String,
      enum: ["merchant", "admin", "system"],
      default: "merchant",
    },

    source: {
      type: String,
      enum: ["manual", "ndr_rto_approval", "api", "bulk"],
      default: "manual",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================
    // ATTEMPT HISTORY
    // ======================
    attemptHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
        },
        remarks: {
          type: String,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ======================
// INDEXES FOR PERFORMANCE
// ======================
rtoSchema.index({ merchantId: 1, createdAt: -1 });
rtoSchema.index({ shipmentId: 1 });
rtoSchema.index({ orderId: 1 });
rtoSchema.index({ status: 1 });
rtoSchema.index({ awb: 1 });
rtoSchema.index({ courier: 1 });
rtoSchema.index({ pincode: 1 });

// ======================
// VIRTUAL FIELDS
// ======================
rtoSchema.virtual("isCompleted").get(function() {
  return this.status === "COMPLETED";
});

rtoSchema.virtual("isInProgress").get(function() {
  return ["INITIATED", "PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_RETURN"].includes(this.status);
});

rtoSchema.virtual("isPending").get(function() {
  return this.status === "INITIATED";
});

// ======================
// METHODS
// ======================
rtoSchema.methods.addAttempt = function(status, remarks, userId) {
  this.attemptHistory.push({
    date: new Date(),
    status: status,
    remarks: remarks || "",
    updatedBy: userId,
  });
  this.returnAttempts = (this.returnAttempts || 0) + 1;
  this.lastAttemptDate = new Date();
  return this.save();
};

rtoSchema.methods.updateStatus = function(newStatus, remarks, userId) {
  this.status = newStatus;
  this.lastUpdatedBy = userId;
  
  if (remarks) {
    this.remarks = remarks;
  }
  
  // Update specific timestamps based on status
  if (newStatus === "PICKUP_SCHEDULED" && !this.rtoRequestedAt) {
    this.rtoRequestedAt = new Date();
  }
  
  if (newStatus === "PICKED_UP") {
    // Pickup timestamp
  }
  
  if (newStatus === "RECEIVED_AT_WAREHOUSE") {
    this.receivedDate = new Date();
  }
  
  if (newStatus === "COMPLETED") {
    this.completedDate = new Date();
  }
  
  // Add to attempt history
  this.attemptHistory.push({
    date: new Date(),
    status: newStatus,
    remarks: remarks || "",
    updatedBy: userId,
  });
  
  return this.save();
};

module.exports = mongoose.model("RTO", rtoSchema);