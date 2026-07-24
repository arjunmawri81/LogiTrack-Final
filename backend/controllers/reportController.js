const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const Wallet = require("../models/Wallet");
const Invoice = require("../models/Invoice");
const NDR = require("../models/NDR");
const RTO = require("../models/RTO");

const getDashboardStats = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { filter, startDate, endDate } = req.query;

    let dateQuery = {};
    const now = new Date();

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      dateQuery = { createdAt: { $gte: start } };
    } else if (filter === "yesterday") {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      dateQuery = { createdAt: { $gte: start, $lte: end } };
    } else if (filter === "last7days") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateQuery = { createdAt: { $gte: start } };
    } else if (filter === "last30days") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateQuery = { createdAt: { $gte: start } };
    } else if (filter === "thismonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateQuery = { createdAt: { $gte: start } };
    } else if (filter === "custom" && startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    const mQuery = { merchantId, ...dateQuery };

    // Parallel Database Queries for high performance
    const [
      totalOrders,
      newOrders,
      deliveredOrders,
      totalShipments,
      pickupPending,
      inTransit,
      deliveredShipments,
      cancelledShipments,
      totalNDR,
      totalRTO,
      wallet,
      invoices,
      codOrders,
    ] = await Promise.all([
      Order.countDocuments(mQuery),
      Order.countDocuments({ ...mQuery, status: "NEW" }),
      Order.countDocuments({ ...mQuery, status: "DELIVERED" }),
      Shipment.countDocuments(mQuery),
      Shipment.countDocuments({ ...mQuery, status: "PICKUP_PENDING" }),
      Shipment.countDocuments({ ...mQuery, status: { $in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] } }),
      Shipment.countDocuments({ ...mQuery, status: "DELIVERED" }),
      Shipment.countDocuments({ ...mQuery, status: "CANCELLED" }),
      NDR.countDocuments(mQuery),
      RTO.countDocuments(mQuery),
      Wallet.findOne({ merchantId }),
      Invoice.find(mQuery),
      Order.find({ ...mQuery, paymentMode: "COD" }),
    ]);

    const totalShippingCharges = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.shippingCharge || 0),
      0
    );

    const codTotalAmount = codOrders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
    const codDeliveredAmount = codOrders
      .filter((ord) => ord.status === "DELIVERED")
      .reduce((sum, ord) => sum + (ord.amount || 0), 0);

    // Courier performance breakdown
    const courierStats = await Shipment.aggregate([
      { $match: mQuery },
      {
        $group: {
          _id: "$courier",
          count: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      orders: {
        totalOrders,
        pendingOrders: newOrders,
        deliveredOrders,
      },
      shipments: {
        totalShipments,
        pickupPending,
        inTransit,
        deliveredShipments,
        cancelledShipments,
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
        totalShippingCharges,
        codTotalAmount,
        codDeliveredAmount,
      },
      couriers: courierStats.map((c) => ({
        name: c._id || "Other",
        total: c.count,
        delivered: c.delivered,
        successRate: c.count ? Math.round((c.delivered / c.count) * 100) : 0,
      })),
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