// ================================
// IMPORTS
// ================================
const User = require("../models/User");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Invoice = require("../models/Invoice");
const Wallet = require("../models/Wallet");
const RateCard = require("../models/RateCard");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");
const bcrypt = require("bcryptjs");

// ================================
// HELPER FUNCTIONS FOR AUTHORIZATION
// ================================
const isSuperAdmin = (user) => user?.role === "SUPER_ADMIN";
const isAdmin = (user) => user?.role === "ADMIN";
const isMerchant = (user) => user?.role === "MERCHANT";

const canManageUser = (currentUser, targetUser) => {
  // SUPER_ADMIN can manage everyone except themselves
  if (isSuperAdmin(currentUser)) {
    return targetUser._id.toString() !== currentUser._id.toString();
  }
  
  // ADMIN can only manage MERCHANT users
  if (isAdmin(currentUser)) {
    return isMerchant(targetUser);
  }
  
  return false;
};

// ================================
// DASHBOARD STATS
// ================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMerchants = await User.countDocuments({ role: "MERCHANT" });
    const pendingMerchants = await User.countDocuments({
      role: "MERCHANT",
      isApproved: false,
    });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const totalShipments = await Shipment.countDocuments();
    const deliveredShipments = await Shipment.countDocuments({ status: "DELIVERED" });
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
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
// USER MANAGEMENT (FIXED)
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

// ✅ FIXED: updateUserStatus with role protection
const updateUserStatus = async (req, res) => {
  try {
    const { isBlocked, isActive } = req.body;
    
    // 🔒 Check if target user exists
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 SUPER_ADMIN cannot be blocked/unblocked
    if (isSuperAdmin(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "SUPER_ADMIN cannot be blocked or unblocked.",
      });
    }

    // 🔒 ADMIN can only manage MERCHANT users
    if (isAdmin(req.user) && !isMerchant(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this user.",
      });
    }

    // 🔒 SUPER_ADMIN cannot block themselves
    if (
      isSuperAdmin(req.user) && 
      targetUser._id.toString() === req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify your own account.",
      });
    }

    // ✅ Proceed with update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked, isActive },
      { new: true }
    ).select("-password");

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

// ✅ FIXED: deleteUser with role protection
const deleteUser = async (req, res) => {
  try {
    // 🔒 Check if target user exists
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 SUPER_ADMIN cannot be deleted
    if (isSuperAdmin(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "SUPER_ADMIN cannot be deleted.",
      });
    }

    // 🔒 ADMIN can only delete MERCHANT users
    if (isAdmin(req.user) && !isMerchant(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this user.",
      });
    }

    // 🔒 SUPER_ADMIN cannot delete themselves
    if (
      isSuperAdmin(req.user) && 
      targetUser._id.toString() === req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account.",
      });
    }

    // ✅ Proceed with deletion
    const user = await User.findByIdAndDelete(req.params.id);
    
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
// MERCHANT MANAGEMENT (FIXED)
// ================================
const getMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ role: "MERCHANT" })
      .select("-password")
      .sort({ createdAt: -1 });
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

    const merchant = await User.findById(merchantId).select("-password");

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    const totalOrders = await Order.countDocuments({ merchant: merchantId });
    const totalShipments = await Shipment.countDocuments({ merchantId: merchantId });
    const wallet = await Wallet.findOne({ merchantId: merchantId });
    const rateCards = await RateCard.find({ merchantId: merchantId });

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
        status: merchant.isApproved ? "Approved" : "Pending",
      },
      totalOrders,
      totalShipments,
      walletBalance: wallet?.balance || 0,
      rateCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingMerchants = async (req, res) => {
  try {
    const pendingMerchants = await User.find({
      role: "MERCHANT",
      isApproved: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

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

const getApprovedMerchants = async (req, res) => {
  try {
    const approvedMerchants = await User.find({
      role: "MERCHANT",
      isApproved: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

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

    if (!isMerchant(merchant)) {
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

    if (!isMerchant(merchant)) {
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

// ✅ FIXED: blockMerchant with protection
const blockMerchant = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    if (!isMerchant(targetUser)) {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant",
      });
    }

    // 🔒 SUPER_ADMIN cannot block themselves
    if (
      isSuperAdmin(req.user) && 
      targetUser._id.toString() === req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot block your own account.",
      });
    }

    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select("-password");

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

// ✅ FIXED: unblockMerchant with protection
const unblockMerchant = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    if (!isMerchant(targetUser)) {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant",
      });
    }

    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select("-password");

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

// ✅ FIXED: deleteMerchant with protection
const deleteMerchant = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    if (!isMerchant(targetUser)) {
      return res.status(400).json({
        success: false,
        message: "User is not a merchant",
      });
    }

    // 🔒 SUPER_ADMIN cannot delete themselves
    if (
      isSuperAdmin(req.user) && 
      targetUser._id.toString() === req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account.",
      });
    }

    const merchant = await User.findByIdAndDelete(req.params.id);
    
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
// ADMIN MANAGEMENT (FIXED)
// ================================
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "ADMIN" } = req.body;

    // 🔒 Only SUPER_ADMIN can create admins
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only SUPER_ADMIN can create admins.",
      });
    }

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
    const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } })
      .select("-password");
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

