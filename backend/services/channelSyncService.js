/**
 * channelSyncService.js
 * ─────────────────────
 * Handles Two-Way Sync — pushes fulfillment / delivery status
 * from LogiTrack back to Shopify and WooCommerce.
 *
 * TRIGGER POINTS (called from shipmentController.js):
 *  1. After Shipment.create() + AWB assigned  →  triggerChannelSync(order, shipment, "SHIPPED")
 *  2. After tracking update marks "DELIVERED"  →  triggerChannelSync(order, shipment, "DELIVERED")
 */

const axios = require("axios");
const Channel = require("../models/Channel");
const SyncLog = require("../models/SyncLog");

// ─────────────────────────────────────
// INTERNAL: Save a sync log entry
// ─────────────────────────────────────
async function saveSyncLog(data) {
  try {
    await SyncLog.create(data);
  } catch (err) {
    console.error("[SyncLog] Failed to write log:", err.message);
  }
}

// ─────────────────────────────────────
// SHOPIFY: Push Fulfillment
// ─────────────────────────────────────
async function syncFulfillmentToShopify(order, shipment, channel) {
  try {
    // Extract the original Shopify order ID from the order number
    // Order number format stored by channelController: SHOPIFY-{order_number}
    const rawNum = order.orderNumber || "";
    const shopifyOrderNum = rawNum.startsWith("SHOPIFY-")
      ? rawNum.replace("SHOPIFY-", "")
      : null;

    if (!shopifyOrderNum) {
      throw new Error(`Order ${order.orderNumber} has no Shopify order number`);
    }

    let domain = (channel.storeUrl || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (!domain.includes(".")) {
      domain = `${domain}.myshopify.com`;
    }

    const trackingUrl = `https://logitrack.app/tracking/${shipment.awb}`;
    const fulfillmentPayload = {
      fulfillment: {
        tracking_number: shipment.awb,
        tracking_company: shipment.courier || "LogiTrack",
        tracking_url: trackingUrl,
        notify_customer: true,
        line_items: [], // empty = fulfil all items
      },
    };

    const response = await axios.post(
      `https://${domain}/admin/api/2023-10/orders/${shopifyOrderNum}/fulfillments.json`,
      fulfillmentPayload,
      {
        headers: {
          "X-Shopify-Access-Token": channel.accessToken,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );

    await saveSyncLog({
      orderId: order._id,
      shipmentId: shipment._id,
      channel: "SHOPIFY",
      channelOrderId: shopifyOrderNum,
      event: "FULFILLMENT_CREATED",
      status: "SUCCESS",
      payload: fulfillmentPayload,
      response: response.data,
    });

    console.log(`[TwoWaySync] ✅ Shopify fulfillment pushed for order ${order.orderNumber}`);
    return { success: true, channelOrderId: shopifyOrderNum };
  } catch (err) {
    const errMsg = err?.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;

    await saveSyncLog({
      orderId: order._id,
      shipmentId: shipment._id,
      channel: "SHOPIFY",
      event: "FULFILLMENT_FAILED",
      status: "FAILED",
      errorMessage: errMsg,
      retryCount: 0,
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // retry in 5 min
    });

    console.error(`[TwoWaySync] ❌ Shopify sync failed for ${order.orderNumber}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

// ─────────────────────────────────────
// SHOPIFY: Push Delivery Complete
// ─────────────────────────────────────
async function syncDeliveryToShopify(order, shipment, channel) {
  // Shopify marks fulfillment as "success" automatically when
  // the carrier confirms delivery via webhook (if carrier-calculated).
  // For our system, we just log — Shopify fulfillment status is
  // already set to "success" by the fulfillment create endpoint.
  await saveSyncLog({
    orderId: order._id,
    shipmentId: shipment._id,
    channel: "SHOPIFY",
    event: "DELIVERY_NOTED",
    status: "SUCCESS",
    response: { note: "Shopify fulfillment already marked success on AWB creation" },
  });
  console.log(`[TwoWaySync] ✅ Shopify delivery noted (no extra API needed) for ${order.orderNumber}`);
  return { success: true };
}

// ─────────────────────────────────────
// WOOCOMMERCE: Push Status Update
// ─────────────────────────────────────
async function syncFulfillmentToWooCommerce(order, shipment, channel, event = "SHIPPED") {
  try {
    const rawNum = order.orderNumber || "";
    const wooOrderNum = rawNum.startsWith("WOO-")
      ? rawNum.replace("WOO-", "")
      : null;

    if (!wooOrderNum) {
      throw new Error(`Order ${order.orderNumber} has no WooCommerce order number`);
    }

    let domain = (channel.storeUrl || "").trim();
    if (!domain.startsWith("http")) {
      domain = `https://${domain}`;
    }
    domain = domain.replace(/\/$/, "");

    const wooStatus = event === "DELIVERED" ? "completed" : "on-hold"; // "on-hold" = Shipped in many WooCommerce setups; can also be a custom status like "shipped"

    // Primary status update
    const updatePayload = { status: wooStatus };
    const authString = Buffer.from(`${channel.apiKey}:${channel.apiSecret}`).toString("base64");

    const response = await axios.put(
      `${domain}/wp-json/wc/v3/orders/${wooOrderNum}`,
      updatePayload,
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );

    // Also attempt Shipment Tracking plugin meta update (if plugin installed)
    try {
      await axios.post(
        `${domain}/wp-json/wc/v3/orders/${wooOrderNum}/shipment-trackings`,
        {
          tracking_provider: shipment.courier || "LogiTrack",
          tracking_number: shipment.awb,
          date_shipped: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );
    } catch {
      // Shipment tracking plugin optional — ignore 404/401 gracefully
    }

    await saveSyncLog({
      orderId: order._id,
      shipmentId: shipment._id,
      channel: "WOOCOMMERCE",
      channelOrderId: wooOrderNum,
      event: event === "DELIVERED" ? "DELIVERY_UPDATED" : "FULFILLMENT_CREATED",
      status: "SUCCESS",
      payload: updatePayload,
      response: { id: response.data?.id, status: response.data?.status },
    });

    console.log(`[TwoWaySync] ✅ WooCommerce ${event} status pushed for order ${order.orderNumber}`);
    return { success: true, channelOrderId: wooOrderNum };
  } catch (err) {
    const errMsg = err?.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;

    await saveSyncLog({
      orderId: order._id,
      shipmentId: shipment._id,
      channel: "WOOCOMMERCE",
      event: "FULFILLMENT_FAILED",
      status: "FAILED",
      errorMessage: errMsg,
      retryCount: 0,
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.error(`[TwoWaySync] ❌ WooCommerce sync failed for ${order.orderNumber}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

// ─────────────────────────────────────
// MAIN TRIGGER: Called from shipmentController
// event = "SHIPPED" | "DELIVERED"
// ─────────────────────────────────────
async function triggerChannelSync(order, shipment, event = "SHIPPED") {
  try {
    const orderNum = order.orderNumber || "";

    // Detect source channel
    let channelType = null;
    if (orderNum.startsWith("SHOPIFY-")) channelType = "SHOPIFY";
    else if (orderNum.startsWith("WOO-")) channelType = "WOOCOMMERCE";

    if (!channelType) {
      // Not a channel order — skip silently
      return;
    }

    // Find the merchant's channel config for this store type
    const channel = await Channel.findOne({
      merchantId: order.merchantId,
      channelName: channelType,
      isActive: true,
    });

    if (!channel) {
      console.warn(`[TwoWaySync] No active ${channelType} channel for merchant ${order.merchantId}`);
      return;
    }

    if (channelType === "SHOPIFY") {
      if (event === "DELIVERED") {
        await syncDeliveryToShopify(order, shipment, channel);
      } else {
        await syncFulfillmentToShopify(order, shipment, channel);
      }
    } else if (channelType === "WOOCOMMERCE") {
      await syncFulfillmentToWooCommerce(order, shipment, channel, event);
    }
  } catch (err) {
    console.error("[TwoWaySync] Unexpected error in triggerChannelSync:", err.message);
  }
}

// ─────────────────────────────────────
// RETRY MECHANISM: Run pending failed syncs
// Called by a background job or admin-triggered retry
// ─────────────────────────────────────
async function retryFailedSyncs() {
  try {
    const failedLogs = await SyncLog.find({
      status: "FAILED",
      retryCount: { $lt: 3 },
      nextRetryAt: { $lte: new Date() },
    }).limit(20);

    for (const log of failedLogs) {
      try {
        const Order = require("../models/Order");
        const Shipment = require("../models/Shipment");

        const order = await Order.findById(log.orderId);
        const shipment = await Shipment.findById(log.shipmentId);

        if (!order || !shipment) {
          await SyncLog.findByIdAndUpdate(log._id, {
            status: "PERMANENTLY_FAILED",
            errorMessage: "Order or Shipment not found during retry",
          });
          continue;
        }

        await triggerChannelSync(order, shipment, "SHIPPED");

        const retryIntervals = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000];
        const nextInterval = retryIntervals[log.retryCount] || 60 * 60 * 1000;

        await SyncLog.findByIdAndUpdate(log._id, {
          retryCount: log.retryCount + 1,
          nextRetryAt: new Date(Date.now() + nextInterval),
          status: log.retryCount >= 2 ? "PERMANENTLY_FAILED" : "FAILED",
        });
      } catch (retryErr) {
        console.error(`[TwoWaySync] Retry failed for log ${log._id}:`, retryErr.message);
      }
    }
  } catch (err) {
    console.error("[TwoWaySync] retryFailedSyncs error:", err.message);
  }
}

module.exports = {
  triggerChannelSync,
  retryFailedSyncs,
  syncFulfillmentToShopify,
  syncFulfillmentToWooCommerce,
};
