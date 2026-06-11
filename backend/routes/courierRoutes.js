const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createCourier,
  getCouriers,
  calculateRate,
  checkServiceability,
} = require("../controllers/courierController");

// Create Courier
router.post(
  "/",
  authMiddleware,
  authorizeRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  createCourier
);

// Get Couriers
router.get(
  "/",
  authMiddleware,
  getCouriers
);

// Rate Calculator
router.post(
  "/rate",
  authMiddleware,
  calculateRate
);

// Serviceability
router.post(
  "/serviceability",
  authMiddleware,
  checkServiceability
);

module.exports = router;