const mongoose = require('mongoose');

const codSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SETTLED', 'CANCELLED'],
    default: 'PENDING'
  },
  settlementDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.COD || mongoose.model('COD', codSchema);