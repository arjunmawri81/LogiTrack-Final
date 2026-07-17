const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const walletRoutes = require("./routes/walletRoutes");
const billingRoutes = require("./routes/billingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const courierRoutes = require("./routes/courierRoutes");
const codRoutes = require("./routes/codRoutes");
const ndrRoutes = require("./routes/ndrRoutes");
const rtoRoutes = require("./routes/rtoRoutes");
const rateCardRoutes = require("./routes/rateCardRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes"); 

dotenv.config();
connectDB().then(() => {
  // Run startup database status migration
  const runMigrations = async () => {
    try {
      const Order = require("./models/Order");
      const Shipment = require("./models/Shipment");
      
      const orderRes = await Order.updateMany({ status: "PENDING" }, { status: "NEW" });
      if (orderRes.modifiedCount > 0) {
        console.log(`[Migration] Migrated ${orderRes.modifiedCount} orders from PENDING to NEW`);
      }

      const shipmentRes = await Shipment.updateMany({ status: "PENDING" }, { status: "PICKUP_PENDING" });
      if (shipmentRes.modifiedCount > 0) {
        console.log(`[Migration] Migrated ${shipmentRes.modifiedCount} shipments from PENDING to PICKUP_PENDING`);
      }
    } catch (error) {
      console.error("[Migration] Error running startup status migrations:", error);
    }
  };
  runMigrations();
});

const app = express();

// ====================================
// CORS
// ====================================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ====================================
// MIDDLEWARE
// ====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================================
// HEALTH CHECK
// ====================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LogiTrack Backend Running ",
  });
});

// ====================================
// API ROUTES
// ====================================
app.use("/api/auth", authRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/cod", codRoutes);
app.use("/api/ndr", ndrRoutes);
app.use("/api/rto", rtoRoutes);
app.use("/api/ratecards", rateCardRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/warehouses", warehouseRoutes); 

// ====================================
// 404 HANDLER
// ====================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ====================================
// GLOBAL ERROR HANDLER
// ====================================
app.use((err, req, res, next) => {
  console.error("ERROR =>", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ====================================
// SERVER
// ====================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server Running On Port ${PORT}`);
});

module.exports = app;