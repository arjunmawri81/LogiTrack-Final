const Courier = require("../models/Courier");

// ==============================
// CREATE COURIER
// ==============================
const createCourier = async (req, res) => {
  try {
    const exists = await Courier.findOne({
      $or: [
        { name: req.body.name },
        { code: req.body.code },
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Courier already exists",
      });
    }

    const courier = await Courier.create(req.body);

    res.status(201).json({
      success: true,
      message: "Courier created successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET ALL COURIERS (SUPER ADMIN)
// ==============================
const getCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find().sort({
      priority: 1,
      name: 1,
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

// ==============================
// GET ACTIVE COURIERS (MERCHANT)
// ==============================
const getActiveCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({
      isActive: true,
    }).sort({
      priority: 1,
      name: 1,
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

// ==============================
// GET SINGLE COURIER
// ==============================
const getCourierById = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE COURIER
// ==============================
const updateCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Courier updated successfully",
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// ENABLE / DISABLE COURIER
// ==============================
const toggleCourierStatus = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    courier.isActive = !courier.isActive;

    await courier.save();

    res.status(200).json({
      success: true,
      message: `Courier ${
        courier.isActive ? "Activated" : "Disabled"
      } successfully`,
      courier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE COURIER
// ==============================
const deleteCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndDelete(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Courier deleted successfully",
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
  getActiveCouriers,
  getCourierById,
  updateCourier,
  toggleCourierStatus,
  deleteCourier,
};