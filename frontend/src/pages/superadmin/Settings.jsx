import { useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";

const Settings = () => {
  const [commission, setCommission] = useState(10);

  const saveSettings = () => {
    alert("Settings Saved Successfully");
  };

  // Base font framework rule across all page elements
  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  return (
    <SuperAdminLayout>
      <div style={{ ...fontStyle, maxWidth: "1400px", margin: "0 auto", padding: "10px" }}>
        
        {/* HEADER SECTION */}
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 6px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Platform Settings
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Configure platform-wide settings and commission rules
          </p>
        </div>

        {/* OVERVIEW KPI METRIC CARD */}
        <div
          style={{
            width: "300px",
            background: "linear-gradient(135deg, #6d28d9, #9333ea)",
            borderRadius: "16px",
            padding: "24px",
            color: "#ffffff",
            marginBottom: "35px",
            boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#e9d5ff",
              marginBottom: "12px",
            }}
          >
            Current Commission
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: "800",
              lineHeight: "1",
              letterSpacing: "-0.03em",
            }}
          >
            {commission}%
          </div>
        </div>

        {/* INTERACTIVE CONFIGURATION FORM CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "16px",
            marginBottom: "35px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 24px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Commission Settings
          </h2>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#475569",
              fontWeight: "600",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.03em"
            }}
          >
            Commission Percentage (%)
          </label>

          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1e293b",
              background: "#ffffff",
              marginBottom: "24px",
              transition: "border-color 0.15s ease",
            }}
          />

          <button
            onClick={saveSettings}
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
              transition: "background-color 0.15s ease",
            }}
          >
            Save Settings
          </button>
        </div>

        {/* STATIC SYSTEM METADATA DATAGRID */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            overflowX: "auto",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
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
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Property</th>
                <th style={thStyle}>Value</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#475569" }}>Platform Name</td>
                <td style={{ ...tdStyle, fontWeight: "700", color: "#0f172a" }}>LogiTrack</td>
              </tr>

              <tr>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#475569" }}>Version</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", color: "#0f172a", fontSize: "14px" }}>v1.0.0</td>
              </tr>

              <tr>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#475569" }}>Environment</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "inline-block",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Production
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Global Layout CSS Metric Tokens Definitions
const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  color: "#475569",
  fontWeight: "600",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "500",
  borderBottom: "1px solid #f1f5f9",
};

export default Settings;