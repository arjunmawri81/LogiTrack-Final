const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  createShipment,
  createBulkShipments,
  getShipments,
  getShipmentById,
  trackShipment,
  updateShipmentStatus,
  schedulePickup,
  generateShipmentQR,
  getTrackingTimeline,
  generateLabel,
  bulkLabels, // ✅ ADDED
} = require("../controllers/shipmentController");

// ===============================
// CREATE SHIPMENT
// ===============================
router.post("/", authMiddleware, createShipment);

// ===============================
// BULK CREATE SHIPMENTS
// ===============================
router.post("/bulk", authMiddleware, createBulkShipments);

// ===============================
// BULK LABELS DOWNLOAD
// ===============================
router.post("/bulk-labels", authMiddleware, bulkLabels); // ✅ ADDED

// ===============================
// GET ALL SHIPMENTS
// ===============================
router.get("/", authMiddleware, getShipments);

// ===============================
// TRACK SHIPMENT BY AWB
// Example:
// GET /api/shipments/track/AWB123456
// ===============================
router.get("/track/:id", authMiddleware, trackShipment);

// ===============================
// GET SINGLE SHIPMENT
// ===============================
router.get("/:id", authMiddleware, getShipmentById);

// ===============================
// UPDATE SHIPMENT STATUS
// ===============================
router.patch("/:id/status", authMiddleware, updateShipmentStatus);

// ===============================
// SCHEDULE PICKUP
// ===============================
router.post("/:id/pickup", authMiddleware, schedulePickup);

// ===============================
// GENERATE SHIPPING LABEL PDF
// ===============================
router.get("/:id/label", authMiddleware, generateLabel);

// ===============================
// GENERATE QR CODE
// ===============================
router.get("/:id/qr", authMiddleware, generateShipmentQR);

// ===============================
// GET TRACKING TIMELINE
// ===============================
router.get("/:id/timeline", authMiddleware, getTrackingTimeline);

module.exports = router;