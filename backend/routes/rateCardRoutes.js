const express = require("express");

const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  saveRateCard,
  getMerchantRateCards,
  getMyRateCards,
  getCourierRateCard,
  deleteRateCard,
  reactivateRateCard,
  getRecommendedCouriers,
  calculatePricing,
  checkServiceability,
} = require("../controllers/rateCardController");

// ====================================
// SERVICEABILITY CHECK
// ====================================
router.get(
  "/serviceability/:pincode",
  authMiddleware,
  checkServiceability
);

// ====================================
// GET LOGGED-IN MERCHANT'S RATE CARDS
// ====================================
router.get(
  "/my-ratecards",
  authMiddleware,
  getMyRateCards
);

// ====================================
// SAVE OR UPDATE RATE CARD (SUPER_ADMIN ONLY)
// ====================================
router.post(
  "/save",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  saveRateCard
);

// ====================================
// GET ALL RATE CARDS OF MERCHANT
// ====================================
router.get(
  "/merchant/:merchantId",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getMerchantRateCards
);

// ====================================
// GET SINGLE COURIER RATE CARD
// ====================================
router.get(
  "/merchant/:merchantId/:courierId",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getCourierRateCard
);

// ====================================
// COURIER RECOMMENDATION
// ====================================
router.get(
  "/recommendation",
  authMiddleware,
  getRecommendedCouriers
);

// ====================================
// CALCULATE SHIPPING PRICE
// ====================================
router.post(
  "/calculate",
  authMiddleware,
  calculatePricing
);

// ====================================
// DELETE RATE CARD (SUPER_ADMIN ONLY)
// ====================================
router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteRateCard
);

// ====================================
// REACTIVATE RATE CARD (SUPER_ADMIN ONLY)
// ====================================
router.patch(
  "/delete/:id/reactivate",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  reactivateRateCard
);

module.exports = router;