import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Serviceability.css"; 

const Serviceability = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [result, setResult] = useState(null);

  const checkServiceability = () => {
    if (!pickup || !delivery) { 
      alert("Please enter both pincodes"); 
      return; 
    }
    setResult({
      serviceable: true,
      estimatedDays: 3,
      couriers: ["Delhivery", "DTDC", "XpressBees"],
    });
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
          <button onClick={checkServiceability} className="serviceability-btn">
            Check Availability
          </button>
        </div>

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