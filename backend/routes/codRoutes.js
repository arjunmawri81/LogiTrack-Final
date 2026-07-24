const express = require("express");
const router = express.Router();

const {
authMiddleware,
authorizeRoles,
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
authorizeRoles("MERCHANT"),
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
authorizeRoles("ADMIN", "SUPER_ADMIN"),
updateCODStatus
);

module.exports = router;