// ✅ FIXED: deleteAdmin with protection
const deleteAdmin = async (req, res) => {
  try {
    // 🔒 Only SUPER_ADMIN can delete admins
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only SUPER_ADMIN can delete admins.",
      });
    }

    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // 🔒 Cannot delete SUPER_ADMIN
    if (isSuperAdmin(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "SUPER_ADMIN cannot be deleted.",
      });
    }

    // 🔒 Cannot delete yourself
    if (targetUser._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account.",
      });
    }

    const admin = await User.findByIdAndDelete(req.params.id);
    
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
// CHANGE PASSWORD (ADMIN)
// ================================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const current = currentPassword?.trim() || "";
    const newPass = newPassword?.trim() || "";
    const confirm = confirmPassword?.trim() || "";

    if (!current || !newPass || !confirm) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPass !== confirm) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPass)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
      });
    }

    if (current === newPass) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

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

// ================================
// ORDERS - ONLY GET & CANCEL (UPDATED with merchant population)
// ================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("merchantId", "companyName name")
      .sort({ createdAt: -1 });
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

const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("merchantId", "companyName name email phone");

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

const cancelOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "CANCELLED" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// SHIPMENTS
// ================================
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .populate(
        "orderId",
        "orderNumber customerName customerPhone customerAddress amount paymentMode weight productName shippingCharge"
      )
      .populate("merchantId", "name companyName email phone")
      .sort({ createdAt: -1 });

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
// NDR MANAGEMENT (ADMIN)
// ================================

