const express = require("express");
const router = express.Router();

const {
authMiddleware,
} = require("../middleware/authMiddleware");

const {
createCOD,
getCODs,
updateCODStatus,
} = require("../controllers/codController");

// Create COD
router.post(
"/",
authMiddleware,
createCOD
);

// Get All COD
router.get(
"/",
authMiddleware,
getCODs
);

// Update Status
router.patch(
"/:id/status",
authMiddleware,
updateCODStatus
);

module.exports = router;
