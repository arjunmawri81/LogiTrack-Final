const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const fs = require("fs");
const csv = require("csv-parser");
const XLSX = require("xlsx");

// ================================
// HELPER FUNCTION
// ================================
const generateOrderNumber = () => {
  return `ORD${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;
};

// ================================
// CREATE ORDER (DEBUG VERSION)
// ================================
const createOrder = async (req, res) => {
  try {
    console.log("BODY =>", req.body);
    console.log("USER =>", req.user);

    // ✅ Auto-generate order number if not provided
    const orderData = {
      merchantId: req.user.id,
      orderNumber: req.body.orderNumber || generateOrderNumber(),
      ...req.body,
    };

    const order = await Order.create(orderData);

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
    .populate("shipmentId")
    .populate("invoiceId")
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

    if (
      req.user.role === "ADMIN" ||
      req.user.role === "SUPER_ADMIN"
    ) {
      order = await Order.findById(req.params.id)
        .populate("shipmentId")
        .populate("invoiceId");
    } else {
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
// UPLOAD CSV ORDERS (FIXED)
// ================================
const uploadCSVOrders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        // ✅ Validate required fields
        if (!data.customerName || !data.customerPhone || !data.customerAddress) {
          errors.push({
            row: results.length + 1,
            message: "Missing required fields: customerName, customerPhone, customerAddress",
          });
          return;
        }

        results.push(data);
      })
      .on("end", async () => {
        // ✅ Delete the temporary file
        fs.unlinkSync(req.file.path);

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: "CSV validation failed",
            errors,
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid data found in CSV",
          });
        }

        // ✅ Map all fields including additional ones
        const orders = results.map((row, index) => ({
          merchantId: req.user.id,
          orderNumber: generateOrderNumber(),
          
          // Customer Details
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          customerAddress: row.customerAddress,
          customerEmail: row.customerEmail || "",
          city: row.city || "",
          state: row.state || "",
          pincode: row.pincode || "",
          
          // Product Details
          productName: row.productName || "",
          productDescription: row.productDescription || "",
          quantity: Number(row.quantity) || 1,
          weight: Number(row.weight) || 0,
          SKU: row.SKU || "",
          
          // Order Details
          amount: Number(row.amount) || 0,
          paymentMode: row.paymentMode || "COD",
          paymentStatus: row.paymentStatus || "PENDING",
          
          // Additional Fields
          notes: row.notes || "",
          insurance: row.insurance === "true" || false,
          isGift: row.isGift === "true" || false,
          giftMessage: row.giftMessage || "",
          
          // Status
          status: "PENDING",
        }));

        const insertedOrders = await Order.insertMany(orders);

        res.status(200).json({
          success: true,
          message: "CSV Uploaded Successfully",
          totalOrders: insertedOrders.length,
          orders: insertedOrders,
        });
      });
  } catch (error) {
    // ✅ Clean up file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log("Error deleting file:", err);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// UPLOAD EXCEL ORDERS (FIXED)
// ================================
const uploadExcelOrders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Excel file uploaded",
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // ✅ Delete the temporary file
    fs.unlinkSync(req.file.path);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data found in Excel file",
      });
    }

    // ✅ Validate and map all fields
    const errors = [];
    const validData = [];

    data.forEach((row, index) => {
      if (!row.customerName || !row.customerPhone || !row.customerAddress) {
        errors.push({
          row: index + 1,
          message: "Missing required fields: customerName, customerPhone, customerAddress",
        });
        return;
      }
      validData.push(row);
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Excel validation failed",
        errors,
      });
    }

    const orders = validData.map((row, index) => ({
      merchantId: req.user.id,
      orderNumber: generateOrderNumber(),
      
      // Customer Details
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      customerEmail: row.customerEmail || "",
      city: row.city || "",
      state: row.state || "",
      pincode: row.pincode || "",
      
      // Product Details
      productName: row.productName || "",
      productDescription: row.productDescription || "",
      quantity: Number(row.quantity) || 1,
      weight: Number(row.weight) || 0,
      SKU: row.SKU || "",
      
      // Order Details
      amount: Number(row.amount) || 0,
      paymentMode: row.paymentMode || "COD",
      paymentStatus: row.paymentStatus || "PENDING",
      
      // Additional Fields
      notes: row.notes || "",
      insurance: row.insurance === "true" || false,
      isGift: row.isGift === "true" || false,
      giftMessage: row.giftMessage || "",
      
      // Status
      status: "PENDING",
    }));

    const insertedOrders = await Order.insertMany(orders);

    res.status(200).json({
      success: true,
      message: "Excel Uploaded Successfully",
      totalOrders: insertedOrders.length,
      orders: insertedOrders,
    });
  } catch (error) {
    // ✅ Clean up file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log("Error deleting file:", err);
      }
    }
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

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

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

    const result = await Order.updateMany(
      {
        _id: { $in: orderIds },
        merchantId: req.user.id,
        shipmentId: null,
        status: { 
          $nin: [
            "READY_FOR_PICKUP",
            "SHIPPED", 
            "OUT_FOR_DELIVERY",
            "DELIVERED", 
            "CANCELLED"
          ]
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