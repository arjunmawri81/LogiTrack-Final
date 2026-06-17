const Order = require("../models/Order");
const fs = require("fs");
const csv = require("csv-parser");
const XLSX = require("xlsx");

// ================================
// CREATE ORDER (DEBUG VERSION)
// ================================
const createOrder = async (req, res) => {
  try {
    console.log("BODY =>", req.body);
    console.log("USER =>", req.user);

    const order = await Order.create({
      merchantId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      order,
    });
  } catch (error) {
    console.log("CREATE ORDER ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// ================================
// GET ALL ORDERS (DEBUG VERSION)
// ================================
const getOrders = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);

    const orders = await Order.find({
      merchantId: req.user.id,
    }).sort({ createdAt: -1 });

    console.log("ORDERS FOUND =>", orders.length);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log("ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// ================================
// GET SINGLE ORDER
// ================================
// ================================
// GET SINGLE ORDER
// ================================
const getOrderById = async (req, res) => {
  try {
    let order;

    // Admin & Super Admin can view any order
    if (
      req.user.role === "ADMIN" ||
      req.user.role === "SUPER_ADMIN"
    ) {
      order = await Order.findById(req.params.id);
    }
    // Merchant can view only own orders
    else {
      order = await Order.findOne({
        _id: req.params.id,
        merchantId: req.user.id,
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================================
// UPDATE ORDER
// ================================
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        merchantId: req.user.id,
      },
      req.body,
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
      message: "Order Updated Successfully",
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
// DELETE ORDER
// ================================
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// UPDATE ORDER STATUS
// ================================
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
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
// SEARCH ORDERS
// ================================
const searchOrders = async (req, res) => {
  try {
    const { keyword } = req.query;

    const orders = await Order.find({
      merchantId: req.user.id,
      $or: [
        { customerName: { $regex: keyword || "", $options: "i" } },
        { orderNumber: { $regex: keyword || "", $options: "i" } },
        { customerPhone: { $regex: keyword || "", $options: "i" } },
      ],
    });

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

// ================================
// UPLOAD CSV ORDERS
// ================================
const uploadCSVOrders = async (req, res) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const orders = results.map((row) => ({
          merchantId: req.user.id,
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          customerAddress: row.customerAddress,
          productName: row.productName,
          amount: Number(row.amount),
        }));

        await Order.insertMany(orders);

        res.status(200).json({
          success: true,
          message: "CSV Uploaded Successfully",
          totalOrders: orders.length,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// UPLOAD EXCEL ORDERS
// ================================
const uploadExcelOrders = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const orders = data.map((row) => ({
      merchantId: req.user.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      productName: row.productName,
      amount: Number(row.amount),
    }));

    await Order.insertMany(orders);

    res.status(200).json({
      success: true,
      message: "Excel Uploaded Successfully",
      totalOrders: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  searchOrders,
  uploadCSVOrders,
  uploadExcelOrders,
};