const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getChannels,
  connectChannel,
  toggleAutoSync,
  syncChannelOrders,
  deleteChannel,
  getSyncStatus,
  retrySyncForOrder,
} = require("../controllers/channelController");

router.get("/", authMiddleware, getChannels);
router.post("/", authMiddleware, connectChannel);
router.patch("/:id/toggle-sync", authMiddleware, toggleAutoSync);
router.post("/:id/sync", authMiddleware, syncChannelOrders);
router.delete("/:id", authMiddleware, deleteChannel);

// Two-Way Sync Status & Retry
router.get("/sync-status", authMiddleware, getSyncStatus);
router.post("/retry-sync/:orderId", authMiddleware, retrySyncForOrder);

module.exports = router;
