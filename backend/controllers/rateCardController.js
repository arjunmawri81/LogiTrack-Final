const RateCard = require("../models/RateCard");

// ================================
// SAVE RATE CARD (CREATE OR UPDATE)
// ================================
const saveRateCard = async (req, res) => {
  try {
    const {
      merchantId,
      courierPartner,
      forwardRates,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      isActive,
      serviceability,
    } = req.body;

    // ✅ Validation: Required fields
    if (!merchantId || !courierPartner) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID and Courier Partner are required",
      });
    }

    // ✅ Null Safety: Normalize courierPartner to lowercase with fallback
    const normalizedCourier = (courierPartner || "")
      .trim()
      .toLowerCase();

    // ✅ Check if rate card exists (duplicate prevention)
    let rateCard = await RateCard.findOne({
      merchantId,
      courierPartner: normalizedCourier,
    });

    if (rateCard) {
      // Update existing
      rateCard.courierPartner = normalizedCourier; // ✅ Ensure lowercase
      rateCard.forwardRates = forwardRates;
      rateCard.zoneRates = zoneRates;
      rateCard.codCharge = codCharge;
      rateCard.rtoCharge = rtoCharge;
      rateCard.reversePickup = reversePickup;
      rateCard.fuelCharge = fuelCharge;
      rateCard.isActive = isActive !== undefined ? isActive : true;
      if (serviceability) {
        rateCard.serviceability = serviceability;
      }
      rateCard.updatedAt = new Date();

      await rateCard.save();

      return res.status(200).json({
        success: true,
        message: "Rate Card Updated Successfully",
        rateCard,
      });
    }

    // ✅ Duplicate Prevention: Extra check before create
    const existingRateCard = await RateCard.findOne({
      merchantId,
      courierPartner: normalizedCourier,
    });

    if (existingRateCard) {
      return res.status(409).json({
        success: false,
        message: "Rate card already exists for this courier",
      });
    }

    // Create new
    rateCard = await RateCard.create({
      merchantId,
      courierPartner: normalizedCourier, // ✅ Save lowercase
      forwardRates,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      isActive: isActive !== undefined ? isActive : true,
      serviceability: serviceability || {
        codEnabled: true,
        prepaidEnabled: true,
        rtoEnabled: true,
        reversePickup: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Rate Card Created Successfully",
      rateCard,
    });
  } catch (error) {
    // ✅ Handle duplicate key error (if unique index exists)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Rate card already exists for this merchant and courier",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET ALL MERCHANT RATE CARDS (SORTED)
// ================================
const getMerchantRateCards = async (req, res) => {
  try {
    const { merchantId } = req.params;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID is required",
      });
    }

    // ✅ Sorted by courierPartner for cleaner UI
    const rateCards = await RateCard.find({
      merchantId,
    }).sort({ courierPartner: 1 });

    res.status(200).json({
      success: true,
      count: rateCards.length,
      rateCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET SINGLE COURIER RATE CARD
// ================================
const getCourierRateCard = async (req, res) => {
  try {
    const { merchantId, courier } = req.params;

    if (!merchantId || !courier) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID and Courier are required",
      });
    }

    // ✅ Null Safety: Normalize courier name to lowercase with fallback
    const normalizedCourier = (courier || "")
      .trim()
      .toLowerCase();

    const rateCard = await RateCard.findOne({
      merchantId,
      courierPartner: normalizedCourier,
    });

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found",
      });
    }

    res.status(200).json({
      success: true,
      rateCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// DELETE RATE CARD
// ================================
const deleteRateCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Rate Card ID is required",
      });
    }

    const rateCard = await RateCard.findByIdAndDelete(id);

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rate Card Deleted Successfully",
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
  saveRateCard,
  getMerchantRateCards,
  getCourierRateCard,
  deleteRateCard,
};