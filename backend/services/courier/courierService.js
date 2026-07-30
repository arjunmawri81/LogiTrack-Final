const createShipment = async (courier, orderData) => {
  if (!courier) {
    throw new Error("Courier not found");
  }

  switch (courier.code) {
    case "SHIPROCKET":
      return require("./shiprocketService").createShipment(orderData);

    case "DELHIVERY":
      return require("./delhiveryService").createShipment(orderData);

    case "XPRESSBEES":
      return require("./xpressbeesService").createShipment(orderData);

    default:
      throw new Error("Courier API not implemented");
  }
};

module.exports = {
  createShipment,
};