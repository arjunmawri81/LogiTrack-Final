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