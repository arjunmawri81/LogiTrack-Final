import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Serviceability.css";

const Serviceability = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkServiceability = async () => {
    if (!pickup || !delivery) {
      alert("Please enter both pincodes");
      return;
    }
    if (!/^\d{6}$/.test(pickup) || !/^\d{6}$/.test(delivery)) {
      alert("Please enter valid 6-digit pincodes");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.get(`/ratecards/serviceability/${delivery}`);
      setResult({
        serviceable: res.data.couriers.length > 0,
        estimatedDays: res.data.couriers[0]?.estimatedDays || 3,
        couriers: res.data.couriers.map((c) => c.courierName),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to check serviceability. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="serviceability-container">
      <div className="serviceability-sidebar">
        <Sidebar />
      </div>

      <main className="serviceability-main">
        <h1 className="serviceability-title">📍 Serviceability Checker</h1>

        <div className="serviceability-card">
          <input
            type="text"
            placeholder="Pickup Pincode"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="serviceability-input"
          />
          <input
            type="text"
            placeholder="Delivery Pincode"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="serviceability-input"
          />
          <button
            onClick={checkServiceability}
            className="serviceability-btn"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Availability"}
          </button>
        </div>

        {error && (
          <div className="serviceability-result">
            <p style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ {error}</p>
          </div>
        )}

        {result && (
          <div className="serviceability-result">
            <h3 className="serviceability-result-title">
              Serviceable: {result.serviceable ? "✅ Yes" : "❌ No"}
            </h3>
            <p className="serviceability-result-text">
              Estimated Delivery: <strong>{result.estimatedDays} Days</strong>
            </p>
            <h4 className="serviceability-courier-title">Available Couriers</h4>
            <div className="serviceability-couriers">
              {result.couriers.map((c) => (
                <span key={c} className="serviceability-courier-badge">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Serviceability;