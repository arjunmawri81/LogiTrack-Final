const NDR = require("../models/NDR");

// Create NDR
const createNDR = async (req, res) => {
try {
const ndr = await NDR.create({
...req.body,
merchantId: req.user.id,
});

```
res.status(201).json({
  success: true,
  ndr,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Get All NDR
const getNDRs = async (req, res) => {
try {
const ndrs = await NDR.find({
merchantId: req.user.id,
}).populate("shipmentId");

```
res.status(200).json({
  success: true,
  count: ndrs.length,
  ndrs,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Resolve NDR
const resolveNDR = async (req, res) => {
try {
const ndr = await NDR.findById(
req.params.id
);

```
if (!ndr) {
  return res.status(404).json({
    success: false,
    message: "NDR not found",
  });
}

ndr.status = "RESOLVED";

await ndr.save();

res.status(200).json({
  success: true,
  message: "NDR Resolved",
  ndr,
});
```

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

module.exports = {
createNDR,
getNDRs,
resolveNDR,
};
