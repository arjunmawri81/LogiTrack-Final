// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Main Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    
    // Generic error
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Role-based Authorization Middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`,
      });
    }

    next();
  };
};

// Optional: Check if user is approved merchant
const isApprovedMerchant = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.role === "MERCHANT" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const requireActiveUser = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    
    if (!user || user.isBlocked || user.isActive === false || user.isDeleted === true) {
      return res.status(401).json({
        success: false,
        message: "Account inactive or blocked. Please login again.",
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ====================================
// MONGO ID VALIDATION MIDDLEWARE
// ====================================
// Validates that specified req.body or req.params fields are valid MongoDB ObjectIds.
// Returns 400 instead of letting Mongoose throw a CastError (which would produce a 500).
const validateMongoId = (...fields) =>
  (req, res, next) => {
    for (const field of fields) {
      const value = req.body[field] ?? req.params[field];
      if (value !== undefined && value !== null && value !== "") {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for field: ${field}. Expected a valid ID.`,
          });
        }
      }
    }
    next();
  };

// ====================================
// WEBHOOK SIGNATURE VALIDATION MIDDLEWARE
// ====================================
const crypto = require("crypto");

const validateSignature = (req, res, next) => {
  const signature = req.headers["x-courier-signature"];
  const secret = process.env.COURIER_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "Webhook secret is not configured on the server.",
    });
  }

  if (!signature || !req.rawBody) {
    return res.status(401).json({
      success: false,
      message: "Missing signature header or raw body.",
    });
  }

  const hmac = crypto.createHmac("sha256", secret);
  const calculatedSignature = hmac.update(req.rawBody).digest("hex");

  if (signature !== calculatedSignature) {
    return res.status(401).json({
      success: false,
      message: "Invalid signature.",
    });
  }

  next();
};

module.exports = {
  verifyToken: authMiddleware,
  authMiddleware,
  authorizeRoles,
  isApprovedMerchant,
  requireActiveUser,
  validateMongoId,
  validateSignature,
};