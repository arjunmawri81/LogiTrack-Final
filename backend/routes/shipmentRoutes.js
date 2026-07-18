const express = require("express");
const router = express.Router();

const { authMiddleware, validateMongoId } = require("../middleware/authMiddleware");
const logoUpload = require("../middleware/logoUploadMiddleware");

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
  bulkLabels,
} = require("../controllers/shipmentController");

// ===============================
// CREATE SHIPMENT
// ===============================
router.post(
  "/",
  authMiddleware,
  validateMongoId("orderId", "courierId", "warehouseId"),
  createShipment
);

// ===============================
// BULK CREATE SHIPMENTS
// ===============================
router.post("/bulk", authMiddleware, createBulkShipments);

// ===============================
// BULK LABELS DOWNLOAD
// ===============================
router.post(
  "/bulk-labels",
  authMiddleware,
  logoUpload.single("logo"),
  bulkLabels
);

// ===============================
// GET ALL SHIPMENTS
// ===============================
router.get("/", authMiddleware, getShipments);

// ===============================
// TRACK SHIPMENT BY AWB
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
router.post(
  "/:id/label",
  authMiddleware,
  logoUpload.single("logo"),
  generateLabel
);

// ===============================
// GENERATE QR CODE
// ===============================
router.get("/:id/qr", authMiddleware, generateShipmentQR);

// ===============================
// GET TRACKING TIMELINE
// ===============================
router.get("/:id/timeline", authMiddleware, getTrackingTimeline);

module.exports = router;