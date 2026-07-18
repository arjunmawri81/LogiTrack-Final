const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createRTO,
  getRTOs,
  getRTOById,
  updateRTOStatus,
  requestRTOFromNDR,
  getRTOStats,
  cancelRTO,
  schedulePickup,
  markPickedUp,
  moveTransit,
  warehouseReceived,
  completeRTO,
} = require("../controllers/rtoController");

// ================================
// MERCHANT ROUTES
// ================================

// Create RTO
router.post("/", authMiddleware, createRTO);

// Get all RTOs (Merchant sees own, Admin sees all)
router.get("/", authMiddleware, getRTOs);

// Get RTO by ID
router.get("/:id", authMiddleware, getRTOById);

// Update RTO Status (Merchant can only cancel)
router.patch("/:id/status", authMiddleware, updateRTOStatus);

// Request RTO from NDR
router.post("/request-from-ndr/:ndrId", authMiddleware, requestRTOFromNDR);

// Get RTO Stats
router.get("/stats/merchant", authMiddleware, getRTOStats);

// Cancel RTO (Merchant)
router.put("/:id/cancel", authMiddleware, cancelRTO);

// ================================
// ADMIN WORKFLOW ROUTES
// ================================

// Schedule Pickup (Admin only)
router.put(
  "/:id/schedule-pickup",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  schedulePickup
);

// Mark Picked Up (Admin only)
router.put(
  "/:id/picked-up",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  markPickedUp
);

// Move to Transit (Admin only)
router.put(
  "/:id/in-transit",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  moveTransit
);

// Warehouse Received (Admin only)
router.put(
  "/:id/received",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  warehouseReceived
);

// Complete RTO (Admin only)
router.put(
  "/:id/complete",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  completeRTO
);

module.exports = router;