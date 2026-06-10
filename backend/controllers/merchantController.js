const Merchant = require("../models/Merchant");

// Get Merchant Profile
const getProfile = async (req, res) => {
  try {
    let merchant = await Merchant.findOne({
      userId: req.user.id,
    });

    // Auto create merchant profile if not exists
    if (!merchant) {
      merchant = await Merchant.create({
        userId: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Merchant Profile
const updateProfile = async (req, res) => {
  try {
    const {
      companyName,
      gstNumber,
      panNumber,
      bankAccount,
      address,
    } = req.body;

    let merchant = await Merchant.findOne({
      userId: req.user.id,
    });

    if (!merchant) {
      merchant = await Merchant.create({
        userId: req.user.id,
      });
    }

    merchant.companyName = companyName || merchant.companyName;
    merchant.gstNumber = gstNumber || merchant.gstNumber;
    merchant.panNumber = panNumber || merchant.panNumber;
    merchant.bankAccount = bankAccount || merchant.bankAccount;
    merchant.address = address || merchant.address;

    await merchant.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};