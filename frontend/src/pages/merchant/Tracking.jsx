import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaTruck } from "react-icons/fa";

const Tracking = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return { background: "#dcfce7", color: "#166534" };
      case "IN_TRANSIT":
        return { background: "#dbeafe", color: "#1d4ed8" };
      case "READY_FOR_PICKUP":
        return { background: "#fef3c7", color: "#92400e" };
      case "RTO":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#e2e8f0", color: "#334155" };
    }
  };

  const handleTrack = async () => {
    if (!awb) { alert("Please enter AWB number"); return; }
    try {
      setLoading(true);
      const res = await api.get(`/tracking/${awb}`);
      setShipment(res.data.shipment);
    } catch (error) {
      setShipment(null);
      alert(error?.response?.data?.message || "Shipment Not Found");
    } finally { setLoading(false); }
  };

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "30px", maxWidth: "800px", margin: "0 auto" },
    card: { background: "#ffffff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" },
    input: { width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", marginBottom: "15px", outline: "none" },
    btn: { background: "#f97316", color: "#fff", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer", width: "100%" }
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>

      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "20px" }}>Track Shipment</h1>

        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
            <FaTruck style={{ color: "#f97316", fontSize: "24px" }} />
            <span style={{ fontWeight: "700", color: "#1e293b" }}>Enter AWB Details</span>
          </div>
          <input type="text" placeholder="AWB Number (e.g. AWB12345678)" value={awb} onChange={(e) => setAwb(e.target.value)} style={s.input} />
          <button onClick={handleTrack} disabled={loading} style={s.btn}>{loading ? "Tracking..." : "Track Shipment"}</button>
        </div>

        {shipment && (
          <div style={s.card}>
            <h2 style={{ fontSize: "18px", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Shipment Details</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { l: "AWB", v: shipment.awb },
                { l: "Courier", v: shipment.courier },
                { l: "Status", v: shipment.status, isStatus: true },
                { l: "Customer", v: shipment.orderId?.customerName },
                { l: "Phone", v: shipment.orderId?.customerPhone },
                { l: "Pickup Date", v: shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString() : "Pending" },
                { l: "Delivery Date", v: shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString() : "Not Delivered" },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>{item.l}</p>
                  {item.isStatus ? (
                    <span style={{ ...getStatusStyle(item.v), padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" }}>{item.v}</span>
                  ) : (
                    <p style={{ margin: "5px 0 0 0", fontWeight: "600", color: "#1e293b" }}>{item.v || "N/A"}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "999px", marginTop: "20px" }}>
              <div style={{
                width: shipment.status === "DELIVERED" ? "100%" : shipment.status === "IN_TRANSIT" ? "70%" : shipment.status === "READY_FOR_PICKUP" ? "40%" : "10%",
                height: "100%", background: "#f97316", borderRadius: "999px"
              }} />
            </div>
            {/* Percentage Text */}
            <p style={{ marginTop: "8px", fontSize: "12px", color: "#64748b", textAlign: "right" }}>
              {shipment.status === "DELIVERED"
                ? "100%"
                : shipment.status === "IN_TRANSIT"
                ? "70%"
                : shipment.status === "READY_FOR_PICKUP"
                ? "40%"
                : "10%"} Complete
            </p>
          </div>
        )}

        {shipment?.trackingEvents?.length > 0 && (
          <div style={s.card}>
            <h2 style={{ fontSize: "18px", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>
              Tracking Timeline
            </h2>
            {[...shipment.trackingEvents].reverse().map((event, index) => (
              <div key={index} style={{ padding: "15px", marginBottom: "15px", background: "#f8fafc", borderLeft: "4px solid #f97316", borderRadius: "8px" }}>
                <div style={{ fontWeight: "700", color: "#0f172a" }}>{event.status}</div>
                <div style={{ marginTop: "5px", color: "#475569" }}>{event.remark}</div>
                <div style={{ marginTop: "5px", fontSize: "12px", color: "#94a3b8" }}>📍 {event.location}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracking;