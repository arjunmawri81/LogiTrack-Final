const mongoose = require("mongoose");
const RateCard = require("../models/RateCard");
const Order = require("../models/Order");
const Courier = require("../models/Courier");

const parseMerchantId = (id) => {
  if (!id || id === "null" || id === "undefined" || id === "default" || id === "global") {
    return null;
  }
  if (mongoose.isValidObjectId(id)) {
    return id;
  }
  throw new Error("Invalid Merchant ID format");
};

// ====================================
// ZONE DETERMINATION HELPER
// ====================================
const determineZone = (pickupPincode, deliveryPincode) => {
  if (!pickupPincode || !deliveryPincode) return "national";
  const p1 = pickupPincode.toString().trim();
  const p2 = deliveryPincode.toString().trim();
  
  if (p1.slice(0, 3) === p2.slice(0, 3)) {
    return "local";
  }
  if (p1.slice(0, 2) === p2.slice(0, 2)) {
    return "regional";
  }
  return "national";
};

// ====================================
// SHIPPING RATE CALCULATION HELPER
// ====================================
const roundMoney = (val) => Math.ceil(val * 100) / 100;

const calculateShippingRates = (rateCard, params) => {
  const {
    weight,
    length = 0,
    breadth = 0,
    height = 0,
    paymentMode,
    insuranceEnabled,
    amount = 0,
    isRtoApplicable = false,
    zone = "national"
  } = params;

  const deadWeight = Number(weight || 0);
  const volumetricDivisor = rateCard.volumetricDivisor || 5000;
  
  let volumetricWeight = 0;
  if (length > 0 && breadth > 0 && height > 0) {
    volumetricWeight = (length * breadth * height) / volumetricDivisor;
  }

  const billedWeight = Math.max(deadWeight, volumetricWeight);
  const w = billedWeight;

  // 1. Forward Rate
  let forwardRate = 0;
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
      Math.ceil(w - 5) * (rateCard.forwardRates?.additionalKg || 0);
  }

  // 2. Zone Rate
  const zoneRate = rateCard.zoneRates?.[zone] || 0;

  // 3. COD Charge & COD Buy Charge
  let codCharge = 0;
  let codBuyCharge = 0;
  let codMarginEarned = 0;
  if (paymentMode === "COD") {
    const fixedCod = rateCard.codCharge || 0;
    const percentageCod = rateCard.codPercentage ? (amount * (rateCard.codPercentage / 100)) : 0;
    codCharge = roundMoney(Math.max(fixedCod, percentageCod));

    const fixedCodBuy = rateCard.codBuyCharge || 0;
    const percentageCodBuy = rateCard.codBuyPercentage ? (amount * (rateCard.codBuyPercentage / 100)) : 0;
    const rawCodBuy = Math.max(fixedCodBuy, percentageCodBuy);
    codBuyCharge = roundMoney(rawCodBuy > 0 ? rawCodBuy : Math.round(codCharge * 0.50));
    codMarginEarned = roundMoney(codCharge - codBuyCharge);
  }

  // 4. Fuel Charge
  const fuelCharge = rateCard.fuelCharge || 0;

  // 5. Insurance Charge
  let insuranceCharge = 0;
  if (insuranceEnabled) {
    if (rateCard.insuranceCharge) {
      insuranceCharge = rateCard.insuranceCharge;
    } else {
      const insurancePercentage = Number(process.env.INSURANCE_PERCENTAGE || 2);
      insuranceCharge = roundMoney((amount || 0) * (insurancePercentage / 100));
    }
  }

  // 6. ODA Charge
  const odaCharge = rateCard.odaCharge || 0;

  // 7. Handling Charge
  const handlingCharge = rateCard.handlingCharge || 0;

  // 8. RTO Charge & RTO Buy Charge
  const rtoCharge = isRtoApplicable ? (rateCard.rtoCharge || 60) : (rateCard.rtoCharge || 60);
  const rtoBuyCharge = rateCard.rtoBuyCharge && rateCard.rtoBuyCharge > 0 ? rateCard.rtoBuyCharge : Math.round(rtoCharge * 0.60);
  const rtoMarginEarned = roundMoney(rtoCharge - rtoBuyCharge);

  // Subtotal
  const subtotal = roundMoney(forwardRate + zoneRate + codCharge + fuelCharge + insuranceCharge + odaCharge + handlingCharge + rtoCharge);

  // GST calculation
  const gstPercentage = rateCard.gst !== undefined ? rateCard.gst : Number(process.env.GST_PERCENTAGE || 18);
  const gstAmount = roundMoney(subtotal * (gstPercentage / 100));

  // Final Total (Sell Rate)
  const finalCharge = roundMoney(subtotal + gstAmount);
  const sellRate = finalCharge;
  const buyPercent = (rateCard.internalCostPercent !== undefined && rateCard.internalCostPercent !== null) ? rateCard.internalCostPercent : 70;
  const buyRate = rateCard.buyRate && rateCard.buyRate > 0 ? rateCard.buyRate : Math.round(sellRate * (buyPercent / 100));
  const marginEarned = roundMoney(sellRate - buyRate);

  return {
    forwardRate,
    zone,
    zoneRate,
    codCharge,
    codBuyCharge,
    codMarginEarned,
    fuelCharge,
    insuranceCharge,
    odaCharge,
    handlingCharge,
    rtoCharge,
    rtoBuyCharge,
    rtoMarginEarned,
    subtotal,
    gstPercentage,
    gstAmount,
    finalCharge,
    sellRate,
    buyRate,
    marginEarned,
    billedWeight,
    volumetricWeight,
    deadWeight
  };
};

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
      serviceType,
      gst,
      odaCharge,
      handlingCharge,
      effectiveFrom,
      effectiveTo,
    } = req.body;

    const targetMerchantId = parseMerchantId(merchantId);

    // Role-Based Access Control
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

    // Courier ID is required
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

    // Support courierPartner during migration
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

    const targetServiceType = serviceType || "Surface";

    // Check if rate card exists
    let rateCard = await RateCard.findOne({
      merchantId: targetMerchantId,
      courierId: finalCourierId,
      serviceType: targetServiceType,
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
      rateCard.codPercentage = req.body.codPercentage !== undefined ? req.body.codPercentage : rateCard.codPercentage;
      rateCard.volumetricDivisor = req.body.volumetricDivisor !== undefined ? req.body.volumetricDivisor : rateCard.volumetricDivisor;
      
      // Update service type specific fields
      rateCard.gst = gst !== undefined ? gst : rateCard.gst;
      rateCard.odaCharge = odaCharge !== undefined ? odaCharge : rateCard.odaCharge;
      rateCard.handlingCharge = handlingCharge !== undefined ? handlingCharge : rateCard.handlingCharge;
      rateCard.effectiveFrom = effectiveFrom !== undefined ? effectiveFrom : rateCard.effectiveFrom;
      rateCard.effectiveTo = effectiveTo !== undefined ? effectiveTo : rateCard.effectiveTo;
      
      // Added enabled field update
      rateCard.enabled = enabled !== undefined ? enabled : rateCard.enabled;
      rateCard.isActive = isActive !== undefined ? isActive : true;
      
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
      merchantId: targetMerchantId,
      courierId: finalCourierId,
      courierPartner: finalCourierPartner,
      forwardRates: forwardRatesData,
      zoneRates,
      codCharge,
      rtoCharge,
      reversePickup,
      fuelCharge,
      codPercentage,
      volumetricDivisor,
      
      // Service type specific fields
      serviceType: targetServiceType,
      gst: gst !== undefined ? gst : 18,
      odaCharge: odaCharge || 0,
      handlingCharge: handlingCharge || 0,
      effectiveFrom,
      effectiveTo,
      
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
    // E11000 = Duplicate Key — this can happen due to race conditions or index mismatch.
    // Recovery: find the existing card and update it instead of failing.
    if (error.code === 11000) {
      try {
        const { merchantId, courierId, serviceType, forwardRates,
          zoneRates, codCharge, rtoCharge, reversePickup, fuelCharge,
          gst, odaCharge, handlingCharge, effectiveFrom, effectiveTo,
          enabled, isActive, serviceability } = req.body;

        const targetMerchantId = parseMerchantId(merchantId);
        const targetServiceType = serviceType || "Surface";

        const recovered = await RateCard.findOneAndUpdate(
          { merchantId: targetMerchantId, courierId, serviceType: targetServiceType },
          {
            $set: {
              forwardRates: {
                rate500gm: forwardRates?.rate500gm || 0,
                rate1kg: forwardRates?.rate1kg || 0,
                rate2kg: forwardRates?.rate2kg || 0,
                rate5kg: forwardRates?.rate5kg || 0,
                additionalKg: forwardRates?.additionalKg || 0,
              },
              zoneRates,
              codCharge: codCharge || 0,
              codPercentage: req.body.codPercentage || 0,
              volumetricDivisor: req.body.volumetricDivisor || 5000,
              rtoCharge: rtoCharge || 0,
              reversePickup: reversePickup || 0,
              fuelCharge: fuelCharge || 0,
              gst: gst !== undefined ? gst : 18,
              odaCharge: odaCharge || 0,
              handlingCharge: handlingCharge || 0,
              effectiveFrom,
              effectiveTo,
              enabled: enabled !== undefined ? enabled : true,
              isActive: isActive !== undefined ? isActive : true,
              serviceability: serviceability || {
                codEnabled: true,
                prepaidEnabled: true,
                rtoEnabled: true,
                reversePickup: true,
              },
              updatedAt: new Date(),
            },
          },
          { new: true }
        );

        if (recovered) {
          await recovered.populate('courierId');
          return res.status(200).json({
            success: true,
            message: "Rate Card Updated Successfully (recovered from duplicate)",
            rateCard: recovered,
          });
        }
      } catch (recoveryErr) {
        console.error("Recovery attempt failed:", recoveryErr.message);
      }

      return res.status(409).json({
        success: false,
        message: "Rate card already exists for this merchant, courier and service type",
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

    const targetMerchantId = parseMerchantId(merchantId);

    const defaultCards = await RateCard.find({
      merchantId: null,
      isActive: true,
    }).populate('courierId');

    let merchantCards = [];
    if (targetMerchantId) {
      merchantCards = await RateCard.find({
        merchantId: targetMerchantId,
        isActive: true,
      }).populate('courierId');
    }

    const mergedMap = new Map();

    defaultCards.forEach((card) => {
      // Key includes serviceType to separate Surface and Air
      const key = `${card.courierId?._id?.toString() || card.courierPartner?.toUpperCase()}_${card.serviceType || 'Surface'}`;
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
      const key = `${card.courierId?._id?.toString() || card.courierPartner?.toUpperCase()}_${card.serviceType || 'Surface'}`;
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
      const comp = nameA.localeCompare(nameB);
      if (comp !== 0) return comp;
      return (a.serviceType || 'Surface').localeCompare(b.serviceType || 'Surface');
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
    const { serviceType } = req.query;

    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: "Courier ID is required",
      });
    }

    const targetMerchantId = parseMerchantId(merchantId);
    const selectedServiceType = serviceType || "Surface";

    let rateCard = null;
    if (targetMerchantId) {
      rateCard = await RateCard.findOne({
        merchantId: targetMerchantId,
        courierId,
        serviceType: selectedServiceType,
        isActive: true,
      }).populate('courierId');
    }

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        serviceType: selectedServiceType,
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
    const { serviceType } = req.query;

    if (!courierName) {
      return res.status(400).json({
        success: false,
        message: "Courier Name is required",
      });
    }

    const targetMerchantId = parseMerchantId(merchantId);
    const normalizedName = courierName.trim().toUpperCase();
    const selectedServiceType = serviceType || "Surface";

    const courier = await Courier.findOne({ 
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
    });

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let rateCard = null;
    if (targetMerchantId) {
      rateCard = await RateCard.findOne({
        merchantId: targetMerchantId,
        courierId: courier._id,
        serviceType: selectedServiceType,
        isActive: true,
      }).populate('courierId');
    }

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId: courier._id,
        serviceType: selectedServiceType,
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
// GET RECOMMENDED COURIERS
// ================================
const getRecommendedCouriers = async (req, res) => {
  try {
    const { 
      merchantId, 
      weight = 0.5, 
      serviceType, 
      pickup, 
      destination, 
      length, 
      breadth, 
      height, 
      amount, 
      paymentMode 
    } = req.query;

    let targetMerchantId = merchantId;
    if (req.user && req.user.role === "MERCHANT") {
      targetMerchantId = req.user.id;
    } else if (!targetMerchantId && req.user) {
      targetMerchantId = req.user.id;
    }

    if (!targetMerchantId) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID is required",
      });
    }

    const allCouriers = await Courier.find({ isActive: true });

    if (allCouriers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active couriers available. Please contact administrator.",
      });
    }

    const selectedServiceType = serviceType || "Surface";

    const defaultCards = await RateCard.find({
      merchantId: null,
      serviceType: selectedServiceType,
      isActive: true,
    }).populate('courierId');

    const merchantCards = await RateCard.find({
      merchantId: targetMerchantId,
      serviceType: selectedServiceType,
      isActive: true,
    }).populate('courierId');

    const rateCardMap = new Map();

    defaultCards.forEach((card) => {
      if (card.courierId && card.enabled !== false && card.isActive !== false) {
        const fw = card.forwardRates || {};
        if ((fw.rate500gm || 0) > 0 || (fw.rate1kg || 0) > 0 || (fw.rate2kg || 0) > 0) {
          const key = card.courierId._id.toString();
          rateCardMap.set(key, {
            ...card.toObject(),
            pricingType: "DEFAULT",
          });
        }
      }
    });

    merchantCards.forEach((card) => {
      if (card.courierId && card.enabled !== false && card.isActive !== false) {
        const fw = card.forwardRates || {};
        if ((fw.rate500gm || 0) > 0 || (fw.rate1kg || 0) > 0 || (fw.rate2kg || 0) > 0) {
          const key = card.courierId._id.toString();
          rateCardMap.set(key, {
            ...card.toObject(),
            pricingType: "MERCHANT",
          });
        }
      }
    });

    const zone = determineZone(pickup, destination);

    const couriersWithRates = allCouriers.map((courier) => {
      const rateCard = rateCardMap.get(courier._id.toString());
      const hasRate = !!rateCard;

      let forwardRate = 0;
      let codCharge = 0;
      let fuelCharge = 0;
      let gstAmount = 0;
      let total = 0;
      let details = null;

      if (hasRate) {
        details = calculateShippingRates(rateCard, {
          weight: Number(weight || 0.5),
          length: Number(length || 0),
          breadth: Number(breadth || 0),
          height: Number(height || 0),
          amount: Number(amount || 0),
          zone,
          paymentMode: paymentMode || "PREPAID",
          insuranceEnabled: false,
        });

        forwardRate = details.forwardRate;
        codCharge = details.codCharge;
        fuelCharge = details.fuelCharge;
        gstAmount = details.gstAmount;
        total = details.finalCharge;
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
        gstAmount: gstAmount,
        total: total,
        calculationDetails: details,
        rateCardId: hasRate ? rateCard._id : null,
        pricingType: hasRate ? rateCard.pricingType : "STANDARD",
        isDefault: hasRate ? (rateCard ? rateCard.merchantId === null : true) : true,
        serviceability: hasRate ? rateCard.serviceability : null,
      };
    });

    const availableCouriers = couriersWithRates.filter((c) => c.hasRate);

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
        standardRates: availableCouriers.filter(c => c.pricingType === "STANDARD").length,
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
    let { 
      orderId, 
      courierId, 
      serviceType, 
      shippingMode, 
      weight, 
      pickup, 
      destination, 
      paymentMode,
      insuranceEnabled,
      amount
    } = req.body;

    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: "Courier ID is required",
      });
    }

    const courier = await Courier.findById(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    let merchantId = req.user?.id || null;
    let order;

    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
      if (req.user && req.user.role === "MERCHANT" && order.merchantId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this order",
        });
      }
      weight = order.weight;
      paymentMode = order.paymentMode;
      serviceType = req.body.serviceType || order.serviceType || "Surface";
      insuranceEnabled = order.insuranceEnabled;
      amount = order.amount;
      merchantId = order.merchantId;
      destination = order.customerPincode;
      
      if (order.warehouseId || req.body.warehouseId) {
        const Warehouse = require("../models/Warehouse");
        const warehouse = await Warehouse.findById(order.warehouseId || req.body.warehouseId);
        if (warehouse) {
          pickup = warehouse.pincode;
        }
      }
    } else {
      serviceType = serviceType || shippingMode || "Surface";
      weight = Number(weight || 0);
      paymentMode = paymentMode || "PREPAID";
      insuranceEnabled = !!insuranceEnabled;
      amount = Number(amount || 0);
    }

    let rateCard = await RateCard.findOne({
      merchantId,
      courierId,
      serviceType: serviceType || "Surface",
      isActive: true,
    }).populate('courierId');

    let pricingType = "MERCHANT";

    if (!rateCard) {
      rateCard = await RateCard.findOne({
        merchantId: null,
        courierId,
        serviceType: serviceType || "Surface",
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

    const zone = determineZone(pickup, destination);
    const calculated = calculateShippingRates(rateCard, {
      weight,
      zone,
      paymentMode,
      insuranceEnabled,
      amount,
    });

    res.status(200).json({
      success: true,
      shippingCharge: calculated.subtotal - calculated.codCharge - calculated.fuelCharge,
      codCharge: calculated.codCharge,
      fuelCharge: calculated.fuelCharge,
      gstAmount: calculated.gstAmount,
      totalCharge: calculated.finalCharge,
      weight: weight,
      paymentMode: paymentMode,
      courier: rateCard.courierId || courier,
      courierName: rateCard.courierId?.name || courier.name,
      pricingType: pricingType,
      rateCardSource: pricingType === "MERCHANT" ? "Merchant Rate" : "Default Rate",
      calculationDetails: calculated,
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
// SERVICEABILITY CHECK
// ================================
const checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: "Invalid pincode" });
    }

    const activeCouriers = await Courier.find({ isActive: true });
    const results = activeCouriers.map((courier) => ({
      courierId: courier._id,
      courierName: courier.name,
      serviceable: true, // TODO: replace with real courier pincode-check once NimbusPost is live
      estimatedDays: 3,
    }));

    res.status(200).json({ success: true, pincode, couriers: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================
// GET LOGGED IN MERCHANT'S RATE CARDS
// ================================
const getMyRateCards = async (req, res) => {
  try {
    const merchantId = req.user?.id;
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID not found in session",
      });
    }

    req.params.merchantId = merchantId;
    return getMerchantRateCards(req, res);
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
  getMyRateCards,
  getCourierRateCard,
  getRateCardByCourierName,
  deleteRateCard,
  reactivateRateCard,
  getRecommendedCouriers,
  calculatePricing,
  checkServiceability,
  determineZone,
  calculateShippingRates
};