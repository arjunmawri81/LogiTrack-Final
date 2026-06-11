const COD = require("../models/COD");

// Create COD Entry
const createCOD = async (req, res) => {
try {
const cod = await COD.create({
...req.body,
merchantId: req.user.id,
});


res.status(201).json({
  success: true,
  cod,
});


} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Get All COD Entries
const getCODs = async (req, res) => {
try {
const cods = await COD.find({
merchantId: req.user.id,
})
.populate("orderId")
.populate("shipmentId");


res.status(200).json({
  success: true,
  count: cods.length,
  cods,
});


} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Update COD Status
const updateCODStatus = async (
req,
res
) => {
try {
const { status } = req.body;


const cod = await COD.findById(
  req.params.id
);

if (!cod) {
  return res.status(404).json({
    success: false,
    message: "COD entry not found",
  });
}

cod.status = status;

if (status === "SETTLED") {
  cod.settlementDate =
    new Date();
}

await cod.save();

res.status(200).json({
  success: true,
  cod,
});


} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

module.exports = {
createCOD,
getCODs,
updateCODStatus,
};
