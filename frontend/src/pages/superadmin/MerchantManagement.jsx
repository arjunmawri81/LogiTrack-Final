import React, { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const MerchantManagement = () => {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await api.get("/admin/merchants");
      setMerchants(res.data.merchants || []);
    } catch (error) {
      console.error("Error retrieving merchant data directory:", error);
    }
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
            Merchant Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Manage registered merchants and business accounts
          </p>
        </div>

        {/* STATS CARD */}
        <div
          style={{
            width: "300px",
            background: "linear-gradient(135deg, #c2410c, #ea580c)",
            borderRadius: "16px",
            padding: "24px",
            color: "#ffffff",
            marginBottom: "35px",
            boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.15), 0 8px 10px -6px rgba(234, 88, 12, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#ffedd5",
              marginBottom: "12px",
            }}
          >
            Total Merchants
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: "800",
              lineHeight: "1",
              letterSpacing: "-0.03em",
            }}
          >
            {merchants.length}
          </div>
        </div>

        {/* MERCHANT DIRECTORY GRID TABLE */}
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
            Merchant Directory
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
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Merchant</th>
                <th style={thStyle}>GST Number</th>
                <th style={thStyle}>PAN Number</th>
                <th style={{ ...thStyle, width: "30%" }}>Address</th>
              </tr>
            </thead>

            <tbody>
              {merchants.length > 0 ? (
                merchants.map((merchant) => (
                  <tr key={merchant._id} style={{ background: "#ffffff" }}>
                    
                    <td style={{ ...tdStyle, fontWeight: "600", color: "#0f172a" }}>
                      {merchant.companyName || "—"}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1e40af",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontWeight: "600",
                          fontSize: "12px",
                          display: "inline-block",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {merchant.userId?.name || "N/A"}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, fontFamily: "monospace", letterSpacing: "0.05em", color: "#475569" }}>
                      {merchant.gstNumber || "—"}
                    </td>

                    <td style={{ ...tdStyle, fontFamily: "monospace", letterSpacing: "0.05em", color: "#475569" }}>
                      {merchant.panNumber || "—"}
                    </td>

                    {/* Multi-device clean text wrapping protection */}
                    <td 
                      style={{ 
                        ...tdStyle, 
                        color: "#64748b",
                        maxWidth: "280px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={merchant.address}
                    >
                      {merchant.address || "—"}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: "#94a3b8",
                      background: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    No Merchants Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Structural CSS Definitions for Table Columns
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

export default MerchantManagement;