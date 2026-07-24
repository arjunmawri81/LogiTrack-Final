const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
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

// Merchant requests reattempt
router.patch(
  "/:id/reattempt",
  authMiddleware,
  reattemptNDR
);

// Merchant requests RTO
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
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  approveReattempt
);

// Admin rejects reattempt
router.patch(
  "/:id/reject-reattempt",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  rejectReattempt
);

// Admin approves RTO
router.patch(
  "/:id/approve-rto",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  approveRTO
);

// Admin rejects RTO
router.patch(
  "/:id/reject-rto",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  rejectRTO
);

module.exports = router;