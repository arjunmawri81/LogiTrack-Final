const Channel = require("../models/Channel");
const Order = require("../models/Order");

// Get all connected channels for merchant
const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ merchantId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, channels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Connect a new store channel
const connectChannel = async (req, res) => {
  try {
    const { channelName, storeName, storeUrl, apiKey, apiSecret, accessToken } = req.body;

    if (!channelName || !storeName || !storeUrl) {
      return res.status(400).json({
        success: false,
        message: "Channel Name, Store Name, and Store URL are required",
      });
    }

    const existing = await Channel.findOne({
      merchantId: req.user.id,
      storeUrl: storeUrl.trim().toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This store URL is already connected to your account",
      });
    }

    const channel = await Channel.create({
      merchantId: req.user.id,
      channelName,
      storeName,
      storeUrl: storeUrl.trim().toLowerCase(),
      apiKey: apiKey || "",
      apiSecret: apiSecret || "",
      accessToken: accessToken || "",
      isActive: true,
      autoSync: true,
      lastSyncedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `${channelName} store '${storeName}' connected successfully`,
      channel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle auto-sync for a channel
const toggleAutoSync = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id, merchantId: req.user.id });
    if (!channel) return res.status(404).json({ success: false, message: "Channel not found" });

    channel.autoSync = !channel.autoSync;
    await channel.save();

    res.status(200).json({ success: true, channel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Trigger manual order sync from store
const syncChannelOrders = async (req, res) => {
  try {
    const channel = await Channel.findOne({ _id: req.params.id, merchantId: req.user.id });
    if (!channel) return res.status(404).json({ success: false, message: "Channel not found" });

    channel.lastSyncedAt = new Date();
    await channel.save();

    // Create a demo order from synced store
    const sampleOrderNumber = `${channel.channelName.substring(0, 3)}-${Date.now().toString().slice(-6)}`;
    const newOrder = await Order.create({
      merchantId: req.user.id,
      orderNumber: sampleOrderNumber,
      customerName: "Auto Synced Customer",
      customerPhone: "9876543210",
      customerEmail: "customer@store.com",
      customerAddress: "Flat 101, Tech Park Road",
      customerCity: "Bengaluru",
      customerState: "Karnataka",
      customerPincode: "560001",
      weight: 1.2,
      dimensions: { length: 20, breadth: 15, height: 10 },
      paymentMode: "PREPAID",
      amount: 1499,
      status: "NEW",
      items: [
        {
          name: `${channel.storeName} Item`,
          quantity: 1,
          price: 1499,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Orders synced from ${channel.storeName}! Created order #${newOrder.orderNumber}`,
      syncedCount: 1,
      lastSyncedAt: channel.lastSyncedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disconnect/Delete channel
const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findOneAndDelete({ _id: req.params.id, merchantId: req.user.id });
    if (!channel) return res.status(404).json({ success: false, message: "Channel not found" });

    res.status(200).json({ success: true, message: "Store disconnected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChannels,
  connectChannel,
  toggleAutoSync,
  syncChannelOrders,
  deleteChannel,
};
