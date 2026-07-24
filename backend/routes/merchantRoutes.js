const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadKYCDocument,
} = require("../controllers/merchantController");
const kycUpload = require("../middleware/kycUploadMiddleware");

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

// Change Password Route
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// KYC Upload Route
router.post(
  "/kyc-upload",
  authMiddleware,
  kycUpload.single("document"),
  uploadKYCDocument
);

module.exports = router;