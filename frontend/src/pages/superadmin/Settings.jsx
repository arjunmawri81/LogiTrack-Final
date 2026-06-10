import { useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";

const Settings = () => {
  const [commission, setCommission] = useState(10);

  const saveSettings = () => {
    alert("Settings Saved Successfully");
  };

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Platform Settings
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Configure platform-wide settings and commission rules
        </p>
      </div>

      {/* KPI CARD */}
      <div
        style={{
          width: "320px",
          background:
            "linear-gradient(135deg,#7c3aed,#9333ea)",
          borderRadius: "20px",
          padding: "22px",
          color: "#fff",
          marginBottom: "30px",
          boxShadow:
            "0 12px 25px rgba(124,58,237,.18)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            opacity: "0.9",
            marginBottom: "10px",
          }}
        >
          Current Commission
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "800",
            lineHeight: "1",
          }}
        >
          {commission}%
        </div>
      </div>

      {/* SETTINGS CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
          }}
        >
          Commission Settings
        </h2>

        <label
          style={{
            display: "block",
            marginBottom: "10px",
            color: "#374151",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Commission Percentage (%)
        </label>

        <input
          type="number"
          value={commission}
          onChange={(e) =>
            setCommission(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            outline: "none",
            fontSize: "14px",
            background: "#f8fafc",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={saveSettings}
          style={{
            padding: "12px 22px",
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Save Settings
        </button>
      </div>

      {/* PLATFORM INFORMATION */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Platform Information
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>Property</th>
              <th style={thStyle}>Value</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>
                Platform Name
              </td>

              <td style={tdStyle}>
                LogiTrack
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                Version
              </td>

              <td style={tdStyle}>
                v1.0.0
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                Environment
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#15803d",
                    padding: "7px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Production
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const thStyle = {
  padding: "18px 24px",
  textAlign: "left",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#374151",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default Settings;