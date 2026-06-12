import { useState } from "react";
import StaffSidebar from "./StaffSidebar";
import api from "../../services/api";

const Tracking = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackShipment = async () => {
    if (!awb) {
      alert("Please enter AWB");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get(`/tracking/${awb}`);

      setShipment(res.data.shipment || null);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Shipment not found"
      );

      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <StaffSidebar />

      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          🚚 Staff Tracking
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Track shipment using AWB
        </p>

        {/* Search Box */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Enter AWB Number"
            value={awb}
            onChange={(e) =>
              setAwb(e.target.value)
            }
            style={{
              width: "70%",
              padding: "12px",
              marginRight: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <button
            onClick={trackShipment}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {loading ? "Tracking..." : "Track"}
          </button>
        </div>

        {/* Result */}
        {shipment && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3>Shipment Details</h3>

            <p>
              <strong>AWB:</strong>{" "}
              {shipment.awb}
            </p>

            <p>
              <strong>Courier:</strong>{" "}
              {shipment.courier}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {shipment.status}
            </p>

            <p>
              <strong>Pickup Date:</strong>{" "}
              {shipment.pickupDate
                ? new Date(
                    shipment.pickupDate
                  ).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <strong>Delivery Date:</strong>{" "}
              {shipment.deliveryDate
                ? new Date(
                    shipment.deliveryDate
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;