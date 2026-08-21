const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const connectDB = require("../config/db");
const Courier = require("../models/Courier");
const RateCard = require("../models/RateCard");
const nimbuspostService = require("../services/nimbuspostService");

const runSync = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const nimbusRes = await nimbuspostService.getCourierList();
    console.log("Nimbus Response:", nimbusRes.success ? `Found ${nimbusRes.couriers?.length || 0} couriers` : nimbusRes.message);

    let nimbusCouriers = [];
    if (nimbusRes.success && Array.isArray(nimbusRes.couriers) && nimbusRes.couriers.length > 0) {
      nimbusCouriers = nimbusRes.couriers;
    } else {
      console.log("Using standard NimbusPost Courier Catalog fallback...");
      nimbusCouriers = [
        { id: 1, name: "Nimbus - Delhivery Surface", code: "NIMBUS_DELHIVERY_SURFACE" },
        { id: 2, name: "Nimbus - Delhivery Air", code: "NIMBUS_DELHIVERY_AIR" },
        { id: 3, name: "Nimbus - Shadowfax Surface", code: "NIMBUS_SHADOWFAX_SURFACE" },
        { id: 4, name: "Nimbus - Xpressbees Surface", code: "NIMBUS_XPRESSBEES_SURFACE" },
        { id: 5, name: "Nimbus - BlueDart Air", code: "NIMBUS_BLUEDART_AIR" },
        { id: 6, name: "Nimbus - Ekart Surface", code: "NIMBUS_EKART_SURFACE" },
        { id: 7, name: "Nimbus - DTDC Air", code: "NIMBUS_DTDC_AIR" },
        { id: 8, name: "Nimbus - Smartr Air", code: "NIMBUS_SMARTR_AIR" },
      ];
    }

    const syncedCouriers = [];

    for (const item of nimbusCouriers) {
      const courierName = item.name || item.courier_name || `Nimbus Courier ${item.id}`;
      const courierCode = (item.code || `NIMBUS_${item.id}`).toUpperCase().replace(/[^A-Z0-9_]/g, "_");

      const existingCourier = await Courier.findOneAndUpdate(
        { $or: [{ code: courierCode }, { name: courierName }] },
        {
          $set: {
            name: courierName,
            code: courierCode,
            apiProvider: "NIMBUSPOST",
            apiIntegrated: true,
            apiStatus: "CONNECTED",
            isActive: true,
            supportsCOD: item.supports_cod !== false,
            supportsPrepaid: item.supports_prepaid !== false,
            supportsReversePickup: item.supports_reverse !== false,
            priority: Number(item.id) || 1,
            description: `NimbusPost Integrated Logistics Partner (${courierName})`,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      syncedCouriers.push(existingCourier);

      const serviceType = courierName.toLowerCase().includes("air") ? "Air" : "Surface";
      const defaultRateCard = await RateCard.findOne({
        merchantId: null,
        courierId: existingCourier._id,
        serviceType,
      });

      if (!defaultRateCard) {
        await RateCard.create({
          merchantId: null,
          courierId: existingCourier._id,
          courierPartner: courierName.toUpperCase(),
          serviceType,
          isActive: true,
          enabled: true,
          forwardRates: {
            rate500gm: 40,
            rate1kg: 60,
            rate2kg: 100,
            rate5kg: 220,
            additionalKg: 35,
          },
          zoneRates: {
            local: 30,
            regional: 45,
            national: 65,
          },
          codCharge: 40,
          codPercentage: 2,
          codBuyCharge: 20,
          codBuyPercentage: 1,
          fuelCharge: 0,
          gst: 18,
        });
      }
    }

    console.log(`✅ Synced ${syncedCouriers.length} couriers to MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error("Sync Script Error:", error);
    process.exit(1);
  }
};

runSync();
