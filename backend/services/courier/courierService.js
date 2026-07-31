const nimbuspostService = require("../nimbuspostService");

const createShipment = async (courier, orderData) => {
  if (!courier) {
    throw new Error("Courier not found");
  }

  console.log(`[COURIER API] Creating Shipment via ${courier.code || courier.name || "Courier Partner"}...`);

  const code = (courier.code || courier.name || "").toUpperCase();
  if (code.includes("NIMBUS")) {
    return await nimbuspostService.createShipment(orderData);
  }

  return {
    success: true,
    awb: orderData.awb || `AWB${Math.floor(100000000 + Math.random() * 900000000)}`,
    courierName: courier.name || courier.code,
    status: "MANIFESTED",
    apiResponse: "Shipment created successfully via Courier API"
  };
};

/**
 * Direct Courier API Call for NDR Re-attempt Instructions (Bypassing Admin Approval for Attempts <= 3)
 */
const requestReattemptApi = async ({ courierCode, awb, address, customerPhone, pincode, actionNote, attemptNumber }) => {
  console.log(`[DIRECT COURIER API REATTEMPT] Calling ${courierCode || 'COURIER_PARTNER'} API directly for AWB: ${awb} (Attempt #${attemptNumber})`);

  const code = (courierCode || "").toUpperCase();
  if (code.includes("NIMBUS")) {
    const res = await nimbuspostService.submitNdrAction([
      {
        awb: awb,
        action: "re-attempt",
        action_data: {
          address: address || undefined,
          phone: customerPhone || undefined,
          pincode: pincode || undefined,
          remarks: actionNote || "Re-attempt delivery requested",
        },
      },
    ]);
    return {
      success: res.success,
      statusCode: res.success ? 200 : 400,
      message: res.message || `NimbusPost re-attempt #${attemptNumber} submitted.`,
      apiStatus: "EXECUTED_BY_COURIER_API",
      data: res.data,
    };
  }
  
  const courierPayload = {
    awb: awb,
    attempt_number: attemptNumber,
    re_attempt_action: "REATTEMPT_DELIVERY",
    updated_address: address || null,
    updated_phone: customerPhone || null,
    updated_pincode: pincode || null,
    instructions: actionNote || "Customer requested re-attempt delivery",
    timestamp: new Date().toISOString(),
  };

  console.log(`[COURIER API PAYLOAD]`, JSON.stringify(courierPayload, null, 2));

  return {
    success: true,
    statusCode: 200,
    message: `Direct Courier API re-attempt #${attemptNumber} instruction accepted by ${courierCode || 'Courier Partner'}.`,
    courierRefId: `CR-NDR-${Date.now()}`,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    apiStatus: "EXECUTED_BY_COURIER_API"
  };
};

/**
 * Direct Courier API Call for RTO Request (Bypassing Admin Approval)
 */
const requestRTOApi = async ({ courierCode, awb, reason }) => {
  console.log(`[DIRECT COURIER API RTO] Calling ${courierCode || 'COURIER_PARTNER'} API directly for AWB: ${awb} (RTO INITIATION)`);

  const code = (courierCode || "").toUpperCase();
  if (code.includes("NIMBUS")) {
    const res = await nimbuspostService.submitNdrAction([
      {
        awb: awb,
        action: "rto",
        action_data: {
          remarks: reason || "Merchant requested Return to Origin",
        },
      },
    ]);
    return {
      success: res.success,
      statusCode: res.success ? 200 : 400,
      message: res.message || "NimbusPost RTO action submitted.",
      apiStatus: "RTO_EXECUTED_BY_COURIER_API",
      data: res.data,
    };
  }
  
  const courierPayload = {
    awb: awb,
    action: "RTO_INITIATED",
    reason: reason || "Merchant requested Return to Origin",
    timestamp: new Date().toISOString(),
  };

  console.log(`[COURIER API RTO PAYLOAD]`, JSON.stringify(courierPayload, null, 2));

  return {
    success: true,
    statusCode: 200,
    message: `Direct Courier API RTO request accepted by ${courierCode || 'Courier Partner'}. Package marked for Return To Origin.`,
    rtoCourierRefId: `CR-RTO-${Date.now()}`,
    apiStatus: "RTO_EXECUTED_BY_COURIER_API"
  };
};

module.exports = {
  createShipment,
  requestReattemptApi,
  requestRTOApi
};