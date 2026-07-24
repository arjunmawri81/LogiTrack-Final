const Remittance = require("../models/Remittance");
const Wallet = require("../models/Wallet");

const getRemittances = async (req, res) => {
  try {
    const query = req.user.role === "MERCHANT" ? { merchantId: req.user.id } : {};
    const remittances = await Remittance.find(query)
      .populate("shipmentId", "awb courier")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, remittances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markReceivedFromCourier = async (req, res) => {
  try {
    const remittance = await Remittance.findById(req.params.id);
    if (!remittance) return res.status(404).json({ success: false, message: "Not found" });
    remittance.status = "RECEIVED_FROM_COURIER";
    remittance.receivedDate = new Date();
    await remittance.save();
    res.status(200).json({ success: true, remittance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markPaidToMerchant = async (req, res) => {
  try {
    const { utrNumber } = req.body;
    const remittance = await Remittance.findById(req.params.id);
    if (!remittance) return res.status(404).json({ success: false, message: "Not found" });
    if (remittance.status !== "RECEIVED_FROM_COURIER") {
      return res.status(400).json({ success: false, message: "Must be received from courier first" });
    }

    remittance.status = "PAID_TO_MERCHANT";
    remittance.paidDate = new Date();
    remittance.utrNumber = utrNumber;
    await remittance.save();

    await Wallet.findOneAndUpdate(
      { merchantId: remittance.merchantId },
      {
        $inc: { balance: remittance.codAmount },
        $push: {
          transactions: {
            amount: remittance.codAmount,
            type: "CREDIT",
            description: `COD Remittance for AWB ${remittance.awb}`,
            createdAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({ success: true, remittance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRemittances, markReceivedFromCourier, markPaidToMerchant };
