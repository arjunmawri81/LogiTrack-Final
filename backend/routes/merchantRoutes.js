const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/merchantController");

// Get Profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update Profile
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;