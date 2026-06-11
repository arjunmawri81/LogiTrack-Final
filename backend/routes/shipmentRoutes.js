const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  createShipment,
  getShipments,
  trackShipment,
  updateShipmentStatus,
  schedulePickup,
  generateShipmentQR,
  getTrackingTimeline,
} = require("../controllers/shipmentController");

// ===============================
// CREATE SHIPMENT
// ===============================
router.post(
  "/",
  authMiddleware,
  createShipment
);

// ===============================
// GET ALL SHIPMENTS
// ===============================
router.get(
  "/",
  authMiddleware,
  getShipments
);

// ===============================
// TRACK SHIPMENT BY AWB
// Example:
// /api/shipments/track/AWB123456
// ===============================
router.get(
  "/track/:id",
  authMiddleware,
  trackShipment
);

// ===============================
// UPDATE SHIPMENT STATUS
// ===============================
router.patch(
  "/:id/status",
  authMiddleware,
  updateShipmentStatus
);

// ===============================
// SCHEDULE PICKUP
// ===============================
router.post(
  "/:id/pickup",
  authMiddleware,
  schedulePickup
);

// ===============================
// GENERATE QR CODE
// ===============================
router.get(
  "/:id/qr",
  authMiddleware,
  generateShipmentQR
);

// ===============================
// GET TRACKING TIMELINE
// ===============================
router.get(
  "/:id/timeline",
  authMiddleware,
  getTrackingTimeline
);

module.exports = router;