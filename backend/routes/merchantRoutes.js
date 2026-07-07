const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword, 
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

// ✅ Change Password Route
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;