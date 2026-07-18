// ORDER_STATUSES — used only on Order model
const ORDER_STATUSES = [
  "NEW",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "NDR",
  "RTO",
  "CANCELLED"
];

// SHIPMENT_STATUSES — used only on Shipment model
const SHIPMENT_STATUSES = [
  "PICKUP_PENDING",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "NDR",
  "RTO",
  "RTO_INITIATED",      // ✅ Added — used by Shipment.updateRTO("INITIATED")
  "RTO_IN_TRANSIT",     // ✅ Added — used by Shipment.updateRTO("IN_TRANSIT")
  "RTO_COMPLETED",      // ✅ Added — used by Shipment.updateRTO("COMPLETED") and isCompleted()
  "CANCELLED"
];

// Maps shipment status → order status
const ORDER_STATUS_MAP = {
  PICKUP_PENDING: "READY_FOR_PICKUP",
  PICKUP_SCHEDULED: "READY_FOR_PICKUP",
  PICKED_UP: "SHIPPED",
  IN_TRANSIT: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  NDR: "NDR",
  RTO: "RTO",
  RTO_INITIATED: "RTO",     // ✅ Added
  RTO_IN_TRANSIT: "RTO",    // ✅ Added
  RTO_COMPLETED: "RTO",     // ✅ Added
  CANCELLED: "CANCELLED"
};

module.exports = {
  ORDER_STATUSES,
  SHIPMENT_STATUSES,
  ORDER_STATUS_MAP
};
