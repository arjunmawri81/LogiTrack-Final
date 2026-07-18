const RateCard = require("../models/RateCard");
const Order = require("../models/Order");
const Courier = require("../models/Courier");

// ================================
// SAVE RATE CARD (CREATE OR UPDATE)
// ================================
const saveRateCard = async (req, res) => {
  try {
    const {
      merchantId,
      courierId,        
      courierPartner,   
      forwardRates,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      enabled,          
      isActive,
      serviceability,
    } = req.body;

    //  Role-Based Access Control
    const userRole = req.user?.role;

    if (userRole === "SUPER_ADMIN") {
      // merchantId is optional - can be null for default rates
    } else if (userRole === "ADMIN") {
      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID is required for ADMIN role.",
        });
      }
      if (merchantId === null || merchantId === "null" || merchantId === "") {
        return res.status(403).json({
          success: false,
          message: "ADMIN cannot create default rate cards. Only SUPER_ADMIN can.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You don't have permission to create rate cards.",
      });
    }

    // Courier ID is requird
    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: "Courier ID is required",
      });
    }

    // Validate courier exists
    const courier = await Courier.findById(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found with the provided ID",
      });
    }

    let finalCourierId = courierId;
    let finalCourierPartner = courier.name.toUpperCase();

    // ⚠️ BACKWARD COMPATIBLE: Support courierPartner during migration
    // TODO: Remove this after frontend migration is complete
    if (courierPartner) {
      const normalizedName = courierPartner.trim().toUpperCase();
      const existingCourier = await Courier.findOne({ 
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
      });
      
      if (existingCourier && existingCourier._id.toString() !== courierId) {
        return res.status(409).json({
          success: false,
          message: `Courier name mismatch: "${courierPartner}" doesn't match the courier ID provided.`,
        });
      }
      finalCourierPartner = normalizedName;
    }

    // Prepare forwardRates with rate5kg
    const forwardRatesData = {
      rate500gm: forwardRates?.rate500gm || 0,
      rate1kg: forwardRates?.rate1kg || 0,
      rate2kg: forwardRates?.rate2kg || 0,
      rate5kg: forwardRates?.rate5kg || 0,
      additionalKg: forwardRates?.additionalKg || 0,
    };

    // Check if rate card exists
    let rateCard = await RateCard.findOne({
      merchantId: merchantId || null,
      courierId: finalCourierId,
    });

    if (rateCard) {
      // Update existing
      rateCard.courierId = finalCourierId;
      rateCard.courierPartner = finalCourierPartner;
      rateCard.forwardRates = forwardRatesData;
      rateCard.zoneRates = zoneRates;
      rateCard.codCharge = codCharge;
      rateCard.rtoCharge = rtoCharge;
      rateCard.reversePickup = reversePickup;
      rateCard.fuelCharge = fuelCharge;
      
      // Added enabled field update
      rateCard.enabled =
        enabled !== undefined ? enabled : rateCard.enabled;
      
      rateCard.isActive =
        isActive !== undefined ? isActive : true;
      
      if (serviceability) {
        rateCard.serviceability = serviceability;
      }
      rateCard.updatedAt = new Date();

      await rateCard.save();
      await rateCard.populate('courierId');

      return res.status(200).json({
        success: true,
        message: "Rate Card Updated Successfully",
        rateCard,
      });
    }

    // Create new
    rateCard = await RateCard.create({
      merchantId: merchantId || null,
      courierId: finalCourierId,
      courierPartner: finalCourierPartner,
      forwardRates: forwardRatesData,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      
      // Added enabled field for new rate card
      enabled: enabled !== undefined ? enabled : false,
      
      isActive: isActive !== undefined ? isActive : true,
      serviceability: serviceability || {
        codEnabled: true,
        prepaidEnabled: true,
        rtoEnabled: true,
        reversePickup: true,
      },
    });

    await rateCard.populate('courierId');

    res.status(201).json({
      success: true,
      message: "Rate Card Created Successfully",
      rateCard,
    });
  } catch (error) {
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
// GET ALL MERCHANT RATE CARDS (WITH MERGE LOGIC)
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

    const defaultCards = await RateCard.find({
      merchantId: null,
      isActive: true,
    }).populate('courierId');

    const merchantCards = await RateCard.find({
      merchantId,
      isActive: true,
    }).populate('courierId');

    const mergedMap = new Map();

    defaultCards.forEach((card) => {
      const key = card.courierId?._id?.toString() || card.courierPartner?.toUpperCase();
      if (key) {
        mergedMap.set(key, {
          ...card.toObject(),
          pricingType: "DEFAULT",
          isDefault: true,
          courier: card.courierId,
        });
      }
    });

    merchantCards.forEach((card) => {
      const key = card.courierId?._id?.toString() || card.courierPartner?.toUpperCase();
      if (key) {
        mergedMap.set(key, {
          ...card.toObject(),
          pricingType: "MERCHANT",
          isDefault: false,
          courier: card.courierId,
        });
      }
    });

    const allRateCards = Array.from(mergedMap.values());

    allRateCards.sort((a, b) => {
      const nameA = a.courier?.name || a.courierPartner || '';
      const nameB = b.courier?.name || b.courierPartner || '';
      return nameA.localeCompare(nameB);
    });

    res.status(200).json({
      success: true,
      count: allRateCards.length,
      rateCards: allRateCards,
      summary: {
        defaultCouriers: allRateCards.filter(c => c.pricingType === "DEFAULT").length,
        merchantCouriers: allRateCards.filter(c => c.pricingType === "MERCHANT").length,
        total: allRateCards.length,
      },
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
    const { merchantId, courierId } = req.params;

    if (!merchantId || !courierId) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID and Courier ID are required",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId,
      courierId,
      isActive: true,
    }).populate('courierId');

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        isActive: true,
      }).populate('courierId');
    }

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found",
      });
    }

    res.status(200).json({
      success: true,
      rateCard,
      pricingType: rateCard.merchantId ? "MERCHANT" : "DEFAULT",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET RATE CARD BY COURIER NAME (BACKWARD COMPATIBLE)
// ================================
const getRateCardByCourierName = async (req, res) => {
  try {
    const { merchantId, courierName } = req.params;

    if (!merchantId || !courierName) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID and Courier Name are required",
      });
    }

    const normalizedName = courierName.trim().toUpperCase();

    const courier = await Courier.findOne({ 
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
    });

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId,
      courierId: courier._id,
      isActive: true,
    }).populate('courierId');

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId: courier._id,
        isActive: true,
      }).populate('courierId');
    }

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found for this courier",
      });
    }

    res.status(200).json({
      success: true,
      rateCard,
      pricingType: rateCard.merchantId ? "MERCHANT" : "DEFAULT",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// DELETE RATE CARD (SOFT DELETE)
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

    const rateCard = await RateCard.findById(id);

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found",
      });
    }

    const userRole = req.user?.role;

    if (userRole === "SUPER_ADMIN") {
      rateCard.isActive = false;
      await rateCard.save();
    } else if (userRole === "ADMIN") {
      if (!rateCard.merchantId) {
        return res.status(403).json({
          success: false,
          message: "ADMIN cannot delete default rate cards.",
        });
      }
      rateCard.isActive = false;
      await rateCard.save();
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You don't have permission to delete rate cards.",
      });
    }

    await rateCard.populate('courierId');

    res.status(200).json({
      success: true,
      message: "Rate Card Deactivated Successfully",
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
// REACTIVATE RATE CARD
// ================================
const reactivateRateCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Rate Card ID is required",
      });
    }

    const rateCard = await RateCard.findById(id);

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate Card Not Found",
      });
    }

    const userRole = req.user?.role;

    if (userRole === "SUPER_ADMIN") {
      rateCard.isActive = true;
      await rateCard.save();
    } else if (userRole === "ADMIN") {
      if (!rateCard.merchantId) {
        return res.status(403).json({
          success: false,
          message: "ADMIN cannot reactivate default rate cards.",
        });
      }
      rateCard.isActive = true;
      await rateCard.save();
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You don't have permission to reactivate rate cards.",
      });
    }

    await rateCard.populate('courierId');

    res.status(200).json({
      success: true,
      message: "Rate Card Reactivated Successfully",
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
// GET RECOMMENDED COURIERS (WITH COURIER COLLECTION)
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

    const allCouriers = await Courier.find({ isActive: true });

    if (allCouriers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active couriers available. Please contact administrator.",
      });
    }

    const defaultCards = await RateCard.find({
      merchantId: null,
      isActive: true,
    }).populate('courierId');

    const merchantCards = await RateCard.find({
      merchantId,
      isActive: true,
    }).populate('courierId');

    const rateCardMap = new Map();

    defaultCards.forEach((card) => {
      if (card.courierId) {
        const key = card.courierId._id.toString();
        rateCardMap.set(key, {
          ...card.toObject(),
          pricingType: "DEFAULT",
        });
      }
    });

    merchantCards.forEach((card) => {
      if (card.courierId) {
        const key = card.courierId._id.toString();
        rateCardMap.set(key, {
          ...card.toObject(),
          pricingType: "MERCHANT",
        });
      }
    });

    const couriersWithRates = allCouriers.map((courier) => {
      const rateCard = rateCardMap.get(courier._id.toString());
      const hasRate = !!rateCard;

      let forwardRate = 0;
      let codCharge = 0;
      let fuelCharge = 0;
      let total = 0;

      if (hasRate) {
        const w = Number(weight);

        if (w <= 0.5) {
          forwardRate = rateCard.forwardRates?.rate500gm || 0;
        } else if (w <= 1) {
          forwardRate = rateCard.forwardRates?.rate1kg || 0;
        } else if (w <= 2) {
          forwardRate = rateCard.forwardRates?.rate2kg || 0;
        } else if (w <= 5) {
          forwardRate = rateCard.forwardRates?.rate5kg || 0;
        } else {
          forwardRate =
            (rateCard.forwardRates?.rate5kg || 0) +
            Math.ceil(w - 5) *
            (rateCard.forwardRates?.additionalKg || 0);
        }

        codCharge = rateCard.codCharge || 0;
        fuelCharge = rateCard.fuelCharge || 0;
        total = forwardRate + codCharge + fuelCharge;
      }

      return {
        courierId: courier._id,
        courierName: courier.name,
        logo: courier.logo || null,
        estimatedDays: courier.estimatedDays || 3,
        isCourierActive: courier.isActive,
        
        hasRate: hasRate,
        forwardRate: forwardRate,
        codCharge: codCharge,
        fuelCharge: fuelCharge,
        total: total,
        rateCardId: hasRate ? rateCard._id : null,
        pricingType: hasRate ? rateCard.pricingType : "NOT_CONFIGURED",
        isDefault: hasRate ? rateCard.merchantId === null : true,
        serviceability: hasRate ? rateCard.serviceability : null,
      };
    });

    const availableCouriers = couriersWithRates.filter(c => c.hasRate);

    if (availableCouriers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pricing available for any courier. Please contact administrator.",
      });
    }

    availableCouriers.sort((a, b) => a.total - b.total);

    res.status(200).json({
      success: true,
      recommended: availableCouriers.length > 0 ? availableCouriers[0] : null,
      couriers: availableCouriers,
      totalCouriers: availableCouriers.length,
      summary: {
        defaultRates: availableCouriers.filter(c => c.pricingType === "DEFAULT").length,
        merchantRates: availableCouriers.filter(c => c.pricingType === "MERCHANT").length,
        total: availableCouriers.length,
      },
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
    const { orderId, courierId } = req.body;

    if (!orderId || !courierId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Courier ID are required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const courier = await Courier.findById(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = await RateCard.findOne({
      merchantId: order.merchantId,
      courierId,
      isActive: true,
    }).populate('courierId');

    let pricingType = "MERCHANT";

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        isActive: true,
      }).populate('courierId');
      pricingType = "DEFAULT";
    }

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "No pricing available for this courier. Please contact administrator.",
      });
    }

    let shippingCharge = 0;
    const weight = Number(order.weight || 0);

    if (weight <= 0.5) {
      shippingCharge = rateCard.forwardRates?.rate500gm || 0;
    } else if (weight <= 1) {
      shippingCharge = rateCard.forwardRates?.rate1kg || 0;
    } else if (weight <= 2) {
      shippingCharge = rateCard.forwardRates?.rate2kg || 0;
    } else if (weight <= 5) {
      shippingCharge = rateCard.forwardRates?.rate5kg || 0;
    } else {
      shippingCharge =
        (rateCard.forwardRates?.rate5kg || 0) +
        Math.ceil(weight - 5) *
        (rateCard.forwardRates?.additionalKg || 0);
    }

    const codCharge = order.paymentMode === "COD"
      ? rateCard.codCharge || 0
      : 0;

    const fuelCharge = rateCard.fuelCharge || 0;
    const totalCharge = shippingCharge + codCharge + fuelCharge;

    res.status(200).json({
      success: true,
      shippingCharge,
      codCharge,
      fuelCharge,
      totalCharge,
      weight: weight,
      paymentMode: order.paymentMode,
      courier: rateCard.courierId || courier,
      courierName: rateCard.courierId?.name || courier.name,
      pricingType: pricingType,
      rateCardSource: pricingType === "MERCHANT" ? "Merchant Rate" : "Default Rate",
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
  getRateCardByCourierName,
  deleteRateCard,
  reactivateRateCard,
  getRecommendedCouriers,
  calculatePricing,
};