const express = require("express");
const router = express.Router();

const {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  setDefaultWarehouse,
} = require("../controllers/warehouseController");

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ===============================
// Merchant Warehouse Routes
// ===============================

// Create Warehouse
router.post(
  "/",
  verifyToken,
  authorizeRoles("MERCHANT"),
  createWarehouse
);

// Get All Warehouses
router.get(
  "/",
  verifyToken,
  authorizeRoles("MERCHANT"),
  getWarehouses
);

// Get Warehouse By Id
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("MERCHANT"),
  getWarehouseById
);

// Update Warehouse
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("MERCHANT"),
  updateWarehouse
);

// Delete Warehouse
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("MERCHANT"),
  deleteWarehouse
);

// Set Default Warehouse
router.patch(
  "/:id/default",
  verifyToken,
  authorizeRoles("MERCHANT"),
  setDefaultWarehouse
);

module.exports = router;