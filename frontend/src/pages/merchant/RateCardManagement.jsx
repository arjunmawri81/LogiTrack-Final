import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";

const RateCardManagement = () => {
  const { merchantId } = useParams();

  const [rates, setRates] = useState({
    delhivery: {
      rate500gm: "",
      rate1kg: "",
      rate2kg: "",
      additionalKg: "",
      codCharge: "",
    },
    xpressbees: {
      rate500gm: "",
      rate1kg: "",
      rate2kg: "",
      additionalKg: "",
      codCharge: "",
    },
  });

  const handleChange = (courier, field, value) => {
    setRates({
      ...rates,
      [courier]: {
        ...rates[courier],
        [field]: value,
      },
    });
  };

  const saveRates = () => {
    console.log(rates);
    // API Call Later
  };

  return (
    <SuperAdminLayout>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Rate Card Management
        </h1>

        <p style={{ color: "#64748b" }}>
          Merchant ID: {merchantId}
        </p>

        {Object.keys(rates).map((courier) => (
          <div
            key={courier}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            <h2
              style={{
                textTransform: "capitalize",
                marginBottom: "20px",
              }}
            >
              {courier}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: "12px",
              }}
            >
              <input
                placeholder="500gm"
                value={rates[courier].rate500gm}
                onChange={(e) =>
                  handleChange(
                    courier,
                    "rate500gm",
                    e.target.value
                  )
                }
              />

              <input
                placeholder="1kg"
                value={rates[courier].rate1kg}
                onChange={(e) =>
                  handleChange(
                    courier,
                    "rate1kg",
                    e.target.value
                  )
                }
              />

              <input
                placeholder="2kg"
                value={rates[courier].rate2kg}
                onChange={(e) =>
                  handleChange(
                    courier,
                    "rate2kg",
                    e.target.value
                  )
                }
              />

              <input
                placeholder="Add KG"
                value={rates[courier].additionalKg}
                onChange={(e) =>
                  handleChange(
                    courier,
                    "additionalKg",
                    e.target.value
                  )
                }
              />

              <input
                placeholder="COD"
                value={rates[courier].codCharge}
                onChange={(e) =>
                  handleChange(
                    courier,
                    "codCharge",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        ))}

        <button
          onClick={saveRates}
          style={{
            marginTop: "25px",
            padding: "12px 24px",
            background: "#ea580c",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Save Rate Card
        </button>
      </div>
    </SuperAdminLayout>
  );
};

export default RateCardManagement;