// GET ALL NDR (ADMIN)
const getAdminNDR = async (req, res) => {
  try {
    const ndrs = await NDR.find()
      .populate("merchantId", "name companyName email phone")
      .populate("orderId", "orderNumber customerName customerPhone")
      .populate("shipmentId", "awb courier status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ndrs.length,
      ndrs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// APPROVE REATTEMPT (ADMIN)
const approveReattempt = async (req, res) => {
  try {
    const ndr = await NDR.findById(req.params.id);

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR record not found",
      });
    }

    if (ndr.status !== "REATTEMPT_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. Current status: ${ndr.status}`,
      });
    }

    ndr.status = "REATTEMPT";
    ndr.actionTaken = "REATTEMPT";

    ndr.adminNote = req.body?.adminNote || "";
    ndr.approvedBy = req.user.id;
    ndr.approvedAt = new Date();

    ndr.deliveryAttempts = (ndr.deliveryAttempts || 0) + 1;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    ndr.nextAttemptDate = nextDate;

    await ndr.save();

    await Shipment.findByIdAndUpdate(
      ndr.shipmentId,
      {
        status: "READY_FOR_REATTEMPT",
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Reattempt approved successfully",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// APPROVE RTO (ADMIN)
// ================================
const approveRTO = async (req, res) => {
  try {
    const ndr = await NDR.findById(req.params.id);

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR record not found",
      });
    }

    if (ndr.status !== "RTO_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. Current status: ${ndr.status}`,
      });
    }

    ndr.status = "RTO";
    ndr.actionTaken = "RTO";
    ndr.adminNote = req.body?.adminNote || "";
    ndr.approvedBy = req.user.id;
    ndr.approvedAt = new Date();
    await ndr.save();

    await Shipment.findByIdAndUpdate(
      ndr.shipmentId,
      {
        status: "RTO_IN_PROGRESS",
        updatedAt: new Date(),
      },
      { new: true }
    );

    const shipment = await Shipment.findById(ndr.shipmentId).populate("orderId");

    const existingRTO = await RTO.findOne({ shipmentId: ndr.shipmentId });

    if (!existingRTO) {
      await RTO.create({
        merchantId: ndr.merchantId,
        shipmentId: ndr.shipmentId,
        orderId: ndr.orderId,
        awb: shipment?.awb || ndr.awb,
        customerName: shipment?.orderId?.customerName || ndr.customerName,
        customerPhone: shipment?.orderId?.customerPhone || ndr.customerPhone,
        customerEmail: shipment?.orderId?.customerEmail || ndr.customerEmail,
        address: shipment?.orderId?.customerAddress || ndr.address,
        pincode: shipment?.orderId?.pincode || ndr.pincode,
        city: shipment?.orderId?.city || ndr.city,
        state: shipment?.orderId?.state || ndr.state,
        courier: shipment?.courier || ndr.courier,
        rtoReason: ndr.reason || ndr.ndrReason || "RTO Approved by Admin",
        rtoSubReason: ndr.subReason || ndr.ndrSubReason || "",
        remarks: ndr.remarks || ndr.adminNote || "RTO created from NDR approval",
        status: "IN_TRANSIT",
        returnAttempts: 0,
        maxAttempts: 3,
        rtoRequestedAt: new Date(),
        rtoApprovedAt: new Date(),
        rtoApprovedBy: req.user.id,
        createdBy: "admin",
        source: "ndr_rto_approval",
      });
    }

    res.status(200).json({
      success: true,
      message: "RTO approved successfully and RTO record created",
      ndr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REJECT NDR REQUEST (ADMIN)
const rejectNDRRequest = async (req, res) => {
  try {
    const ndr = await NDR.findById(req.params.id);

    if (!ndr) {
      return res.status(404).json({
        success: false,
        message: "NDR record not found",
      });
    }

    if (ndr.status !== "REATTEMPT_REQUESTED" && ndr.status !== "RTO_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject. Current status: ${ndr.status}`,
      });
    }

    const previousStatus = ndr.status;

    ndr.status = "PENDING";
    ndr.actionTaken = "NONE";
    ndr.adminNote = req.body?.adminNote || "";
    ndr.rejectReason = req.body?.rejectReason || "";
    ndr.approvedBy = req.user.id;
    ndr.approvedAt = new Date();
    await ndr.save();

    const shipmentStatus = previousStatus === "REATTEMPT_REQUESTED" ? "NDR" : "NDR";

    await Shipment.findByIdAndUpdate(
      ndr.shipmentId,
      {
        status: shipmentStatus,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "NDR request rejected successfully",
      ndr,
      previousStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// ADMIN RTO MANAGEMENT
// ================================
const getAdminRTO = async (req, res) => {
  try {
    const rtos = await RTO.find()
      .populate("merchantId", "name companyName")
      .populate("orderId", "orderNumber customerName customerPhone")
      .populate("shipmentId", "awb courier")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rtos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
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
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );

    const commissionRate = 10;
    const totalCommission = (totalRevenue * commissionRate) / 100;
    const activeMerchants = await User.countDocuments({
      role: "MERCHANT",
      isApproved: true,
    });
    const monthlyCommission = Math.round(totalCommission * 0.30);
    const todayCommission = Math.round(totalCommission * 0.05);
    const netRevenue = totalRevenue - totalCommission;

    const merchants = await User.find({ role: "MERCHANT" });

    const merchantBreakdown = await Promise.all(
      merchants.map(async (merchant) => {
        const orders = await Order.countDocuments({ merchantId: merchant._id });
        const merchantInvoices = await Invoice.find({ merchantId: merchant._id });
        const revenue = merchantInvoices.reduce(
          (sum, inv) => sum + (inv.totalAmount || 0),
          0
        );

        return {
          merchantId: merchant._id,
          merchantName: merchant.name,
          orders,
          revenue,
          commission: Math.round((revenue * commissionRate) / 100),
          status: merchant.isApproved ? "ACTIVE" : "PENDING",
        };
      })
    );

    res.status(200).json({
      success: true,
      totalRevenue,
      commissionRate,
      totalCommission,
      monthlyCommission,
      todayCommission,
      activeMerchants,
      netRevenue,
      totalInvoices: invoices.length,
      merchantBreakdown,
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
    const { range, from, to } = req.query;

    let filter = {};

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    }

    if (range === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      filter.createdAt = { $gte: start };
    }

    if (range === "month") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    }

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const invoices = await Invoice.find(filter).populate("merchantId", "name companyName");

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );

    const totalOrders = await Order.countDocuments();
    const totalShipments = await Shipment.countDocuments();

    const monthlyRevenue = {};

    invoices.forEach((invoice) => {
      const month = new Date(invoice.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (invoice.totalAmount || 0);
    });

    const recentInvoices = await Invoice.find(filter)
      .populate("merchantId", "name companyName")
      .sort({ createdAt: -1 })
      .limit(10);

    const topMerchants = await User.find({ role: "MERCHANT" }).select("name companyName");

    res.status(200).json({
      success: true,
      totalRevenue,
      totalOrders,
      totalShipments,
      totalInvoices: invoices.length,
      monthlyRevenue,
      recentInvoices,
      topMerchants,
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

const getRateCardByCourier = async (req, res) => {
  try {
    const { merchantId, courier } = req.params;

    const rateCard = await RateCard.findOne({
      merchantId,
      courierPartner: courier,
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

    let rateCard = await RateCard.findOne({ merchantId, courierPartner });

    if (rateCard) {
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

const deleteRateCard = async (req, res) => {
  try {
    const { merchantId, courier } = req.params;

    const rateCard = await RateCard.findOneAndDelete({
      merchantId,
      courierPartner: courier,
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
// EXPORTS - REMOVED: updateOrderStatus, updateOrderAdmin, assignCourier, bulkUpdateStatus, bulkAssignCourier
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

  // Change Password (Admin)
  changePassword,

  // Orders - ONLY get and cancel (UPDATED)
  getOrders,
  getOrderByIdAdmin,
  cancelOrderAdmin,

  // Shipments
  getShipments,
  getShipmentByIdAdmin,

  // NDR Management (Admin)
  getAdminNDR,
  approveReattempt,
  approveRTO,
  rejectNDRRequest,

  // Admin RTO Management
  getAdminRTO,

  // Commission & Revenue
  getCommission,
  getRevenue,

  // Rate Cards
  getRateCards,
  getRateCardByCourier,
  saveRateCard,
  deleteRateCard,
};