const express = require("express");

const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createCourier,
  getCouriers,
  getActiveCouriers,
  getCourierById,
  updateCourier,
  toggleCourierStatus,
  deleteCourier,
} = require("../controllers/courierController");

// ========================================
// SUPER ADMIN ROUTES
// ========================================

// Create Courier
router.post(
  "/",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  createCourier
);

// Get All Couriers (Super Admin)
router.get(
  "/all",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getCouriers
);

// Get Single Courier
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getCourierById
);

// Update Courier
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  updateCourier
);

// Enable / Disable Courier
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  toggleCourierStatus
);

// Delete Courier
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteCourier
);

// ========================================
// ACTIVE COURIERS (ADMIN + MERCHANT)
// ========================================

router.get(
  "/active/list",
  authMiddleware,
  authorizeRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "MERCHANT"
  ),
  getActiveCouriers
);

module.exports = router;