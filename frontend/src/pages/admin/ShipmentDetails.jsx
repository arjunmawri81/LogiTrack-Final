import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const ShipmentDetails = () => {
  const { id } = useParams();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Debugging: Log the ID being fetched
      console.log("Fetching shipment with ID =>", id);
      
      const response = await api.get(`/shipments/${id}`);

      // ✅ Debugging: Log the full response
      console.log("SHIPMENT RESPONSE =>", response.data);
      console.log("SHIPMENT DATA =>", response.data.shipment);

      setShipment(response.data.shipment);
    } catch (error) {
      // ✅ Debugging: Log the full error
      console.log("SHIPMENT ERROR =>", error);
      console.log("ERROR RESPONSE =>", error.response?.data);
      console.log("ERROR STATUS =>", error.response?.status);
      console.log("ERROR MESSAGE =>", error.message);
      
      setError(error.response?.data?.message || "Failed to fetch shipment details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debugging: Log shipment state
  console.log("SHIPMENT STATE =>", shipment);

  if (loading) {
    return (
      <div style={{ padding: "50px", color: "#0f172a" }}>
        Loading Shipment Details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "50px", color: "#0f172a" }}>
        <div style={{ color: "#ef4444", marginBottom: "10px" }}>
          ❌ {error}
        </div>
        <button
          onClick={fetchShipment}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ padding: "50px", color: "#0f172a" }}>
        Shipment not found
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "280px",
          padding: "20px 30px",
        }}
      >
        <AdminTopbar />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#0f172a",
          }}
        >
          🚚 Shipment Details
        </h1>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            color: "#0f172a",
          }}
        >
          <div style={{ marginBottom: "15px", color: "#0f172a" }}>
            <strong>AWB:</strong> {shipment.awb}
          </div>

          <div style={{ marginBottom: "15px", color: "#0f172a" }}>
            <strong>Courier:</strong> {shipment.courier}
          </div>

          <div style={{ marginBottom: "15px", color: "#0f172a" }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                background: "#dbeafe",
                color: "#1e40af",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {shipment.status}
            </span>
          </div>

          <div style={{ marginBottom: "15px", color: "#0f172a" }}>
            <strong>Pickup Date:</strong>{" "}
            {shipment.pickupDate
              ? new Date(shipment.pickupDate).toLocaleString()
              : "Not Scheduled"}
          </div>

          <div style={{ marginBottom: "15px", color: "#0f172a" }}>
            <strong>Delivery Date:</strong>{" "}
            {shipment.deliveryDate
              ? new Date(shipment.deliveryDate).toLocaleString()
              : "Not Delivered"}
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3
            style={{
              marginBottom: "15px",
              color: "#0f172a",
            }}
          >
            📦 Order Information
          </h3>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Order Number:</strong>{" "}
            {shipment.orderId?.orderNumber || "N/A"}
          </div>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Customer:</strong>{" "}
            {shipment.orderId?.customerName || "N/A"}
          </div>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Phone:</strong>{" "}
            {shipment.orderId?.customerPhone || "N/A"}
          </div>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Address:</strong>{" "}
            {shipment.orderId?.customerAddress || "N/A"}
          </div>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Product:</strong>{" "}
            {shipment.orderId?.productName || "N/A"}
          </div>

          <div style={{ marginBottom: "10px", color: "#0f172a" }}>
            <strong>Amount:</strong> ₹
            {shipment.orderId?.amount || 0}
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3
            style={{
              marginBottom: "15px",
              color: "#0f172a",
            }}
          >
            📍 Tracking Timeline
          </h3>

          {shipment.trackingEvents?.length > 0 ? (
            shipment.trackingEvents.map((event, index) => (
              <div
                key={index}
                style={{
                  borderLeft: "3px solid #3b82f6",
                  paddingLeft: "15px",
                  marginBottom: "15px",
                  color: "#0f172a",
                }}
              >
                <div>
                  <strong>{event.status}</strong>
                </div>

                <div>{event.location}</div>

                <div>{event.remark}</div>

                <small style={{ color: "#64748b" }}>
                  {new Date(event.timestamp).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p style={{ color: "#0f172a" }}>
              No Tracking Events Found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;