import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const res = await api.get(`/shipments/${id}`);

      setShipment(
        res.data.shipment ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#16a34a";
      case "RTO":
        return "#dc2626";
      case "NDR":
        return "#f59e0b";
      default:
        return "#2563eb";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading Shipment...</h2>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Shipment Not Found</h2>
      </div>
    );
  }

  const order = shipment.orderId || {};

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "280px",
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "25px",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              Shipment Details
            </h1>

            <p
              style={{
                color: "#64748b",
                marginTop: "8px",
              }}
            >
              AWB : {shipment.awb}
            </p>
          </div>

          <button
            onClick={() => navigate("/merchant/shipments")}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>

        {/* Shipment Information */}

        <div style={card}>
          <h2 style={title}>Shipment Information</h2>

          <p><b>AWB:</b> {shipment.awb}</p>
          <p><b>Courier:</b> {shipment.courier}</p>

          <p>
            <b>Status:</b>{" "}
            <span
              style={{
                color: statusColor(shipment.status),
                fontWeight: "700",
              }}
            >
              {shipment.status}
            </span>
          </p>

          <p>
            <b>Created:</b>{" "}
            {shipment.createdAt
              ? new Date(
                  shipment.createdAt
                ).toLocaleString()
              : "-"}
          </p>
        </div>

        {/* Customer Details */}

        <div style={card}>
          <h2 style={title}>Customer Details</h2>

          <p>
            <b>Name:</b>{" "}
            {order.customerName || "-"}
          </p>

          <p>
            <b>Phone:</b>{" "}
            {order.customerPhone || "-"}
          </p>

          <p>
            <b>Email:</b>{" "}
            {order.customerEmail || "-"}
          </p>

          <p>
            <b>Address:</b>{" "}
            {order.customerAddress || "-"}
          </p>

          <p>
            {order.city} {order.state}{" "}
            {order.pincode}
          </p>
        </div>

        {/* Product Details */}

        <div style={card}>
          <h2 style={title}>Product Details</h2>

          <p>
            <b>Product:</b>{" "}
            {order.productName || "-"}
          </p>

          <p>
            <b>SKU:</b> {order.sku || "-"}
          </p>

          <p>
            <b>Quantity:</b>{" "}
            {order.quantity || "-"}
          </p>

          <p>
            <b>Weight:</b>{" "}
            {order.weight || "-"} KG
          </p>
        </div>

        {/* Tracking */}

        <div style={card}>
          <h2 style={title}>Tracking Details</h2>

          <p>
            <b>Pickup Date:</b>{" "}
            {shipment.pickupDate
              ? new Date(
                  shipment.pickupDate
                ).toLocaleDateString()
              : "Pending"}
          </p>

          <p>
            <b>Delivery Date:</b>{" "}
            {shipment.deliveryDate
              ? new Date(
                  shipment.deliveryDate
                ).toLocaleDateString()
              : "Pending"}
          </p>
        </div>

        {/* Downloads */}

        <div style={card}>
          <h2 style={title}>Downloads</h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button style={btnBlue}>
              Download Label
            </button>

            <button style={btnGreen}>
              View QR
            </button>
          </div>
        </div>

        {/* Timeline */}

        <div style={card}>
          <h2 style={title}>Tracking Timeline</h2>

          {shipment.trackingEvents?.length >
          0 ? (
            shipment.trackingEvents.map(
              (event, index) => (
                <div
                  key={index}
                  style={{
                    borderLeft:
                      "3px solid #f97316",
                    paddingLeft: "15px",
                    marginBottom: "18px",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: "#0f172a",
                    }}
                  >
                    {event.status}
                  </h4>

                  <p
                    style={{
                      margin: "5px 0",
                      color: "#64748b",
                    }}
                  >
                    {event.remark}
                  </p>

                  <small
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {event.location}
                  </small>
                </div>
              )
            )
          ) : (
            <p>No Tracking Events</p>
          )}
        </div>
      </div>
    </div>
  );
};

const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "20px",
};

const title = {
  marginBottom: "15px",
  color: "#0f172a",
};

const btnBlue = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  cursor: "pointer",
};

const btnGreen = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  cursor: "pointer",
};

export default ShipmentDetails;