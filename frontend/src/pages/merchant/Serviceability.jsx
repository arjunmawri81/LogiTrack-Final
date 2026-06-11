import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const Serviceability = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [result, setResult] = useState(null);

  const checkServiceability = () => {
    if (!pickup || !delivery) { alert("Please enter both pincodes"); return; }
    setResult({
      serviceable: true,
      estimatedDays: 3,
      couriers: ["Delhivery", "DTDC", "XpressBees"],
    });
  };

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "30px" },
    card: { background: "#ffffff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", maxWidth: "600px" },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", marginBottom: "15px", fontSize: "14px" },
    btn: { background: "#f97316", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer", width: "100%" }
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>

      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "20px" }}>📍 Serviceability Checker</h1>

        <div style={s.card}>
          <input type="text" placeholder="Pickup Pincode" value={pickup} onChange={(e) => setPickup(e.target.value)} style={s.input} />
          <input type="text" placeholder="Delivery Pincode" value={delivery} onChange={(e) => setDelivery(e.target.value)} style={s.input} />
          <button onClick={checkServiceability} style={s.btn}>Check Availability</button>
        </div>

        {result && (
          <div style={{ ...s.card, marginTop: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Serviceable: {result.serviceable ? "✅ Yes" : "❌ No"}</h3>
            <p style={{ color: "#475569" }}>Estimated Delivery: <strong>{result.estimatedDays} Days</strong></p>
            <h4 style={{ margin: "20px 0 10px 0" }}>Available Couriers</h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {result.couriers.map((c) => (
                <span key={c} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Serviceability;