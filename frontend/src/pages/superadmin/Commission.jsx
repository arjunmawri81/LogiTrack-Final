import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Commission = () => {
  const [commission, setCommission] = useState({
    totalRevenue: 0,
    commissionRate: 10,
    totalCommission: 0,
  });

  useEffect(() => {
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    try {
      const res = await api.get("/admin/commission");
      setCommission({
        totalRevenue: res.data.totalRevenue || 0,
        commissionRate: res.data.commissionRate || 10,
        totalCommission: res.data.totalCommission || 0,
      });
    } catch (error) {
      console.error("Error retrieving platform commission metrics:", error);
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
            Commission Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Platform commission tracking and earnings analytics
          </p>
        </div>

        {/* ANALYTICS KPI CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* TOTAL REVENUE CARD */}
          <div style={cardBlue}>
            <div style={{ ...cardLabel, color: "#93c5fd" }}>
              Total Revenue
            </div>
            <div style={cardValue}>
              ₹{commission.totalRevenue.toLocaleString()}
            </div>
          </div>

          {/* COMMISSION RATE CARD */}
          <div style={cardGreen}>
            <div style={{ ...cardLabel, color: "#a7f3d0" }}>
              Commission Rate
            </div>
            <div style={cardValue}>
              {commission.commissionRate}%
            </div>
          </div>

          {/* EARNED COMMISSION CARD */}
          <div style={cardOrange}>
            <div style={{ ...cardLabel, color: "#ffedd5" }}>
              Total Commission
            </div>
            <div style={cardValue}>
              ₹{commission.totalCommission.toLocaleString()}
            </div>
          </div>
        </div>

        {/* COMMISSION SUMMARY DATAGRID */}
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
            Commission Summary
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
                <th style={thStyle}>Total Revenue</th>
                <th style={thStyle}>Commission Rate</th>
                <th style={thStyle}>Commission Earned</th>
              </tr>
            </thead>

            <tbody>
              <tr style={{ background: "#ffffff" }}>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#0f172a" }}>
                  ₹{commission.totalRevenue.toLocaleString()}
                </td>
                
                <td style={{ ...tdStyle, color: "#475569", fontFamily: "monospace", fontSize: "15px" }}>
                  {commission.commissionRate}%
                </td>
                
                <td style={{ ...tdStyle, fontWeight: "700", color: "#166534" }}>
                  ₹{commission.totalCommission.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Global Layout CSS Metric Definitions
const cardLabel = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "12px",
};

const cardValue = {
  fontSize: "38px",
  fontWeight: "800",
  lineHeight: "1",
  letterSpacing: "-0.03em",
};

const cardBlue = {
  background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.15), 0 8px 10px -6px rgba(29, 78, 216, 0.15)",
};

const cardGreen = {
  background: "linear-gradient(135deg, #065f46, #10b981)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.15)",
};

const cardOrange = {
  background: "linear-gradient(135deg, #c2410c, #ea580c)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.15), 0 8px 10px -6px rgba(234, 88, 12, 0.15)",
};

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

export default Commission;