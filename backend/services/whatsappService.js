const dotenv = require("dotenv");
dotenv.config();

/**
 * Helper function to format phone numbers to standard E.164 (e.g. +919876543210)
 */
function formatPhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return "+" + cleaned;
}

/**
 * Send WhatsApp Notification for Shipment Creation
 * 
 * @param {Object} params
 * @param {string} params.customerName - Name of the customer
 * @param {string} params.customerPhone - Customer mobile number
 * @param {string} params.orderNumber - Order number or reference ID
 * @param {string} params.awb - AWB Tracking Number
 * @param {string} params.courierName - Courier partner name (e.g., Delhivery, BlueDart)
 * @param {string} [params.trackingUrl] - Direct tracking link
 */
async function sendShipmentNotification({
  customerName,
  customerPhone,
  orderNumber,
  awb,
  courierName,
  trackingUrl,
}) {
  const formattedPhone = formatPhoneNumber(customerPhone);
  const trackLink = trackingUrl || `https://logitrack.com/track/${awb}`;
  const messageText = `Hello *${customerName || "Customer"}*, your order *#${orderNumber || ""}* has been shipped via *${courierName || "Courier"}*! 🚚\n\n*AWB Tracking No:* ${awb}\n*Track Package:* ${trackLink}\n\nThank you for shopping with us!`;

  const isEnabled = process.env.WHATSAPP_ENABLED === "true";
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  console.log(`[WhatsApp Service] Preparing notification for ${formattedPhone}...`);

  if (!isEnabled || !apiUrl) {
    console.log(`[WhatsApp Service - MOCK LOG] Message to ${formattedPhone}:\n${messageText}`);
    return {
      success: true,
      mock: true,
      message: "WhatsApp notification logged (Mock mode)",
    };
  }

  try {
    // Standard Gateway API Call (UltraMsg / Twilio / Meta Cloud API / Custom Gateway)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        to: formattedPhone,
        phone: formattedPhone,
        message: messageText,
        body: messageText,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log(`[WhatsApp Service] Notification sent successfully to ${formattedPhone}`);
      return { success: true, data };
    } else {
      console.error(`[WhatsApp Service] Gateway Error (${response.status}):`, data);
      return { success: false, error: data };
    }
  } catch (err) {
    console.error(`[WhatsApp Service] Failed to dispatch message to ${formattedPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  formatPhoneNumber,
  sendShipmentNotification,
};
