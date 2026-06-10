const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getUsers,
  getOrders,
  getShipments,

  createAdmin,
  getAllAdmins,
  deleteAdmin,

  getMerchants,
  approveMerchant,
  blockMerchant,
  deleteMerchant,

  getCommission,
  getRevenue,
} = require("../controllers/adminController");

// ===============================
// DASHBOARD
// ===============================
router.get(
  "/dashboard",
  authMiddleware,
  authorize("ADMIN", "SUPER_ADMIN"),
  getDashboardStats
);

// ===============================
// USERS
// ===============================
router.get(
  "/users",
  authMiddleware,
  authorize("ADMIN", "SUPER_ADMIN"),
  getUsers
);

// ===============================
// ORDERS
// ===============================
router.get(
  "/orders",
  authMiddleware,
  authorize("ADMIN", "SUPER_ADMIN"),
  getOrders
);

// ===============================
// SHIPMENTS
// ===============================
router.get(
  "/shipments",
  authMiddleware,
  authorize("ADMIN", "SUPER_ADMIN"),
  getShipments
);

// ===============================
// ADMIN MANAGEMENT
// ===============================
router.post(
  "/create-admin",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  createAdmin
);

router.get(
  "/all-admins",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  getAllAdmins
);

router.delete(
  "/delete-admin/:id",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  deleteAdmin
);

// ===============================
// MERCHANT MANAGEMENT
// ===============================
router.get(
  "/merchants",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  getMerchants
);

router.put(
  "/merchant/approve/:id",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  approveMerchant
);

router.put(
  "/merchant/block/:id",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  blockMerchant
);

router.delete(
  "/merchant/:id",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  deleteMerchant
);

// ===============================
// COMMISSION
// ===============================
router.get(
  "/commission",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  getCommission
);

// ===============================
// REVENUE
// ===============================
router.get(
  "/revenue",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  getRevenue
);

module.exports = router;