const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Wallet = require("../models/Wallet");
const Invoice = require("../models/Invoice");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");

const getDashboardStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // Orders
    const totalOrders = await Order.countDocuments({
      merchantId,
    });

    const pendingOrders = await Order.countDocuments({
      merchantId,
      status: "NEW",
    });

    const deliveredOrders = await Order.countDocuments({
      merchantId,
      status: "DELIVERED",
    });

    // Shipments
    const totalShipments = await Shipment.countDocuments({
      merchantId,
    });

    const deliveredShipments = await Shipment.countDocuments({
      merchantId,
      status: "DELIVERED",
    });

    // NDR
    const totalNDR = await NDR.countDocuments({
      merchantId,
    });

    // RTO
    const totalRTO = await RTO.countDocuments({
      merchantId,
    });

    // Wallet
    const wallet = await Wallet.findOne({
      merchantId,
    });

    // Revenue
    const invoices = await Invoice.find({
      merchantId,
    });

    // Replaced amount with totalAmount
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );

    // COD Revenue
    const codOrders = await Order.find({
      merchantId,
      paymentMode: "COD",
    });

    const codRevenue = codOrders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      orders: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
      },
      shipments: {
        totalShipments,
        deliveredShipments,
      },
      ndr: {
        totalNDR,
      },
      rto: {
        totalRTO,
      },
      wallet: {
        balance: wallet?.balance || 0,
      },
      revenue: {
        totalRevenue,
        codRevenue,
      },
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