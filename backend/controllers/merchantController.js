const bcrypt = require("bcryptjs");
const Merchant = require("../models/Merchant");
const User = require("../models/User");

// Get Merchant Profile
const getProfile = async (req, res) => {
  try {
    // Parallel fetching for better performance
    const [merchant, user] = await Promise.all([
      Merchant.findOne({ userId: req.user.id }),
      User.findById(req.user.id).select("-password"),
    ]);

    // Auto create merchant profile if not exists
    let merchantData = merchant;
    if (!merchantData) {
      merchantData = await Merchant.create({
        userId: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      merchant: merchantData,
      user: user,
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

    // Production validation: Company Name is required
    if (
      companyName !== undefined &&
      !companyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company Name is required.",
      });
    }

    // Find or create merchant with single DB operation
    let merchant = await Merchant.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          companyName: companyName?.trim() ?? undefined,
          gstNumber: gstNumber?.trim() ?? undefined,
          panNumber: panNumber?.trim() ?? undefined,
          bankAccount: bankAccount ?? undefined,
          address: address?.trim() ?? undefined,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Update user fields that are common
    const userUpdateData = {};
    
    if (companyName !== undefined) 
      userUpdateData.companyName = companyName?.trim();
    
    if (gstNumber !== undefined) 
      userUpdateData.gstNumber = gstNumber?.trim();
    
    if (panNumber !== undefined) 
      userUpdateData.panNumber = panNumber?.trim();
    
    if (address !== undefined) 
      userUpdateData.address = address?.trim();

    let user = null;
    if (Object.keys(userUpdateData).length > 0) {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdateData },
        { new: true, runValidators: true }
      ).select("-password");
    } else {
      user = await User.findById(req.user.id).select("-password");
    }

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      merchant: merchant,
      user: user,
    });
  } catch (error) {
    // Handle duplicate key errors (if any field has unique index)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists. Please use a different value.`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    let {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // Trim password inputs to remove extra spaces
    const current = currentPassword?.trim() || "";
    const newPass = newPassword?.trim() || "";
    const confirm = confirmPassword?.trim() || "";

    // Validation - All fields required
    if (!current || !newPass || !confirm) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validation - New password matches confirm password
    if (newPass !== confirm) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    // Validation - Password strength (uppercase, lowercase, number, min 8 chars)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPass)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.",
      });
    }

    // Validation - New password cannot be same as current
    if (current === newPass) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password.",
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      current,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPass, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};