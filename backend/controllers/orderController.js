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

    // Auto-generate order number if not provided
    //  Map frontend field names to model field names
    const customerCity = req.body.customerCity || req.body.city;
    const customerState = req.body.customerState || req.body.state;
    const customerPincode = req.body.customerPincode || req.body.pincode;
    const serviceType = req.body.serviceType || req.body.shippingMode || "Surface";

    // Validate required address fields
    if (!customerCity || !customerState || !customerPincode) {
      const missing = [];
      if (!customerCity) missing.push("City");
      if (!customerState) missing.push("State");
      if (!customerPincode) missing.push("Pincode");
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Validate package dimensions (length, breadth, height) and weight
    const length = Number(req.body.length || (req.body.dimensions && req.body.dimensions.length));
    const breadth = Number(req.body.breadth || (req.body.dimensions && req.body.dimensions.breadth));
    const height = Number(req.body.height || (req.body.dimensions && req.body.dimensions.height));
    const weight = Number(req.body.weight);

    if (!length || length <= 0 || !breadth || breadth <= 0 || !height || height <= 0) {
      const missing = [];
      if (!length || length <= 0) missing.push("Length");
      if (!breadth || breadth <= 0) missing.push("Breadth");
      if (!height || height <= 0) missing.push("Height");
      return res.status(400).json({
        success: false,
        message: `Missing or invalid required dimensions: ${missing.join(", ")}. Dimensions (length, breadth, height) are compulsory and must be > 0.`,
      });
    }

    if (!weight || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Weight is compulsory and must be greater than 0.",
      });
    }

    const orderData = {
      ...req.body,
      merchantId: req.user.id,
      orderNumber: req.body.orderNumber || generateOrderNumber(),
      customerCity,
      customerState,
      customerPincode,
      serviceType,
      length,
      breadth,
      height,
      weight,
      dimensions: { length, breadth, height },
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ================================
// GET ALL ORDERS (UPDATED WITH POPULATE)
// ================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      merchantId: req.user.id,
    })
    .populate("shipmentId")
    .populate("invoiceId")
    .sort({ createdAt: -1 });

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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

    // Whitelist only safe-to-edit fields to prevent mass assignment vulnerability
    const allowedUpdates = {
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerEmail: req.body.customerEmail,
      customerAddress: req.body.customerAddress,
      customerCity: req.body.customerCity || req.body.city,
      customerState: req.body.customerState || req.body.state,
      customerPincode: req.body.customerPincode || req.body.pincode,
      productName: req.body.productName,
      sku: req.body.sku,
      quantity: req.body.quantity,
      items: req.body.items,
      dimensions: req.body.dimensions,
      length: req.body.length,
      breadth: req.body.breadth,
      height: req.body.height,
      weight: req.body.weight,
      serviceType: req.body.serviceType || req.body.shippingMode,
      paymentMode: req.body.paymentMode,
      amount: req.body.amount,
      insuranceEnabled: req.body.insuranceEnabled,
      insuranceAmount: req.body.insuranceAmount,
      notes: req.body.notes
    };

    // Remove undefined properties
    Object.keys(allowedUpdates).forEach(
      key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        merchantId: req.user.id,
      },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
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
      .on("error", (err) => {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        if (!res.headersSent) {
          return res.status(400).json({
            success: false,
            message: "Failed to read CSV file",
            error: err.message,
          });
        }
      })
      .pipe(csv())
      .on("error", (err) => {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        if (!res.headersSent) {
          return res.status(400).json({
            success: false,
            message: "Failed to parse CSV",
            error: err.message,
          });
        }
      })
      .on("data", (data) => {
              // Validate required fields
        if (!data.customerName || !data.customerPhone || !data.customerAddress) {
          errors.push({
            row: results.length + 1,
            message: "Missing required fields: customerName, customerPhone, customerAddress",
          });
          return;
        }

        // Validate required address fields (mapped from CSV columns)
        const city = data.customerCity || data.city;
        const state = data.customerState || data.state;
        const pincode = data.customerPincode || data.pincode;
        if (!city || !state || !pincode) {
          const missing = [];
          if (!city) missing.push("city");
          if (!state) missing.push("state");
          if (!pincode) missing.push("pincode");
          errors.push({
            row: results.length + 1,
            message: `Missing required address fields: ${missing.join(", ")}`,
          });
          return;
        }

        // Validate package dimensions (length, breadth, height) and weight
        const len = Number(data.length);
        const brd = Number(data.breadth);
        const hgt = Number(data.height);
        const wgt = Number(data.weight);

        if (!len || len <= 0 || !brd || brd <= 0 || !hgt || hgt <= 0) {
          const missing = [];
          if (!len || len <= 0) missing.push("length");
          if (!brd || brd <= 0) missing.push("breadth");
          if (!hgt || hgt <= 0) missing.push("height");
          errors.push({
            row: results.length + 1,
            message: `Missing or invalid dimensions: ${missing.join(", ")} (must be > 0)`,
          });
          return;
        }

        if (!wgt || wgt <= 0) {
          errors.push({
            row: results.length + 1,
            message: "Missing or invalid weight (must be > 0)",
          });
          return;
        }

        results.push(data);
      })
      .on("end", async () => {
        // Delete the temporary file
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

                const orders = results.map((row) => ({
          merchantId: req.user.id,
          orderNumber: generateOrderNumber(),

          // Customer Details
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          customerAddress: row.customerAddress,
          customerEmail: row.customerEmail || "",
          customerCity: row.customerCity || row.city || "",
          customerState: row.customerState || row.state || "",
          customerPincode: row.customerPincode || row.pincode || "",

          // Product Details
          productName: row.productName || "",
          quantity: Number(row.quantity) || 1,
          weight: Number(row.weight) || 0,
          sku: row.sku || row.SKU || "",

          // Order Details
          amount: Number(row.amount) || 0,
          paymentMode: row.paymentMode || "COD",
          insuranceEnabled:
            row.insuranceEnabled === "true" || row.insurance === "true" || false,
          serviceType: row.serviceType || row.shippingMode || "Surface",

          // Notes
          notes: row.notes || "",

          // Status
          status: "NEW",
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
    // Clean up file if exists
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

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data found in Excel file",
      });
    }

    // Validate and map all fields
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

      // Validate required address fields
      const city = row.customerCity || row.city;
      const state = row.customerState || row.state;
      const pincode = row.customerPincode || row.pincode;
      if (!city || !state || !pincode) {
        const missing = [];
        if (!city) missing.push("city");
        if (!state) missing.push("state");
        if (!pincode) missing.push("pincode");
        errors.push({
          row: index + 1,
          message: `Missing required address fields: ${missing.join(", ")}`,
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

        const orders = validData.map((row) => ({
      merchantId: req.user.id,
      orderNumber: generateOrderNumber(),

      // Customer Details
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      customerEmail: row.customerEmail || "",
      customerCity: row.customerCity || row.city || "",
      customerState: row.customerState || row.state || "",
      customerPincode: row.customerPincode || row.pincode || "",

      // Product Details
      productName: row.productName || "",
      quantity: Number(row.quantity) || 1,
      weight: Number(row.weight) || 0,
      sku: row.sku || row.SKU || "",

      // Order Details
      amount: Number(row.amount) || 0,
      paymentMode: row.paymentMode || "COD",
      insuranceEnabled:
        row.insuranceEnabled === "true" || row.insurance === "true" || false,

      // Notes
      notes: row.notes || "",

      // Status
      status: "NEW",
    }));

    const insertedOrders = await Order.insertMany(orders);

    res.status(200).json({
      success: true,
      message: "Excel Uploaded Successfully",
      totalOrders: insertedOrders.length,
      orders: insertedOrders,
    });
  } catch (error) {
    // Clean up file if exists
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