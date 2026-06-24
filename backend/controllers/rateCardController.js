const RateCard = require("../models/RateCard");
const Order = require("../models/Order"); // ✅ ADDED

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
// GET RECOMMENDED COURIERS (SHIPMOZO STYLE)
// ================================
const getRecommendedCouriers = async (req, res) => {
  try {
    const { merchantId, weight } = req.query;

    if (!merchantId || !weight) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID and Weight are required",
      });
    }

    // ✅ STEP 1: Default couriers with fallback rates
    const defaultCouriers = [
      {
        courierPartner: "delhivery",
        forwardRates: {
          rate500gm: 45,
          rate1kg: 60,
          rate2kg: 85,
          additionalKg: 20,
        },
        codCharge: 0,
        fuelCharge: 5,
        isActive: true,
      },
      {
        courierPartner: "xpressbees",
        forwardRates: {
          rate500gm: 48,
          rate1kg: 65,
          rate2kg: 90,
          additionalKg: 22,
        },
        codCharge: 0,
        fuelCharge: 5,
        isActive: true,
      },
      {
        courierPartner: "shadowfax",
        forwardRates: {
          rate500gm: 50,
          rate1kg: 68,
          rate2kg: 95,
          additionalKg: 22,
        },
        codCharge: 0,
        fuelCharge: 5,
        isActive: true,
      },
      {
        courierPartner: "ecom",
        forwardRates: {
          rate500gm: 55,
          rate1kg: 72,
          rate2kg: 100,
          additionalKg: 25,
        },
        codCharge: 0,
        fuelCharge: 5,
        isActive: true,
      },
      {
        courierPartner: "dtdc",
        forwardRates: {
          rate500gm: 60,
          rate1kg: 80,
          rate2kg: 110,
          additionalKg: 30,
        },
        codCharge: 0,
        fuelCharge: 5,
        isActive: true,
      },
    ];

    // ✅ STEP 2: Get admin configured rate cards
    const adminCards = await RateCard.find({
      merchantId,
      isActive: true,
    });

    console.log("MERCHANT ID =>", merchantId);
    console.log("ADMIN CARDS FOUND =>", adminCards.length);
    
    adminCards.forEach((card) => {
      console.log(
        "ADMIN COURIER =>",
        card.courierPartner,
        "RATES =>",
        card.forwardRates
      );
    });

    // ✅ STEP 3: Merge logic - Use admin rates if available, else use default
    const rateCards = defaultCouriers.map((defaultCourier) => {
      const adminRate = adminCards.find(
        (a) =>
          a.courierPartner.toLowerCase() ===
          defaultCourier.courierPartner.toLowerCase()
      );

      // If admin has configured this courier, use admin's rates
      if (adminRate) {
        return {
          courierPartner: adminRate.courierPartner,
          forwardRates: adminRate.forwardRates || defaultCourier.forwardRates,
          codCharge: adminRate.codCharge || defaultCourier.codCharge || 0,
          fuelCharge: adminRate.fuelCharge || defaultCourier.fuelCharge || 5,
          isActive: adminRate.isActive,
          _id: adminRate._id,
          serviceability: adminRate.serviceability,
        };
      }

      // Otherwise use default rates
      return {
        courierPartner: defaultCourier.courierPartner,
        forwardRates: defaultCourier.forwardRates,
        codCharge: defaultCourier.codCharge || 0,
        fuelCharge: defaultCourier.fuelCharge || 5,
        isActive: defaultCourier.isActive,
        _id: null,
        serviceability: {
          codEnabled: true,
          prepaidEnabled: true,
          rtoEnabled: true,
          reversePickup: true,
        },
      };
    });

    console.log("TOTAL COURIERS AFTER MERGE =>", rateCards.length);

    // ✅ ETA Mapping (temporary - will come from real API later)
    const etaMap = {
      delhivery: "3 Days",
      xpressbees: "2 Days",
      dtdc: "4 Days",
      ecom: "3 Days",
      bluedart: "2 Days",
      shadowfax: "2 Days",
    };

    // ✅ Calculate rate for each courier based on weight
    const couriers = rateCards.map((card) => {
      let forwardRate = 0;
      const w = Number(weight);

      if (w <= 0.5) {
        forwardRate = card.forwardRates?.rate500gm || 0;
      } else if (w <= 1) {
        forwardRate = card.forwardRates?.rate1kg || 0;
      } else if (w <= 2) {
        forwardRate = card.forwardRates?.rate2kg || 0;
      } else {
        forwardRate =
          (card.forwardRates?.rate2kg || 0) +
          Math.ceil(w - 2) *
            (card.forwardRates?.additionalKg || 0);
      }

      // ✅ Get charges
      const codCharge = card.codCharge || 0;
      const fuelCharge = card.fuelCharge || 0;

      // ✅ Calculate total
      const total = forwardRate + codCharge + fuelCharge;

      // ✅ Get ETA
      const eta = etaMap[card.courierPartner] || "3 Days";

      return {
        courier: card.courierPartner,
        forwardRate: forwardRate,
        codCharge: codCharge,
        fuelCharge: fuelCharge,
        total: total,
        eta: eta,
        rateCardId: card._id,
        isActive: card.isActive,
        serviceability: card.serviceability,
        isDefault: card._id === null, // Flag to identify default rates
      };
    });

    // ✅ Sort by total (cheapest first)
    couriers.sort((a, b) => a.total - b.total);

    // ✅ Return all couriers with rates and the best recommendation
    res.status(200).json({
      success: true,
      recommended: couriers.length > 0 ? couriers[0] : null,
      couriers: couriers,
      totalCouriers: couriers.length,
      hasAdminRates: adminCards.length > 0,
    });
  } catch (error) {
    console.error("Recommended couriers error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// CALCULATE PRICING
// ================================
const calculatePricing = async (req, res) => {
  try {
    const { orderId, courier } = req.body;

    if (!orderId || !courier) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Courier are required",
      });
    }

    // ✅ Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Find the rate card for this merchant and courier
    const rateCard = await RateCard.findOne({
      merchantId: order.merchantId,
      courierPartner: courier.toLowerCase().trim(),
      isActive: true,
    });

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: `Rate card not found for courier: ${courier}`,
      });
    }

    // ✅ Calculate shipping charge based on weight
    let shippingCharge = 0;
    const weight = Number(order.weight || 0);

    if (weight <= 0.5) {
      shippingCharge = rateCard.forwardRates?.rate500gm || 0;
    } else if (weight <= 1) {
      shippingCharge = rateCard.forwardRates?.rate1kg || 0;
    } else if (weight <= 2) {
      shippingCharge = rateCard.forwardRates?.rate2kg || 0;
    } else {
      shippingCharge =
        (rateCard.forwardRates?.rate2kg || 0) +
        Math.ceil(weight - 2) *
          (rateCard.forwardRates?.additionalKg || 0);
    }

    // ✅ Calculate COD charge if payment mode is COD
    const codCharge = order.paymentMode === "COD"
      ? rateCard.codCharge || 0
      : 0;

    // ✅ Get fuel charge
    const fuelCharge = rateCard.fuelCharge || 0;

    // ✅ Calculate total charge
    const totalCharge = shippingCharge + codCharge + fuelCharge;

    res.status(200).json({
      success: true,
      shippingCharge,
      codCharge,
      fuelCharge,
      totalCharge,
      weight: weight,
      paymentMode: order.paymentMode,
      courier: rateCard.courierPartner,
    });
  } catch (error) {
    console.error("Calculate pricing error:", error);
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
  getRecommendedCouriers,
  calculatePricing, 
};