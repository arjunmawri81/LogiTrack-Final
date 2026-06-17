import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const RateCalculator = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [weight, setWeight] = useState("");
  const [rates, setRates] = useState(null);

  const calculateRates = () => {
    if (!pickup || !delivery || !weight) {
      alert("Please fill all fields");
      return;
    }

    setRates([
      {
        courier: "Delhivery",
        price: 120,
        days: 3,
      },
      {
        courier: "DTDC",
        price: 135,
        days: 4,
      },
      {
        courier: "XpressBees",
        price: 110,
        days: 5,
      },
    ]);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "280px",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Rate Calculator
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Calculate courier shipping rates instantly
          </p>
        </div>

        {/* Calculator Card */}
        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "15px",
            }}
          >
            <input
              type="text"
              placeholder="Pickup Pincode"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              style={{
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />

            <input
              type="text"
              placeholder="Delivery Pincode"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              style={{
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />

            <button
              onClick={calculateRates}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Calculate Rates
            </button>
          </div>
        </div>

        {/* Results */}
        {rates && (
          <>
            <h2
              style={{
                color: "#0f172a",
                marginBottom: "20px",
              }}
            >
              Available Courier Rates
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: "20px",
              }}
            >
              {rates.map((rate) => (
                <div
                  key={rate.courier}
                  style={{
                    background: "#ffffff",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: "20px",
                    }}
                  >
                    {rate.courier}
                  </h3>

                  <h2
                    style={{
                      color: "#f97316",
                      margin: "16px 0",
                      fontSize: "32px",
                      fontWeight: "700",
                    }}
                  >
                    ₹{rate.price}
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    Delivery in {rate.days} Days
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RateCalculator;