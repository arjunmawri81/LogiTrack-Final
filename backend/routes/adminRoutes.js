const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,

  getMerchants,
  getMerchantDetails,
  getPendingMerchants,
  getApprovedMerchants,
  approveMerchant,
  rejectMerchant,
  blockMerchant,
  unblockMerchant,
  deleteMerchant,

  createAdmin,
  getAllAdmins,
  deleteAdmin,

  getOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  getShipments,
  getShipmentByIdAdmin,
  getCommission,
  getRevenue,
  
  // Order Management (Admin)
  updateOrderAdmin,
  assignCourier,
  cancelOrderAdmin,
} = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getDashboardStats
);

// Users
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getUserById
);

router.put(
  "/users/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateUserStatus
);

router.delete(
  "/users/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteUser
);

// Merchants
router.get(
  "/merchants",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getMerchants
);

router.get(
  "/merchant/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getMerchantDetails
);

router.get(
  "/merchants/pending",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getPendingMerchants
);

router.get(
  "/merchants/approved",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getApprovedMerchants
);

router.put(
  "/merchants/:id/approve",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  approveMerchant
);

router.put(
  "/merchants/:id/reject",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  rejectMerchant
);

router.put(
  "/merchants/:id/block",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  blockMerchant
);

router.put(
  "/merchants/:id/unblock",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  unblockMerchant
);

router.delete(
  "/merchants/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteMerchant
);

// Admin Management
router.post(
  "/admins",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  createAdmin
);

router.get(
  "/admins",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getAllAdmins
);

router.delete(
  "/admins/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteAdmin
);

// Orders
router.get(
  "/orders",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrders
);

router.get(
  "/orders/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrderByIdAdmin
);

router.patch(
  "/orders/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateOrderStatus
);

// ================================
// ORDER MANAGEMENT ROUTES (ADMIN)
// ================================

// Edit Order (Full Update)
router.put(
  "/orders/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateOrderAdmin
);

// Assign Courier
router.patch(
  "/orders/:id/courier",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  assignCourier
);

// Cancel Order
router.patch(
  "/orders/:id/cancel",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  cancelOrderAdmin
);

// Shipments
router.get(
  "/shipments",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getShipments
);

router.get(
  "/shipments/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getShipmentByIdAdmin
);

// Revenue & Commission
router.get(
  "/commission",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getCommission
);

router.get(
  "/revenue",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getRevenue
);

module.exports = router;