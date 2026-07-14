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
  calculatePricing,
} = require("../controllers/rateCardController");

// ====================================
// SAVE OR UPDATE RATE CARD
// ====================================
router.post(
  "/save",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"), // ✅ ONLY SUPER_ADMIN
  saveRateCard
);

// ====================================
// GET ALL RATE CARDS OF MERCHANT
// ====================================
router.get(
  "/merchant/:merchantId",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"), // ✅ CHANGED: Added ADMIN
  getMerchantRateCards
);

// ====================================
// GET SINGLE COURIER RATE CARD
// ====================================
router.get(
  "/merchant/:merchantId/:courierId",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"), // ✅ CHANGED: Added ADMIN
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
// DELETE RATE CARD
// ====================================
router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"), // ✅ ONLY SUPER_ADMIN
  deleteRateCard
);

module.exports = router;