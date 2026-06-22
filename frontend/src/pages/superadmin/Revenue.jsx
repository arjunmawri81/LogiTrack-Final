import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    platformRevenue: 0,
    netRevenue: 0,
    totalCommission: 0,
    activeMerchants: 0,
    monthlyCommission: 0,
    todayCommission: 0,
    merchantBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/commission");
      const data = res.data;

      setRevenueData({
        platformRevenue: data.totalRevenue || 0,
        netRevenue: data.netRevenue || 0,
        totalCommission: data.totalCommission || 0,
        activeMerchants: data.activeMerchants || 0,
        monthlyCommission: data.monthlyCommission || 0,
        todayCommission: data.todayCommission || 0,
        merchantBreakdown: data.merchantBreakdown || [],
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  // Filter merchants with revenue > 0
  const merchantBreakdown = revenueData.merchantBreakdown.filter(
    m => m.revenue > 0
  );
  
  // Use filtered merchant count for accuracy
  const activeMerchants = merchantBreakdown.length;

  const highestRevenueMerchant = merchantBreakdown.length > 0
    ? merchantBreakdown.reduce((max, curr) => curr.revenue > max.revenue ? curr : max)
    : null;

  const highestCommissionMerchant = merchantBreakdown.length > 0
    ? merchantBreakdown.reduce((max, curr) => curr.commission > max.commission ? curr : max)
    : null;

  const averageRevenuePerMerchant = activeMerchants > 0
    ? revenueData.platformRevenue / activeMerchants
    : 0;

  // Top 5 merchants - no need for second filter
  const topMerchants = [...merchantBreakdown]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (loading) {
    return (
      <SuperAdminLayout>
        <div style={{ 
          ...fontStyle, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "60vh",
          color: "#64748b",
          fontSize: "16px",
          fontWeight: "500"
        }}>
          Loading Revenue Analytics...
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div style={{ 
        ...fontStyle, 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "10px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        
        {/* HEADER SECTION - Same row with refresh button */}
        <div style={{ 
          borderBottom: "1px solid #f1f5f9", 
          paddingBottom: "20px", 
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "clamp(24px, 5vw, 32px)", 
              fontWeight: "800", 
              color: "#0f172a", 
              margin: "0 0 6px 0", 
              letterSpacing: "-0.025em" 
            }}>
              Business Analytics
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              Platform revenue tracking and merchant analytics
            </p>
          </div>
          <button
            onClick={fetchRevenueData}
            style={{
              padding: "10px 20px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              color: "#0f172a",
              transition: "all 0.2s",
              fontFamily: "'Inter', sans-serif",
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f8fafc";
              e.target.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.borderColor = "#e2e8f0";
            }}
          >
            Refresh Data
          </button>
        </div>

        {/* TOP 6 CARDS - Fully Responsive Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px", 
          marginBottom: "35px" 
        }}>
          <MetricCard 
            label="Platform Revenue" 
            value={revenueData.platformRevenue} 
            color="#3b82f6" 
          />
          <MetricCard 
            label="Net Revenue" 
            value={revenueData.netRevenue} 
            color="#8b5cf6" 
          />
          <MetricCard 
            label="Total Commission" 
            value={revenueData.totalCommission} 
            color="#ec4899" 
          />
          <MetricCard 
            label="Active Merchants" 
            value={activeMerchants} 
            color="#10b981" 
            isNumber
          />
          <MetricCard 
            label="Monthly Commission" 
            value={revenueData.monthlyCommission} 
            color="#f59e0b" 
          />
          <MetricCard 
            label="Today's Commission" 
            value={revenueData.todayCommission} 
            color="#ef4444" 
          />
        </div>

        {/* SECTION 1: Merchant Revenue Breakdown - Mobile Responsive */}
        <div style={{ 
          background: "#ffffff", 
          borderRadius: "16px", 
          padding: "16px", 
          marginBottom: "30px",
          border: "1px solid #f1f5f9", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <h2 style={{ 
            color: "#0f172a", 
            margin: "0 0 16px 0", 
            fontSize: "clamp(16px, 2.5vw, 18px)", 
            fontWeight: "700", 
            letterSpacing: "-0.02em" 
          }}>
            Merchant Revenue Breakdown
          </h2>

          <div style={{ 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch",
            margin: "0 -16px",
            padding: "0 16px"
          }}>
            <table style={{ 
              width: "100%", 
              minWidth: "700px",
              borderCollapse: "separate", 
              borderSpacing: "0", 
              background: "#ffffff", 
              borderRadius: "12px", 
              overflow: "hidden", 
              border: "1px solid #e2e8f0" 
            }}>
              <thead>
                <tr>
                  <th style={thStyle}>Merchant</th>
                  <th style={thStyle}>Orders</th>
                  <th style={thStyle}>Revenue</th>
                  <th style={thStyle}>Commission</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {merchantBreakdown.length > 0 ? (
                  merchantBreakdown.map((merchant) => (
                    <tr key={merchant._id} style={{ background: "#ffffff" }}>
                      <td style={{ ...tdStyle, fontWeight: "600" }}>
                        {merchant.merchantName || merchant._id}
                      </td>
                      <td style={tdStyle}>{merchant.orders || 0}</td>
                      <td style={tdStyle}>
                        <span style={{ color: "#059669", fontWeight: "600" }}>
                          ₹{merchant.revenue?.toLocaleString()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#7c3aed", fontWeight: "600" }}>
                          ₹{merchant.commission?.toLocaleString()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background:
                              merchant.status === "ACTIVE"
                                ? "#dcfce7"
                                : merchant.status === "PENDING"
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              merchant.status === "ACTIVE"
                                ? "#166534"
                                : merchant.status === "PENDING"
                                ? "#92400e"
                                : "#991b1b",
                            padding: "4px 8px",
                            borderRadius: "999px",
                            fontWeight: "600",
                            fontSize: "11px",
                            display: "inline-block",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {merchant.status || "INACTIVE"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {merchant.orders > 0
                          ? "Recently Active"
                          : "No Activity"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px 16px", background: "#ffffff" }}>
                      <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
                        No Revenue Data Available
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "6px" }}>
                        Revenue analytics will appear once merchants start generating orders.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2 & 3: Two Column Layout - Responsive */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}>
          
          {/* SECTION 2: Top Revenue Merchants */}
          <div style={{ 
            background: "#ffffff", 
            borderRadius: "16px", 
            padding: "16px",
            border: "1px solid #f1f5f9", 
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
          }}>
            <h2 style={{ 
              color: "#0f172a", 
              margin: "0 0 16px 0", 
              fontSize: "clamp(16px, 2.5vw, 18px)", 
              fontWeight: "700", 
              letterSpacing: "-0.02em" 
            }}>
              Top Revenue Merchants
            </h2>

            {topMerchants.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {topMerchants.map((merchant, index) => (
                  <div key={merchant._id} style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    padding: "12px 14px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    gap: "6px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ 
                        background: index === 0 ? "#f59e0b" : "#cbd5e1",
                        color: index === 0 ? "#ffffff" : "#475569",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "12px",
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                        {merchant.merchantName || merchant._id}
                      </span>
                    </div>
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap",
                      gap: "12px", 
                      paddingLeft: "36px"
                    }}>
                      <span style={{ color: "#059669", fontWeight: "600", fontSize: "13px" }}>
                        Revenue: ₹{merchant.revenue?.toLocaleString()}
                      </span>
                      <span style={{ color: "#7c3aed", fontWeight: "500", fontSize: "13px" }}>
                        Commission: ₹{merchant.commission?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
                  No Revenue Data Available
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "6px" }}>
                  Revenue analytics will appear once merchants start generating orders.
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Revenue Insights */}
          <div style={{ 
            background: "#ffffff", 
            borderRadius: "16px", 
            padding: "16px",
            border: "1px solid #f1f5f9", 
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
          }}>
            <h2 style={{ 
              color: "#0f172a", 
              margin: "0 0 16px 0", 
              fontSize: "clamp(16px, 2.5vw, 18px)", 
              fontWeight: "700", 
              letterSpacing: "-0.02em" 
            }}>
              Revenue Insights
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Highest Revenue Merchant */}
              <div style={{ 
                background: "#ffffff", 
                padding: "14px 16px", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #2563eb",
                minHeight: "auto"
              }}>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Highest Revenue Merchant
                </div>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                    {highestRevenueMerchant ? highestRevenueMerchant.merchantName || highestRevenueMerchant._id : "N/A"}
                  </span>
                  <span style={{ fontWeight: "700", color: "#059669", fontSize: "16px" }}>
                    ₹{highestRevenueMerchant ? highestRevenueMerchant.revenue.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* Highest Commission Merchant */}
              <div style={{ 
                background: "#ffffff", 
                padding: "14px 16px", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #7c3aed",
                minHeight: "auto"
              }}>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Highest Commission Merchant
                </div>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                    {highestCommissionMerchant ? highestCommissionMerchant.merchantName || highestCommissionMerchant._id : "N/A"}
                  </span>
                  <span style={{ fontWeight: "700", color: "#7c3aed", fontSize: "16px" }}>
                    ₹{highestCommissionMerchant ? highestCommissionMerchant.commission.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* Average Revenue Per Merchant - Professional Format */}
              <div style={{ 
                background: "#ffffff", 
                padding: "14px 16px", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #059669",
                minHeight: "auto"
              }}>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Average Revenue Per Merchant
                </div>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "2px"
                }}>
                  <span style={{ fontWeight: "700", color: "#059669", fontSize: "16px" }}>
                    ₹{averageRevenuePerMerchant.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "400" }}>
                    Based on {activeMerchants} Active Merchant{activeMerchants !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// Metric Card Component - Mobile Responsive
const MetricCard = ({ label, value, color, isNumber }) => {
  const formattedValue = isNumber 
    ? value.toLocaleString()
    : `₹${value.toLocaleString()}`;
  
  return (
    <div style={{ 
      background: "#ffffff", 
      borderRadius: "12px", 
      padding: "14px 16px",
      border: "1px solid #f1f5f9",
      borderTop: `3px solid ${color}`,
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{ 
        fontSize: "10px", 
        fontWeight: "600", 
        color: "#64748b", 
        textTransform: "uppercase", 
        letterSpacing: "0.05em",
        marginBottom: "6px"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: "clamp(18px, 3vw, 26px)", 
        fontWeight: "800", 
        color: color,
        letterSpacing: "-0.02em",
        wordBreak: "break-word"
      }}>
        {formattedValue}
      </div>
    </div>
  );
};

const thStyle = { 
  padding: "10px 12px", 
  textAlign: "left", 
  color: "#475569", 
  fontWeight: "600", 
  fontSize: "11px", 
  textTransform: "uppercase", 
  letterSpacing: "0.05em", 
  background: "#f8fafc", 
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap"
};

const tdStyle = { 
  padding: "10px 12px", 
  color: "#334155", 
  fontSize: "13px", 
  fontWeight: "500", 
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap"
};

export default Revenue;