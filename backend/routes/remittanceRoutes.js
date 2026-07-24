const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getRemittances,
  markReceivedFromCourier,
  markPaidToMerchant,
} = require("../controllers/remittanceController");

router.get("/", authMiddleware, getRemittances);
router.patch("/:id/received", authMiddleware, authorizeRoles("ADMIN", "SUPER_ADMIN"), markReceivedFromCourier);
router.patch("/:id/pay", authMiddleware, authorizeRoles("ADMIN", "SUPER_ADMIN"), markPaidToMerchant);

module.exports = router;
