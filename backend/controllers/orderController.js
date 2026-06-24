const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
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
// GET ALL ORDERS (UPDATED WITH POPULATE)
// ================================
const getOrders = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);

    const orders = await Order.find({
      merchantId: req.user.id,
    })
    .populate("shipmentId")  // ✅ Populate shipment details
    .populate("invoiceId")   // ✅ Populate invoice details
    .sort({ createdAt: -1 });

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
const getOrderById = async (req, res) => {
  try {
    let order;

    // Admin & Super Admin can view any order
    if (
      req.user.role === "ADMIN" ||
      req.user.role === "SUPER_ADMIN"
    ) {
      order = await Order.findById(req.params.id)
        .populate("shipmentId")
        .populate("invoiceId");
    }
    // Merchant can view only own orders
    else {
      order = await Order.findOne({
        _id: req.params.id,
        merchantId: req.user.id,
      })
      .populate("shipmentId")
      .populate("invoiceId");
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
    // ✅ CHECK IF SHIPMENT ALREADY EXISTS
    const shipment = await Shipment.findOne({
      orderId: req.params.id,
    });

    if (shipment) {
      return res.status(400).json({
        success: false,
        message: "Shipment already created. Order cannot be edited.",
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        merchantId: req.user.id,
      },
      req.body,
      { new: true }
    )
    .populate("shipmentId")
    .populate("invoiceId");

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
// DELETE ORDER (UPDATED WITH SHIPMENT CHECK)
// ================================
const deleteOrder = async (req, res) => {
  try {
    // ✅ CHECK IF SHIPMENT ALREADY EXISTS
    const shipment = await Shipment.findOne({
      orderId: req.params.id,
    });

    if (shipment) {
      return res.status(400).json({
        success: false,
        message: "Shipment already created. Order cannot be deleted.",
      });
    }

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
    })
    .populate("shipmentId")
    .populate("invoiceId");

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

// ================================
// CANCEL ORDER (UPDATED WITH BETTER STATUS CHECK)
// ================================
const cancelOrder = async (req, res) => {
  try {
    // ✅ Security - Only merchant's own order
    const order = await Order.findOne({
      _id: req.params.id,
      merchantId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ✅ IMPROVED: Better status check - prevents cancellation after pickup
    if (
      order.shipmentId ||
      [
        "READY_FOR_PICKUP",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
      ].includes(order.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled. It already has a shipment or is already in transit/delivered."
      });
    }

    // Check if already cancelled
    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

    // Update order status to CANCELLED
    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================
// BULK CANCEL ORDERS (UPDATED)
// ================================
const bulkCancelOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order IDs provided",
      });
    }

    // ✅ Updated: Better conditions for bulk cancellation
    const result = await Order.updateMany(
      {
        _id: { $in: orderIds },
        merchantId: req.user.id, // ✅ Security: Only merchant's orders
        shipmentId: null, // Only orders without shipment
        status: { 
          $nin: [
            "READY_FOR_PICKUP",
            "SHIPPED", 
            "OUT_FOR_DELIVERY",
            "DELIVERED", 
            "CANCELLED"
          ] // Don't cancel these statuses
        },
      },
      {
        status: "CANCELLED",
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No eligible orders found for cancellation",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} orders cancelled successfully`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  searchOrders,
  uploadCSVOrders,
  uploadExcelOrders,
  cancelOrder,
  bulkCancelOrders,
};