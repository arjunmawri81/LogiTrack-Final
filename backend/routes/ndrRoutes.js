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
  convertToRTO,
  approveReattempt,
  rejectReattempt,
  approveRTO,
  rejectRTO,
} = require("../controllers/ndrController");

// =================================
// MERCHANT ROUTES
// =================================

// Create NDR
router.post(
  "/",
  authMiddleware,
  createNDR
);

// Get All NDRs
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

// ✅ Merchant requests reattempt
router.patch(
  "/:id/reattempt",
  authMiddleware,
  reattemptNDR
);

// ✅ Merchant requests RTO
router.patch(
  "/:id/rto",
  authMiddleware,
  convertToRTO
);

// =================================
// ADMIN ROUTES
// =================================

// Admin approves reattempt
router.patch(
  "/:id/approve-reattempt",
  authMiddleware,
  approveReattempt
);

// Admin rejects reattempt
router.patch(
  "/:id/reject-reattempt",
  authMiddleware,
  rejectReattempt
);

// Admin approves RTO
router.patch(
  "/:id/approve-rto",
  authMiddleware,
  approveRTO
);

// Admin rejects RTO
router.patch(
  "/:id/reject-rto",
  authMiddleware,
  rejectRTO
);

module.exports = router;