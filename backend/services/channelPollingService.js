/**
 * channelPollingService.js
 * ─────────────────────────
 * Cron-based auto-polling safety net.
 *
 * Runs every 15 minutes → fetches new orders from all active
 * channels (where autoSync: true) automatically, even if
 * webhooks are not yet registered or miss an event.
 *
 * Also runs the SyncLog retry job every hour.
 *
 * Usage: call startChannelPolling() once in server.js after DB connects.
 */

const cron = require("node-cron");
const axios = require("axios");
const Channel = require("../models/Channel");
const Order = require("../models/Order");
const { retryFailedSyncs } = require("./channelSyncService");

// ─────────────────────────────────────────────────────────────
// HELPER: fetch + save new orders from a Shopify channel
// ─────────────────────────────────────────────────────────────
async function pollShopifyChannel(channel) {
  try {
    let domain = (channel.storeUrl || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (!domain.includes(".")) domain = `${domain}.myshopify.com`;

    const url = `https://${domain}/admin/api/2023-10/orders.json?status=any&limit=20`;
    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": channel.accessToken,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    });

    const orders = response.data?.orders || [];
    let newCount = 0;

    for (const sOrder of orders) {
      const orderNum = `SHOPIFY-${sOrder.order_number || sOrder.id}`;
      const exists = await Order.findOne({ merchantId: channel.merchantId, orderNumber: orderNum });
      if (exists) continue;

      const customer = sOrder.customer || {};
      const shipping = sOrder.shipping_address || sOrder.billing_address || {};
      const items = (sOrder.line_items || []).map((item) => ({
        name: item.name || item.title || "Product Item",
        quantity: item.quantity || 1,
        price: parseFloat(item.price || 0),
      }));

      await Order.create({
        merchantId: channel.merchantId,
        orderNumber: orderNum,
        customerName: `${shipping.first_name || customer.first_name || "Shopify"} ${shipping.last_name || customer.last_name || "Customer"}`.trim(),
        customerPhone: shipping.phone || customer.phone || "9876543210",
        customerEmail: sOrder.email || customer.email || "customer@shopify.com",
        customerAddress: `${shipping.address1 || "Address Line 1"} ${shipping.address2 || ""}`.trim(),
        customerCity: shipping.city || "Bengaluru",
        customerState: shipping.province || "Karnataka",
        customerPincode: shipping.zip || "560001",
        weight: parseFloat(sOrder.total_weight ? sOrder.total_weight / 1000 : 0.5),
        dimensions: { length: 15, breadth: 10, height: 5 },
        paymentMode: sOrder.financial_status === "paid" ? "PREPAID" : "COD",
        amount: parseFloat(sOrder.total_price || 0),
        status: "NEW",
        items: items.length > 0 ? items : [{ name: "Shopify Order Item", quantity: 1, price: parseFloat(sOrder.total_price || 0) }],
        channelSource: "SHOPIFY",
        channelOrderId: String(sOrder.id || sOrder.order_number || ""),
        channelSyncStatus: "PENDING",
      });
      newCount++;
    }

    if (newCount > 0) {
      console.log(`[AutoPoll] Shopify '${channel.storeName}': ${newCount} new order(s) imported`);
    }

    // Update lastSyncedAt
    await Channel.findByIdAndUpdate(channel._id, { lastSyncedAt: new Date() });
  } catch (err) {
    console.log(`[AutoPoll] Shopify '${channel.storeName}' poll error: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER: fetch + save new orders from a WooCommerce channel
// ─────────────────────────────────────────────────────────────
async function pollWooCommerceChannel(channel) {
  try {
    let domain = (channel.storeUrl || "").trim();
    if (!domain.startsWith("http")) domain = `https://${domain}`;
    domain = domain.replace(/\/$/, "");

    const url = `${domain}/wp-json/wc/v3/orders?consumer_key=${channel.apiKey}&consumer_secret=${channel.apiSecret}&per_page=20`;
    const response = await axios.get(url, { timeout: 12000 });

    const orders = Array.isArray(response.data) ? response.data : [];
    let newCount = 0;

    for (const wOrder of orders) {
      const orderNum = `WOO-${wOrder.number || wOrder.id}`;
      const exists = await Order.findOne({ merchantId: channel.merchantId, orderNumber: orderNum });
      if (exists) continue;

      const shipping = wOrder.shipping || wOrder.billing || {};
      const items = (wOrder.line_items || []).map((item) => ({
        name: item.name || "Product Item",
        quantity: item.quantity || 1,
        price: parseFloat(item.price || 0),
      }));

      await Order.create({
        merchantId: channel.merchantId,
        orderNumber: orderNum,
        customerName: `${shipping.first_name || "Woo"} ${shipping.last_name || "Customer"}`.trim(),
        customerPhone: shipping.phone || "9876543210",
        customerEmail: wOrder.billing?.email || "customer@woo.com",
        customerAddress: `${shipping.address_1 || "Address Line 1"} ${shipping.address_2 || ""}`.trim(),
        customerCity: shipping.city || "Mumbai",
        customerState: shipping.state || "Maharashtra",
        customerPincode: shipping.postcode || "400001",
        weight: 0.5,
        dimensions: { length: 15, breadth: 10, height: 5 },
        paymentMode: wOrder.payment_method === "cod" ? "COD" : "PREPAID",
        amount: parseFloat(wOrder.total || 0),
        status: "NEW",
        items: items.length > 0 ? items : [{ name: "WooCommerce Order Item", quantity: 1, price: parseFloat(wOrder.total || 0) }],
        channelSource: "WOOCOMMERCE",
        channelOrderId: String(wOrder.id || wOrder.number || ""),
        channelSyncStatus: "PENDING",
      });
      newCount++;
    }

    if (newCount > 0) {
      console.log(`[AutoPoll] WooCommerce '${channel.storeName}': ${newCount} new order(s) imported`);
    }

    await Channel.findByIdAndUpdate(channel._id, { lastSyncedAt: new Date() });
  } catch (err) {
    console.log(`[AutoPoll] WooCommerce '${channel.storeName}' poll error: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN POLLING JOB
// Runs every 15 minutes — staggered per channel to avoid
// hitting API rate limits simultaneously
// ─────────────────────────────────────────────────────────────
async function runPollingCycle() {
  try {
    console.log("[AutoPoll] Starting polling cycle...");
    const channels = await Channel.find({ isActive: true, autoSync: true });

    let delay = 0;
    for (const channel of channels) {
      // Stagger each channel by 2 seconds to avoid API rate limits
      setTimeout(async () => {
        if (channel.channelName === "SHOPIFY" && channel.accessToken) {
          await pollShopifyChannel(channel);
        } else if (channel.channelName === "WOOCOMMERCE" && channel.apiKey && channel.apiSecret) {
          await pollWooCommerceChannel(channel);
        }
      }, delay);
      delay += 2000;
    }

    console.log(`[AutoPoll] Cycle queued for ${channels.length} channel(s)`);
  } catch (err) {
    console.error("[AutoPoll] Polling cycle error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// START ALL CRON JOBS
// Called once from server.js after DB connection
// ─────────────────────────────────────────────────────────────
function startChannelPolling() {
  // Auto-poll every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    console.log("[Cron] Auto-poll triggered (every 15 min)");
    runPollingCycle();
  });

  // Retry failed Two-Way syncs every hour
  cron.schedule("0 * * * *", () => {
    console.log("[Cron] SyncLog retry job triggered (every 1 hr)");
    retryFailedSyncs().catch(err => console.error("[Cron] retryFailedSyncs error:", err.message));
  });

  console.log("[Cron] Channel polling cron jobs started (15-min poll + 1-hr retry)");
}

module.exports = { startChannelPolling, runPollingCycle };
