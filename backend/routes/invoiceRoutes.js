const express = require("express");
const router = express.Router();

const {
  downloadInvoice,
} = require("../controllers/invoiceController");

router.get(
  "/:id/download",
  downloadInvoice
);

module.exports = router;