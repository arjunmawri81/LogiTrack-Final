/**
 * @deprecated trackingRoutes is a legacy duplicate of shipmentRoutes tracking.
 *
 * Migration path:
 *   GET /api/tracking/:id         → GET /api/shipments/track/:id  (trackShipment by AWB)
 *   PUT /api/tracking/:id/status  → PATCH /api/shipments/:id/status (updateShipmentStatus)
 *
 * Do NOT add new routes here. This file will be removed once the frontend
 * is updated to use /api/shipments/* exclusively.
 */
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getTracking,
  updateShipmentStatus,
} = require("../controllers/trackingController");

router.get(
  "/:id",
  authMiddleware,
  getTracking
);

router.put(
  "/:id/status",
  authMiddleware,
  updateShipmentStatus
);

module.exports = router;