const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder automatically
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ===============================
// STORAGE
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ===============================
// FILE FILTER
// ===============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ".csv",
    ".xlsx",
    ".xls",
  ];

  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only CSV and Excel files are allowed"
      ),
      false
    );
  }
};

// ===============================
// MULTER CONFIG
// ===============================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;