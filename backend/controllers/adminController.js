const User = require("../models/User");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Invoice = require("../models/Invoice");
const bcrypt = require("bcryptjs");

// ================================
// DASHBOARD STATS
// ================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalShipments = await Shipment.countDocuments();
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    res.status(200).json({
      success: true,
      totalUsers,
      totalOrders,
      totalShipments,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// USER MANAGEMENT
// ================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single User
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update User Status (Block/Unblock)
const updateUserStatus = async (req, res) => {
  try {
    const { isBlocked, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked, isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// MERCHANT MANAGEMENT (Using User Model)
// ================================
const getMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ role: "MERCHANT" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: merchants.length,
      merchants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Pending Merchants
const getPendingMerchants = async (req, res) => {
  try {
    const pendingMerchants = await User.find({ 
      role: "MERCHANT", 
      isApproved: false 
    }).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingMerchants.length,
      merchants: pendingMerchants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Approved Merchants
const getApprovedMerchants = async (req, res) => {
  try {
    const approvedMerchants = await User.find({ 
      role: "MERCHANT", 
      isApproved: true 
    }).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: approvedMerchants.length,
      merchants: approvedMerchants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Merchant
const approveMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycStatus } = req.body;

    const merchant = await User.findById(id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    if (merchant.role !== "MERCHANT") {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant",
      });
    }

    merchant.isApproved = true;
    if (kycStatus) {
      merchant.kycStatus = kycStatus;
    }
    await merchant.save();

    res.status(200).json({
      success: true,
      message: "Merchant approved successfully",
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        companyName: merchant.companyName,
        isApproved: merchant.isApproved,
        kycStatus: merchant.kycStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Merchant
const rejectMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await User.findById(id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    if (merchant.role !== "MERCHANT") {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant",
      });
    }

    merchant.isApproved = false;
    merchant.kycStatus = "REJECTED";
    await merchant.save();

    res.status(200).json({
      success: true,
      message: "Merchant rejected successfully",
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        isApproved: merchant.isApproved,
        kycStatus: merchant.kycStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Block Merchant
const blockMerchant = async (req, res) => {
  try {
    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Merchant blocked successfully",
      merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unblock Merchant
const unblockMerchant = async (req, res) => {
  try {
    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Merchant unblocked successfully",
      merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Merchant
const deleteMerchant = async (req, res) => {
  try {
    const merchant = await User.findByIdAndDelete(req.params.id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Merchant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// ADMIN MANAGEMENT
// ================================
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "ADMIN" } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role,
      isApproved: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }).select("-password");
    res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// ORDERS & SHIPMENTS
// ================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// COMMISSION & REVENUE
// ================================
const getCommission = async (req, res) => {
  try {
    const totalRevenue = 50000;
    const commissionRate = 10;

    const totalCommission =
      (totalRevenue * commissionRate) / 100;

    res.status(200).json({
      success: true,
      totalRevenue,
      commissionRate,
      totalCommission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRevenue = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

    res.status(200).json({
      success: true,
      totalRevenue,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// EXPORTS
// ================================
module.exports = {
  // Dashboard
  getDashboardStats,
  
  // Users
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  
  // Merchants
  getMerchants,
  getPendingMerchants,
  getApprovedMerchants,
  approveMerchant,
  rejectMerchant,
  blockMerchant,
  unblockMerchant,
  deleteMerchant,
  
  // Admins
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  
  // Orders & Shipments
  getOrders,
  getShipments,
  
  // Commission & Revenue
  getCommission,
  getRevenue,
};