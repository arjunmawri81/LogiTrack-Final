const express = require("express");

const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  saveRateCard,
  getMerchantRateCards,
  getCourierRateCard,
  deleteRateCard,
  getRecommendedCouriers,
  calculatePricing, // ✅ ADDED
} = require("../controllers/rateCardController");

// ====================================
// SAVE OR UPDATE RATE CARD
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
  authorizeRoles("SUPER_ADMIN"),
  getMerchantRateCards
);

// ====================================
// GET SINGLE COURIER RATE CARD
// ====================================
router.get(
  "/merchant/:merchantId/:courier",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
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
  calculatePricing //
);

// ====================================
// DELETE RATE CARD
// ====================================
router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteRateCard
);

module.exports = router;