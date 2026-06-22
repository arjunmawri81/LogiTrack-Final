import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Commission = () => {
  const [commission, setCommission] = useState({
    totalRevenue: 0,
    commissionRate: 10,
    totalCommission: 0,
    monthlyCommission: 0,
    todayCommission: 0,
    activeMerchants: 0,
    netRevenue: 0,
  });

  const [merchantBreakdown, setMerchantBreakdown] = useState([]);

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
        monthlyCommission: res.data.monthlyCommission || 0,
        todayCommission: res.data.todayCommission || 0,
        activeMerchants: res.data.activeMerchants || 0,
        netRevenue: res.data.netRevenue || 0,
      });
      setMerchantBreakdown(res.data.merchantBreakdown || []);
    } catch (error) {
      console.error("Error retrieving platform commission metrics:", error);
    }
  };

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
          <div style={cardBlue}>
            <div style={{ ...cardLabel, color: "#93c5fd" }}>
              Total Revenue
            </div>
            <div style={cardValue}>
              ₹{commission.totalRevenue.toLocaleString()}
            </div>
          </div>

          <div style={cardGreen}>
            <div style={{ ...cardLabel, color: "#a7f3d0" }}>
              Net Revenue
            </div>
            <div style={cardValue}>
              ₹{commission.netRevenue?.toLocaleString()}
            </div>
          </div>

          <div style={cardOrange}>
            <div style={{ ...cardLabel, color: "#ffedd5" }}>
              Total Commission
            </div>
            <div style={cardValue}>
              ₹{commission.totalCommission.toLocaleString()}
            </div>
          </div>

          <div style={cardBlue}>
            <div style={{ ...cardLabel, color: "#93c5fd" }}>
              Monthly Commission
            </div>
            <div style={cardValue}>
              ₹{commission.monthlyCommission.toLocaleString()}
            </div>
          </div>

          <div style={cardGreen}>
            <div style={{ ...cardLabel, color: "#a7f3d0" }}>
              Today's Commission
            </div>
            <div style={cardValue}>
              ₹{commission.todayCommission.toLocaleString()}
            </div>
          </div>

          <div style={cardOrange}>
            <div style={{ ...cardLabel, color: "#ffedd5" }}>
              Active Merchants
            </div>
            <div style={cardValue}>
              {commission.activeMerchants}
            </div>
          </div>
        </div>

        {/* MERCHANT COMMISSION TABLE */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
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
            Merchant Commission Breakdown
          </h2>

          <div style={{ overflowX: "auto" }}>
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
                  <th style={{ ...thStyle, textAlign: "left" }}>Merchant</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Orders</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Revenue</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Commission</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {merchantBreakdown
                  .filter((merchant) => merchant.revenue > 0)
                  .map((merchant) => (
                    <tr key={merchant.merchantId}>
                      <td style={{ ...tdStyle, fontWeight: "600", color: "#0f172a" }}>
                        {merchant.merchantName}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", color: "#475569" }}>
                        {merchant.orders}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500", color: "#0f172a" }}>
                        ₹{merchant.revenue.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: "700", color: "#166534" }}>
                        ₹{merchant.commission.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            background: merchant.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                            color: merchant.status === "ACTIVE" ? "#166534" : "#92400e",
                            fontWeight: "600",
                            fontSize: "12px",
                          }}
                        >
                          {merchant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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
  padding: "12px 16px",
  color: "#475569",
  fontWeight: "600",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "14px 16px",
  color: "#334155",
  fontSize: "13px",
  borderBottom: "1px solid #f1f5f9",
};

export default Commission;