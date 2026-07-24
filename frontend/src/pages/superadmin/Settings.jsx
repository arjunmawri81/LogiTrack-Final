import { useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import "./Settings.css";

const Settings = () => {
  const [commission, setCommission] = useState(10);

  const saveSettings = () => {
    alert("Settings Saved Successfully");
  };

  return (
    <SuperAdminLayout>
      <div className="settings-container">
        
        {/* HEADER SECTION */}
        <div className="page-header">
          <h1 className="page-title">
            Platform Settings
          </h1>
          <p className="page-subtitle">
            Configure platform-wide settings and commission rules
          </p>
        </div>

        {/* OVERVIEW KPI METRIC CARD */}
        <div className="commission-card">
          <div className="commission-label">
            Current Commission
          </div>
          <div className="commission-value">
            {commission}%
          </div>
        </div>

        {/* INTERACTIVE CONFIGURATION FORM CARD */}
        <div className="form-card">
          <h2 className="form-title">
            Commission Settings
          </h2>

          <label className="input-label">
            Commission Percentage (%)
          </label>

          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="number-input"
          />

          <button
            onClick={saveSettings}
            className="save-btn"
          >
            Save Settings
          </button>
        </div>

        {/* STATIC SYSTEM METADATA DATAGRID */}
        <div className="table-card">
          <h2 className="form-title">
            Platform Information
          </h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Platform Name</td>
                <td style={{ fontWeight: "700", color: "#0f172a" }}>LogiTrack</td>
              </tr>

              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Version</td>
                <td style={{ fontFamily: "monospace", color: "#0f172a", fontSize: "14px" }}>v1.0.0</td>
              </tr>

              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Environment</td>
                <td>
                  <span className="env-badge">
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

export default Settings;