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

  // Bulk Operations
  bulkUpdateStatus,
  bulkAssignCourier,

  // ✅ NDR Management (Admin)
  getAdminNDR,
  approveReattempt,
  approveRTO,
  rejectNDRRequest,

  // ✅ RTO Management (Admin) - ADDED
  getAdminRTO,

} = require("../controllers/adminController");

// ================================
// DASHBOARD
// ================================
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getDashboardStats
);

// ================================
// USERS
// ================================
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

// ================================
// MERCHANTS
// ================================
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

// ================================
// ADMIN MANAGEMENT
// ================================
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

// ================================
// ORDERS
// ================================
router.get(
  "/orders",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrders
);

// ================================
// BULK OPERATIONS ROUTES (BEFORE ID ROUTES)
// ================================

// Bulk Status Update
router.patch(
  "/orders/bulk-status",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  bulkUpdateStatus
);

// Bulk Courier Assign
router.patch(
  "/orders/bulk-courier",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  bulkAssignCourier
);

// ================================
// ORDER MANAGEMENT ROUTES (WITH ID)
// ================================

// Get Order by ID
router.get(
  "/orders/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrderByIdAdmin
);

// Update Order Status
router.patch(
  "/orders/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateOrderStatus
);

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

// ================================
// SHIPMENTS
// ================================
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

// ================================
// REVENUE & COMMISSION
// ================================
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

// ================================
// NDR MANAGEMENT (ADMIN)
// ================================

// Get All NDR Records
router.get(
  "/ndr",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAdminNDR
);

// Approve Reattempt
router.patch(
  "/ndr/:id/approve-reattempt",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  approveReattempt
);

// Approve RTO
router.patch(
  "/ndr/:id/approve-rto",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  approveRTO
);

// Reject NDR Request (Reattempt or RTO)
router.patch(
  "/ndr/:id/reject",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  rejectNDRRequest
);

// ================================
// RTO MANAGEMENT (ADMIN) - ✅ ADDED
// ================================

// Get All RTO Records
router.get(
  "/rto",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAdminRTO
);

module.exports = router;