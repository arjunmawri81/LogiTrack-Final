const User = require("../models/User");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Invoice = require("../models/Invoice");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");
const bcrypt = require("bcryptjs");

// ================================
// DASHBOARD STATS
// ================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalMerchants = await User.countDocuments({
      role: "MERCHANT",
    });

    const pendingMerchants = await User.countDocuments({
      role: "MERCHANT",
      isApproved: false,
    });

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: "PENDING",
    });

    const totalShipments = await Shipment.countDocuments();

    const deliveredShipments =
      await Shipment.countDocuments({
        status: "DELIVERED",
      });

    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum + (invoice.shippingCharge || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalUsers,
      totalMerchants,
      pendingMerchants,
      totalOrders,
      pendingOrders,
      totalShipments,
      deliveredShipments,
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

const getMerchantDetails = async (req, res) => {
  try {
    const merchantId = req.params.id;

    const merchant = await User.findById(merchantId)
      .select("-password");

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    const totalOrders =
      await Order.countDocuments({
        merchant: merchantId,
      });

    const totalShipments =
      await Shipment.countDocuments({
        merchantId: merchantId,
      });

    const wallet =
      await Wallet.findOne({
        merchantId: merchantId,
      });

    const rateCards =
      await RateCard.find({
        merchantId: merchantId,
      });

    res.status(200).json({
      success: true,

      merchant: {
        _id: merchant._id,
        companyName: merchant.companyName,
        merchantName: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        gstNumber: merchant.gstNumber,
        panNumber: merchant.panNumber,
        address: merchant.address,
        city: merchant.city,
        state: merchant.state,
        pincode: merchant.pincode,
        kycStatus: merchant.kycStatus,
        status: merchant.isApproved
          ? "Approved"
          : "Pending",
      },

      totalOrders,
      totalShipments,

      walletBalance:
        wallet?.balance || 0,

      rateCards,
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
    const merchant = await User.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    merchant.isBlocked = false;

    await merchant.save();

    return res.status(200).json({
      success: true,
      message: "Merchant Unblocked Successfully",
    });
  } catch (error) {
    return res.status(500).json({
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

// GET SINGLE ORDER (ADMIN)
const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Sync Shipment Status
    await Shipment.updateMany(
      { orderId: order._id },
      { status }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
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

// GET SINGLE SHIPMENT (ADMIN)
const getShipmentByIdAdmin = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("orderId")
      .populate("merchantId");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      shipment,
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
    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum + (invoice.shippingCharge || 0),
      0
    );

    const commissionRate = 10;

    const totalCommission =
      (totalRevenue * commissionRate) / 100;

    const netRevenue =
      totalRevenue - totalCommission;

    res.status(200).json({
      success: true,
      totalRevenue,
      commissionRate,
      totalCommission,
      netRevenue,
      totalInvoices: invoices.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET REVENUE
const getRevenue = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum + (invoice.shippingCharge || 0),
      0
    );

    const totalOrders = await Order.countDocuments();
    const totalShipments = await Shipment.countDocuments();

    res.status(200).json({
      success: true,
      totalRevenue,
      totalOrders,
      totalShipments,
      totalInvoices: invoices.length,
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
// RATE CARD MANAGEMENT
// ================================

// Get all rate cards for a merchant
const getRateCards = async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    const rateCards = await RateCard.find({ merchantId });
    
    res.status(200).json({
      success: true,
      count: rateCards.length,
      rateCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get rate card for a specific courier
const getRateCardByCourier = async (req, res) => {
  try {
    const { merchantId, courier } = req.params;
    
    const rateCard = await RateCard.findOne({ 
      merchantId, 
      courierPartner: courier 
    });
    
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate card not found for this courier",
      });
    }
    
    res.status(200).json({
      success: true,
      rateCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or update rate card
const saveRateCard = async (req, res) => {
  try {
    const {
      merchantId,
      courierPartner,
      forwardRates,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      isActive,
      serviceability,
    } = req.body;

    // Check if rate card exists
    let rateCard = await RateCard.findOne({ 
      merchantId, 
      courierPartner 
    });

    if (rateCard) {
      // Update existing
      rateCard.forwardRates = forwardRates;
      rateCard.zoneRates = zoneRates;
      rateCard.codCharge = codCharge;
      rateCard.rtoCharge = rtoCharge;
      rateCard.reversePickup = reversePickup;
      rateCard.fuelCharge = fuelCharge;
      rateCard.isActive = isActive !== undefined ? isActive : true;
      if (serviceability) {
        rateCard.serviceability = serviceability;
      }
      rateCard.updatedAt = new Date();
    } else {
      // Create new
      rateCard = new RateCard({
        merchantId,
        courierPartner,
        forwardRates,
        zoneRates,
        codCharge,
        rtoCharge,
        reversePickup,
        fuelCharge,
        isActive: isActive !== undefined ? isActive : true,
        serviceability: serviceability || {
          codEnabled: true,
          prepaidEnabled: true,
          rtoEnabled: true,
          reversePickup: true,
        },
      });
    }

    await rateCard.save();

    res.status(200).json({
      success: true,
      message: "Rate card saved successfully",
      rateCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete rate card
const deleteRateCard = async (req, res) => {
  try {
    const { merchantId, courier } = req.params;
    
    const rateCard = await RateCard.findOneAndDelete({ 
      merchantId, 
      courierPartner: courier 
    });
    
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate card not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Rate card deleted successfully",
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
  getMerchantDetails,
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
  getOrderByIdAdmin,
  updateOrderStatus,
  getShipments,
  getShipmentByIdAdmin,
  
  // Commission & Revenue
  getCommission, 
  getRevenue,
  
  // Rate Cards
  getRateCards,
  getRateCardByCourier,
  saveRateCard,
  deleteRateCard,
};