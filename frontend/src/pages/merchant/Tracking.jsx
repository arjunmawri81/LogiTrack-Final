import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Tracking.css";

const Tracking = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!awb) {
      alert("Please enter AWB number");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/tracking/${awb}`
      );

      setShipment(response.data.shipment);
    } catch (error) {
      setShipment(null);

      alert(
        error?.response?.data?.message ||
          "Shipment Not Found"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="tracking-container">
        <h1>Track Shipment</h1>

        {/* INPUT BOX */}
        <div className="tracking-card">
          <input
            type="text"
            placeholder="Enter AWB Number (e.g. AWB12345678)"
            value={awb}
            onChange={(e) =>
              setAwb(e.target.value)
            }
          />

          <button
            onClick={handleTrack}
            disabled={loading}
          >
            {loading
              ? "Tracking..."
              : "Track Shipment"}
          </button>
        </div>

        {/* RESULT */}
        {shipment && (
          <div className="tracking-result">
            <h2>Shipment Details</h2>

            <div className="status-box">
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
                <span
                  style={{
                    padding:
                      "5px 10px",
                    borderRadius:
                      "999px",
                    background:
                      shipment.status ===
                      "DELIVERED"
                        ? "#dcfce7"
                        : shipment.status ===
                          "IN_TRANSIT"
                        ? "#dbeafe"
                        : "#fef3c7",
                    color:
                      shipment.status ===
                      "DELIVERED"
                        ? "#15803d"
                        : shipment.status ===
                          "IN_TRANSIT"
                        ? "#2563eb"
                        : "#d97706",
                    fontWeight: "600",
                  }}
                >
                  {shipment.status}
                </span>
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(
                  shipment.createdAt
                ).toLocaleDateString()}
              </p>

              {/* Order Info */}
              <p>
                <strong>Customer:</strong>{" "}
                {shipment.orderId
                  ?.customerName || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {shipment.orderId
                  ?.customerPhone || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!shipment && !loading && (
          <p
            style={{
              marginTop: "20px",
              color: "#64748b",
            }}
          >
            Enter AWB number to track shipment
          </p>
        )}
      </div>
    </div>
  );
};

export default Tracking;