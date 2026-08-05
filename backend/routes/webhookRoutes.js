/**
 * webhookRoutes.js
 * ─────────────────
 * Receives real-time order events from Shopify and WooCommerce.
 * Mounted at:  /api/webhooks
 *
 * Routes:
 *   POST /api/webhooks/shopify/orders-create   ← Shopify "orders/create" topic
 *   POST /api/webhooks/woocommerce/orders-create ← WooCommerce "order.created" topic
 */

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const Channel = require("../models/Channel");

// ─────────────────────────────────────────────────────────────
// HELPER: Verify Shopify HMAC signature
// ─────────────────────────────────────────────────────────────
function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!secret || !hmacHeader) return false;
  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER: Map Shopify order data → LogiTrack Order fields
// ─────────────────────────────────────────────────────────────
function mapShopifyOrder(sOrder, merchantId) {
  const customer = sOrder.customer || {};
  const shipping = sOrder.shipping_address || sOrder.billing_address || {};
  const items = (sOrder.line_items || []).map((item) => ({
    name: item.name || item.title || "Product Item",
    quantity: item.quantity || 1,
    price: parseFloat(item.price || 0),
  }));

  return {
    merchantId,
    orderNumber: `SHOPIFY-${sOrder.order_number || sOrder.id}`,
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
  };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Map WooCommerce order data → LogiTrack Order fields
// ─────────────────────────────────────────────────────────────
function mapWooOrder(wOrder, merchantId) {
  const shipping = wOrder.shipping || wOrder.billing || {};
  const items = (wOrder.line_items || []).map((item) => ({
    name: item.name || "Product Item",
    quantity: item.quantity || 1,
    price: parseFloat(item.price || 0),
  }));

  return {
    merchantId,
    orderNumber: `WOO-${wOrder.number || wOrder.id}`,
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
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/shopify/orders-create
// Shopify sends raw JSON body; HMAC in X-Shopify-Hmac-Sha256
// ─────────────────────────────────────────────────────────────
router.post(
  "/shopify/orders-create",
  express.raw({ type: "application/json" }), // raw body for HMAC verification
  async (req, res) => {
    try {
      const shopDomain = req.headers["x-shopify-shop-domain"] || "";
      const hmacHeader = req.headers["x-shopify-hmac-sha256"] || "";
      const rawBody = req.body; // Buffer

      console.log(`[Webhook] Shopify order create received from ${shopDomain}`);

      // Find channel by store domain
      const normalizedDomain = shopDomain.toLowerCase().replace(/\/$/, "");
      const channel = await Channel.findOne({
        channelName: "SHOPIFY",
        storeUrl: { $regex: normalizedDomain, $options: "i" },
        isActive: true,
      });

      // Verify HMAC if webhook secret configured in env
      const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
      if (webhookSecret && !verifyShopifyHmac(rawBody, hmacHeader, webhookSecret)) {
        console.warn("[Webhook] Shopify HMAC verification failed");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const sOrder = JSON.parse(rawBody.toString());

      if (!channel) {
        console.warn(`[Webhook] No channel found for Shopify domain: ${shopDomain}`);
        return res.status(200).json({ success: true, message: "Channel not found — order ignored" });
      }

      const orderNum = `SHOPIFY-${sOrder.order_number || sOrder.id}`;
      const existing = await Order.findOne({ merchantId: channel.merchantId, orderNumber: orderNum });

      if (existing) {
        console.log(`[Webhook] Shopify order ${orderNum} already exists — skip`);
        return res.status(200).json({ success: true, message: "Duplicate — already exists" });
      }

      const orderData = mapShopifyOrder(sOrder, channel.merchantId);
      await Order.create(orderData);

      console.log(`[Webhook] Shopify order ${orderNum} saved for merchant ${channel.merchantId}`);
      return res.status(200).json({ success: true, message: `Order ${orderNum} imported` });
    } catch (err) {
      console.error("[Webhook] Shopify orders-create error:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/woocommerce/orders-create
// WooCommerce sends JSON; optional secret in X-WC-Webhook-Signature
// ─────────────────────────────────────────────────────────────
router.post("/woocommerce/orders-create", express.json(), async (req, res) => {
  try {
    const wOrder = req.body;
    const sourceDomain = req.headers["x-wc-webhook-source"] || "";

    console.log(`[Webhook] WooCommerce order create received from ${sourceDomain}`);

    // Find channel by store domain
    const channel = await Channel.findOne({
      channelName: "WOOCOMMERCE",
      storeUrl: { $regex: sourceDomain.replace(/^https?:\/\//, ""), $options: "i" },
      isActive: true,
    });

    if (!channel) {
      console.warn(`[Webhook] No WooCommerce channel found for domain: ${sourceDomain}`);
      return res.status(200).json({ success: true, message: "Channel not found — order ignored" });
    }

    const orderNum = `WOO-${wOrder.number || wOrder.id}`;
    const existing = await Order.findOne({ merchantId: channel.merchantId, orderNumber: orderNum });

    if (existing) {
      console.log(`[Webhook] WooCommerce order ${orderNum} already exists — skip`);
      return res.status(200).json({ success: true, message: "Duplicate — already exists" });
    }

    const orderData = mapWooOrder(wOrder, channel.merchantId);
    await Order.create(orderData);

    console.log(`[Webhook] WooCommerce order ${orderNum} saved for merchant ${channel.merchantId}`);
    return res.status(200).json({ success: true, message: `Order ${orderNum} imported` });
  } catch (err) {
    console.error("[Webhook] WooCommerce orders-create error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
