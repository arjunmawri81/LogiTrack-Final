const express = require("express");
const router = express.Router();

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  createNDR,
  getNDRs,
  resolveNDR,
  reattemptNDR,
  markDelivered,
  convertToRTO,
} = require("../controllers/ndrController");

// Create NDR
router.post(
  "/",
  authMiddleware,
  createNDR
);

// Get All NDR
router.get(
  "/",
  authMiddleware,
  getNDRs
);

// Resolve NDR
router.patch(
  "/:id/resolve",
  authMiddleware,
  resolveNDR
);

// Reattempt Delivery
router.patch(
  "/:id/reattempt",
  authMiddleware,
  reattemptNDR
);

// Mark Delivered
router.patch(
  "/:id/delivered",
  authMiddleware,
  markDelivered
);

// Convert To RTO
router.patch(
  "/:id/rto",
  authMiddleware,
  convertToRTO
);

module.exports = router;