const express = require("express");
const router = express.Router();

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  createRTO,
  getRTOs,
  updateRTOStatus,
} = require("../controllers/rtoController");

router.post(
  "/",
  authMiddleware,
  createRTO
);

router.get(
  "/",
  authMiddleware,
  getRTOs
);

router.patch(
  "/:id/status",
  authMiddleware,
  updateRTOStatus
);

module.exports = router;