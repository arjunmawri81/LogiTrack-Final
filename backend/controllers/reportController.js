const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Wallet = require("../models/Wallet");
const Invoice = require("../models/Invoice");

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({
      merchantId: req.user.id,
    });

    const totalShipments =
      await Shipment.countDocuments({
        merchantId: req.user.id,
      });

    const wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    const invoices = await Invoice.find({
      merchantId: req.user.id,
    });

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );

    res.status(200).json({
      success: true,
      totalOrders,
      totalShipments,
      walletBalance: wallet?.balance || 0,
      totalRevenue,
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
};