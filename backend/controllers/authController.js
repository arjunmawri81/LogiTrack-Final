const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User - Complete Version
const registerUser = async (req, res) => {
  try {
    const {
      companyName,
      name,
      phone,
      email,
      password,
      gstNumber,
      panNumber,
      businessType,
      businessCategory,
      yearOfEstablishment,
      website,
      address,
      city,
      state,
      pincode,
      landmark,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiId,
      role,
      kycStatus
    } = req.body;

    // Validation - Required Fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Phone validation
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number"
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this phone number"
        });
      }
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role Management
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MERCHANT", "COURIER", "WAREHOUSE"];
    const userRole = allowedRoles.includes(role) ? role : "MERCHANT";

    // Company name validation for merchants
    if (userRole === "MERCHANT" && !companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required for merchant registration"
      });
    }

    // KYC Status Management
    const userKycStatus = ["PENDING", "APPROVED", "REJECTED"].includes(kycStatus) 
      ? kycStatus 
      : "PENDING";

    // Create User
    const user = await User.create({
      name: name.trim(),
      companyName: companyName || "",
      phone: phone || "",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gstNumber: gstNumber || "",
      panNumber: panNumber || "",
      businessType: businessType || "",
      businessCategory: businessCategory || "",
      yearOfEstablishment: yearOfEstablishment || "",
      website: website || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      landmark: landmark || "",
      accountHolderName: accountHolderName || "",
      accountNumber: accountNumber || "",
      ifscCode: ifscCode || "",
      bankName: bankName || "",
      branchName: branchName || "",
      upiId: upiId || "",
      role: userRole,
      kycStatus: userKycStatus,
      isApproved: true,
      isBlocked: false,
      isActive: true,
      walletBalance: 0,
    });

    // Response
    const userResponse = {
      id: user._id,
      name: user.name,
      companyName: user.companyName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      gstNumber: user.gstNumber,
      kycStatus: user.kycStatus,
      isApproved: user.isApproved,
      isActive: user.isActive
    };

    res.status(201).json({
      success: true,
      message: userRole === "MERCHANT" 
        ? "Registration successful! Your account is approved." 
        : `${userRole} Registered Successfully`,
      user: userResponse
    });

  } catch (error) {
    console.error("Registration Error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact admin.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userData = {
      id: user._id,
      name: user.name,
      companyName: user.companyName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      gstNumber: user.gstNumber,
      kycStatus: user.kycStatus,
      isApproved: user.isApproved,
      isActive: user.isActive,
      walletBalance: user.walletBalance
    };

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Get Current User Profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Merchants (For Admin)
const getAllMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ 
      role: "MERCHANT" 
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: merchants.length,
      merchants
    });
  } catch (error) {
    console.error("Get Merchants Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve Merchant (For Admin)
const approveMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, kycStatus } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "MERCHANT") {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant"
      });
    }

    user.isApproved = isApproved !== undefined ? isApproved : true;
    if (kycStatus) {
      user.kycStatus = kycStatus;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Merchant ${user.isApproved ? "approved" : "rejected"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error("Approve Merchant Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllMerchants,
  approveMerchant,
};