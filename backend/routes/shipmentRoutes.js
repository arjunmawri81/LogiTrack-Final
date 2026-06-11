const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  createShipment,
  getShipments,
} = require("../controllers/shipmentController");

router.post(
  "/",
  authMiddleware,
  createShipment
);

router.get(
  "/",
  authMiddleware,
  getShipments
);

module.exports = router;