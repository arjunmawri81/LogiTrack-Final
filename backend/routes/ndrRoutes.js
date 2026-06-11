const express = require("express");
const router = express.Router();

const {
authMiddleware,
} = require("../middleware/authMiddleware");

const {
createNDR,
getNDRs,
resolveNDR,
} = require("../controllers/ndrController");

router.post(
"/",
authMiddleware,
createNDR
);

router.get(
"/",
authMiddleware,
getNDRs
);

router.patch(
"/:id/resolve",
authMiddleware,
resolveNDR
);

module.exports = router;
