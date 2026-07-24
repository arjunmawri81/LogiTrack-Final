const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d' 
    }
  }
);

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);
