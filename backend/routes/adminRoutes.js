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

  // CHANGE PASSWORD (ADMIN)
  changePassword,

  getOrders,
  getOrderByIdAdmin,
  cancelOrderAdmin,
  getShipments,
  getShipmentByIdAdmin,
  getCommission,
  getRevenue,
  
  // NDR Management (Admin)
  getAdminNDR,
  approveReattempt,
  approveRTO,
  rejectNDRRequest,

  // RTO Management (Admin)
  getAdminRTO,

  // API Monitoring & Audit Logs
  getApiMonitoring,
  pingApiEndpoint,
  getAuditLogs,
  createAuditLog,
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
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
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
// SETTINGS - CHANGE PASSWORD
// ================================
router.put(
  "/change-password",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  changePassword
);

// ================================
// ORDERS (RESTRICTED - ONLY GET & CANCEL)
// ================================

// Get All Orders
router.get(
  "/orders",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrders
);

// Get Order by ID
router.get(
  "/orders/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getOrderByIdAdmin
);

// Cancel Order Only
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
// REVENUE & COMMISSION (SUPER_ADMIN ONLY)
// ================================
router.get(
  "/commission",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getCommission
);

router.get(
  "/revenue",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
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
// RTO MANAGEMENT (ADMIN)
// ================================

// Get All RTO Records
router.get(
  "/rto",
  authMiddleware,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAdminRTO
);

// ================================
// API MONITORING & HEALTH CHECKS (SUPER_ADMIN ONLY)
// ================================
router.get(
  "/api-monitoring",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getApiMonitoring
);

router.post(
  "/api-monitoring/ping",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  pingApiEndpoint
);

// ================================
// AUDIT LOGS (SUPER_ADMIN ONLY)
// ================================
router.get(
  "/audit-logs",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getAuditLogs
);

router.post(
  "/audit-logs",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  createAuditLog
);

module.exports = router;