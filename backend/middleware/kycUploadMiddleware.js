const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/kyc directory exists
const kycDir = path.join(__dirname, "../uploads/kyc");
if (!fs.existsSync(kycDir)) {
  fs.mkdirSync(kycDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, kycDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let prefix = "doc";
    if (file.fieldname === "gstCertificate") prefix = "gst";
    else if (file.fieldname === "panCard") prefix = "pan";
    else if (file.fieldname === "aadhaarFront") prefix = "aadhaar_front";
    else if (file.fieldname === "aadhaarBack") prefix = "aadhaar_back";

    const uniqueName = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// File Filter for KYC Documents (PDF, JPG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
  const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed for KYC documents."), false);
  }
};

const kycUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

module.exports = kycUpload;
