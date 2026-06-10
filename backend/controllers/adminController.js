
const User = require("../models/User");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Invoice = require("../models/Invoice");
const bcrypt = require("bcryptjs");
const Merchant = require("../models/Merchant");

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalShipments = await Shipment.countDocuments();

    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );

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

// Get Users
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

// Get Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

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

// Get Shipments
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find();

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

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
      role: "ADMIN",
    });

    res.status(201).json({
      success: true,
      message: "Admin Created Successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "ADMIN",
    }).select("-password");

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

// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(
      req.params.id
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// MERCHANT MANAGEMENT
// ================================

// Get Merchants
const getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find()
      .populate("userId", "name email");

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

// Approve Merchant
const approveMerchant = async (req, res) => {
  try {
    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Merchant Approved",
      merchant,
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
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Merchant Blocked",
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
    await User.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Merchant Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
 
// ===============================
// COMMISSION
// ===============================
const getCommission = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.amount || 0),
      0
    );

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


// ===============================
// REVENUE
// ===============================
const getRevenue = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({
      createdAt: -1,
    });

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.amount || 0),
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

module.exports = {
  getDashboardStats,
  getUsers,
  getOrders,
  getShipments,

  createAdmin,
  getAllAdmins,
  deleteAdmin,

  getMerchants,
  approveMerchant,
  blockMerchant,
  deleteMerchant,

  getCommission,
  getRevenue,
};