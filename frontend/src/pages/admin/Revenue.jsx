import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaRupeeSign,
  FaChartLine,
  FaMoneyBillWave,
  FaWallet,
  FaCalendarAlt,
  FaEye,
} from "react-icons/fa";

const Revenue = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalShipments: 0,
  });
  const [timeRange, setTimeRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/revenue");
      
      if (response.data.success) {
        const dashboardResponse = await api.get("/admin/dashboard");
        
        setStats({
          totalRevenue: response.data.totalRevenue || 0,
          totalOrders: dashboardResponse.data.totalOrders || 0,
          totalShipments: dashboardResponse.data.totalShipments || 0,
        });

        // Process monthly revenue data
        const revenueData = Object.entries(
          response.data.monthlyRevenue || {}
        ).map(([month, revenue]) => ({
          month,
          revenue,
        }));
        setMonthlyData(revenueData);

        // Set recent invoices
        setRecentInvoices(
          response.data.invoices?.slice(0, 10) || []
        );

        // Set top merchants (from invoices data)
        if (response.data.invoices) {
          const merchantMap = {};
          response.data.invoices.forEach(invoice => {
            const merchantId = invoice.merchantId?._id || invoice.merchantId;
            if (merchantId) {
              if (!merchantMap[merchantId]) {
                merchantMap[merchantId] = {
                  id: merchantId,
                  name: invoice.merchantId?.name || "Unknown Merchant",
                  companyName: invoice.merchantId?.companyName || "-",
                  totalRevenue: 0
                };
              }
              merchantMap[merchantId].totalRevenue += (invoice.totalAmount || 0);
            }
          });
          
          const sortedMerchants = Object.values(merchantMap)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
          
          setTopMerchants(sortedMerchants);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("Error fetching revenue:", error);
      setLoading(false);
    }
  };

  // Clean styles
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    mainContent: {
      flex: 1,
      marginLeft: "280px",
      padding: "20px 30px",
      overflowX: "auto"
    },
    headerBlock: {
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px"
    },
    headerTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    headerSubtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: "4px 0 0 0"
    },
    timeRangeGroup: {
      display: "flex",
      gap: "6px",
      background: "white",
      padding: "4px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    },
    timeRangeBtn: {
      padding: "7px 16px",
      borderRadius: "8px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      color: "#64748b",
      transition: "all 0.2s"
    },
    timeRangeBtnActive: {
      background: "#0f172a",
      color: "white"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "30px"
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #eef2f6"
    },
    statInfo: {
      flex: 1
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "6px",
      letterSpacing: "0.5px"
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0f172a",
      margin: 0
    },
    statIconWrapper: {
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    tableContainer: {
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #eef2f6",
      marginBottom: "20px"
    },
    tableHeader: {
      padding: "16px 24px",
      borderBottom: "1px solid #eef2f6",
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    tableTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0
    },
    tableWrapper: {
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white"
    },
    th: {
      textAlign: "left",
      padding: "12px 20px",
      background: "#f8fafc",
      color: "#475569",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
      color: "#1e293b",
      fontSize: "14px",
      background: "white"
    },
    revenueCell: {
      fontWeight: "700",
      color: "#059669",
      fontSize: "15px"
    },
    actionBtn: {
      background: "white",
      border: "1px solid #e2e8f0",
      padding: "6px 10px",
      borderRadius: "8px",
      cursor: "pointer",
      color: "#64748b",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    },
    threeColumnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px"
    },
    summaryContainer: {
      marginTop: "20px"
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "15px",
      marginBottom: "30px"
    },
    summaryCard: {
      background: "white",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    summaryLabel: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "4px"
    },
    summaryValue: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    statusBadge: {
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500"
    },
    loadingText: {
      textAlign: "center",
      padding: "40px",
      color: "#64748b",
      fontSize: "16px"
    },
    emptyState: {
      textAlign: "center",
      padding: "30px",
      color: "#94a3b8",
      fontSize: "14px"
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <AdminSidebar />
        <div style={styles.mainContent}>
          <AdminTopbar />
          <div style={styles.loadingText}>Loading revenue data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Header */}
        <div style={styles.headerBlock}>
          <div>
            <h1 style={styles.headerTitle}>Revenue Analytics</h1>
            <p style={styles.headerSubtitle}>Monitor revenue, commissions and financial performance</p>
          </div>
          <div style={styles.timeRangeGroup}>
            <button 
              style={{ 
                ...styles.timeRangeBtn, 
                ...(timeRange === "daily" ? styles.timeRangeBtnActive : {})
              }}
              onClick={() => setTimeRange("daily")}
            >
              Daily
            </button>
            <button 
              style={{ 
                ...styles.timeRangeBtn, 
                ...(timeRange === "weekly" ? styles.timeRangeBtnActive : {})
              }}
              onClick={() => setTimeRange("weekly")}
            >
              Weekly
            </button>
            <button 
              style={{ 
                ...styles.timeRangeBtn, 
                ...(timeRange === "monthly" ? styles.timeRangeBtnActive : {})
              }}
              onClick={() => setTimeRange("monthly")}
            >
              Monthly
            </button>
            <button 
              style={{ 
                ...styles.timeRangeBtn, 
                ...(timeRange === "yearly" ? styles.timeRangeBtnActive : {})
              }}
              onClick={() => setTimeRange("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Revenue</div>
              <h2 style={styles.statValue}>₹{(stats.totalRevenue || 0).toLocaleString()}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaRupeeSign color="#10b981" size={20} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Orders</div>
              <h2 style={styles.statValue}>{(stats.totalOrders || 0).toLocaleString()}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaChartLine color="#3b82f6" size={20} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{(stats.totalShipments || 0).toLocaleString()}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaMoneyBillWave color="#f59e0b" size={20} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Pending Settlement</div>
              <h2 style={styles.statValue}>₹0</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaWallet color="#ef4444" size={20} />
            </div>
          </div>
        </div>

        {/* Monthly Revenue Summary Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Monthly Revenue Summary</h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {new Date().getFullYear()}
            </span>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>MONTH</th>
                  <th style={styles.th}>REVENUE</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.length > 0 ? (
                  monthlyData.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <FaCalendarAlt color="#94a3b8" size={14} />
                          <span style={{ fontWeight: "500" }}>{item.month}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.revenueCell}>₹{item.revenue.toLocaleString()}</span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionBtn} title="View Details">
                          <FaEye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={styles.emptyState}>
                      No monthly data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout: Top Merchants & Recent Activity */}
        <div style={styles.threeColumnGrid}>
          {/* Top Revenue Merchants */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Top Revenue Merchants</h3>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                {topMerchants.length} merchants
              </span>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Merchant</th>
                    <th style={styles.th}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {topMerchants.length > 0 ? (
                    topMerchants.map((merchant, index) => (
                      <tr key={index}>
                        <td style={styles.td}>
                          <span style={{ fontWeight: "500" }}>{merchant.name}</span>
                        </td>
                        <td style={styles.td}>{merchant.companyName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={styles.emptyState}>
                        No merchant data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Revenue Activity */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Recent Revenue Activity</h3>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Latest transactions
              </span>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Merchant</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td style={styles.td}>
                          <span style={{ fontWeight: "500" }}>
                            {invoice.merchantId?.name || "Unknown Merchant"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.revenueCell}>
                            ₹{(invoice.totalAmount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {invoice.createdAt 
                            ? new Date(invoice.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.emptyState}>
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Platform Revenue Summary */}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Orders</div>
              <h3 style={styles.summaryValue}>{(stats.totalOrders || 0).toLocaleString()}</h3>
              <span style={{ ...styles.statusBadge, background: "#dcfce7", color: "#166534" }}>
                Active
              </span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Shipments</div>
              <h3 style={styles.summaryValue}>{(stats.totalShipments || 0).toLocaleString()}</h3>
              <span style={{ ...styles.statusBadge, background: "#dcfce7", color: "#166534" }}>
                Active
              </span>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Revenue</div>
              <h3 style={{ ...styles.summaryValue, color: "#059669" }}>
                ₹{(stats.totalRevenue || 0).toLocaleString()}
              </h3>
              <span style={{ ...styles.statusBadge, background: "#dbeafe", color: "#1e40af" }}>
                Growing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;