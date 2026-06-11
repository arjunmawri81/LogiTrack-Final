const Courier = require("../models/Courier");

// ================================
// CREATE COURIER
// ================================
const createCourier = async (req, res) => {
  try {
    const courier = await Courier.create(req.body);

    res.status(201).json({
      success: true,
      message: "Courier Created Successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET ALL COURIERS
// ================================
const getCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: couriers.length,
      couriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// RATE CALCULATOR
// ================================
const calculateRate = async (
  req,
  res
) => {
  try {
    const {
      courierId,
      weight,
    } = req.body;

    const courier =
      await Courier.findById(
        courierId
      );

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    const rate =
      courier.baseRate +
      courier.ratePerKg *
        Number(weight);

    res.status(200).json({
      success: true,
      courier: courier.name,
      weight,
      shippingCost: rate,
      estimatedDays:
        courier.estimatedDays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// SERVICEABILITY CHECK
// ================================
const checkServiceability =
  async (req, res) => {
    try {
      const { pincode } = req.body;

      res.status(200).json({
        success: true,
        pincode,
        serviceable: true,
        message:
          "Service available",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  createCourier,
  getCouriers,
  calculateRate,
  checkServiceability,
};