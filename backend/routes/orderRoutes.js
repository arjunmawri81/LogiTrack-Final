const express = require("express");
const router = express.Router();

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  searchOrders,
  uploadCSVOrders,
  uploadExcelOrders,
  cancelOrder,
  bulkCancelOrders,
} = require("../controllers/orderController");

// =====================================
// CREATE ORDER
// =====================================
router.post(
  "/",
  authMiddleware,
  createOrder
);

// =====================================
// GET ALL ORDERS
// =====================================
router.get(
  "/",
  authMiddleware,
  getOrders
);

// =====================================
// SEARCH ORDERS
// =====================================
router.get(
  "/search",
  authMiddleware,
  searchOrders
);

// =====================================
// BULK CSV UPLOAD
// =====================================
router.post(
  "/upload-csv",
  authMiddleware,
  upload.single("file"),
  uploadCSVOrders
);

// =====================================
// BULK EXCEL UPLOAD
// =====================================
router.post(
  "/upload-excel",
  authMiddleware,
  upload.single("file"),
  uploadExcelOrders
);

// =====================================
// BULK CANCEL ORDERS
// =====================================
router.post(
  "/bulk-cancel",
  authMiddleware,
  bulkCancelOrders
);

// =====================================
// GET SINGLE ORDER
// =====================================
router.get(
  "/:id",
  authMiddleware,
  getOrderById
);

// =====================================
// UPDATE ORDER
// =====================================
router.put(
  "/:id",
  authMiddleware,
  updateOrder
);

// =====================================
// DELETE ORDER
// =====================================
router.delete(
  "/:id",
  authMiddleware,
  deleteOrder
);

// =====================================
// UPDATE ORDER STATUS
// =====================================
router.patch(
  "/:id/status",
  authMiddleware,
  updateOrderStatus
);

// =====================================
// CANCEL SINGLE ORDER
// =====================================
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelOrder
);

module.exports = router;