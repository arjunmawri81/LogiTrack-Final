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
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaEye,
} from "react-icons/fa";

const Revenue = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalShipments: 0,
  });
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Inline styles matching Dashboard
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
    welcomeSection: {
      background: "linear-gradient(135deg, #059669, #10b981)",
      borderRadius: "20px",
      padding: "24px 30px",
      marginBottom: "30px",
      color: "white"
    },
    welcomeTitle: {
      fontSize: "24px",
      fontWeight: "700",
      margin: "0 0 8px 0"
    },
    welcomeSubtitle: {
      fontSize: "14px",
      opacity: 0.9,
      margin: 0
    },
    headerBlock: {
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    headerTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 6px 0"
    },
    headerSubtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: 0
    },
    timeRangeGroup: {
      display: "flex",
      gap: "10px",
      background: "white",
      padding: "5px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0"
    },
    timeRangeBtn: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s"
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
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer"
    },
    statInfo: {
      flex: 1
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "8px",
      letterSpacing: "0.5px"
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0f172a",
      margin: 0
    },
    statTrend: {
      fontSize: "11px",
      marginTop: "6px",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    },
    statIconWrapper: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    // Charts Section
    chartBox: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "30px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    chartTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    exportBtn: {
      background: "#f1f5f9",
      border: "none",
      padding: "8px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#475569"
    },
    chartPlaceholder: {
      height: "200px",
      background: "#f8fafc",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#94a3b8",
      fontSize: "14px"
    },
    progressItem: {
      marginBottom: "20px"
    },
    progressHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#334155"
    },
    progressBar: {
      background: "#f1f5f9",
      height: "8px",
      borderRadius: "99px",
      overflow: "hidden"
    },
    progressFill: {
      background: "linear-gradient(90deg, #059669, #10b981)",
      height: "100%",
      borderRadius: "99px",
      transition: "width 0.3s ease"
    },
    // Table Section - WHITE BACKGROUND
    tableContainer: {
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #eef2f6"
    },
    tableHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #eef2f6",
      background: "white"
    },
    tableTitle: {
      fontSize: "18px",
      fontWeight: "700",
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
      padding: "16px 20px",
      background: "#f8fafc",
      color: "#475569",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "18px 20px",
      borderBottom: "1px solid #f1f5f9",
      color: "#1e293b",
      fontSize: "14px",
      background: "white"
    },
    revenueCell: {
      fontWeight: "800",
      color: "#059669",
      fontSize: "16px"
    },
    actionBtn: {
      background: "white",
      border: "1px solid #e2e8f0",
      padding: "8px 12px",
      borderRadius: "10px",
      cursor: "pointer",
      color: "#64748b",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    },
    monthlyData: [
      { month: "Jan", revenue: 45000, orders: 45, shipments: 42 },
      { month: "Feb", revenue: 52000, orders: 52, shipments: 50 },
      { month: "Mar", revenue: 61000, orders: 58, shipments: 56 },
      { month: "Apr", revenue: 48500, orders: 48, shipments: 45 },
      { month: "May", revenue: 67000, orders: 64, shipments: 62 },
      { month: "Jun", revenue: 72000, orders: 68, shipments: 66 },
    ]
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <FaArrowUp size={10} color="#10b981" />;
    return <FaArrowDown size={10} color="#ef4444" />;
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>💰 Revenue Dashboard</h1>
          <p style={styles.welcomeSubtitle}>
            Monitor revenue, commissions and financial performance across platform
          </p>
        </div>

        {/* Header with Time Range */}
        <div style={styles.headerBlock}>
          <div>
            <h1 style={styles.headerTitle}>Revenue Analytics</h1>
            <p style={styles.headerSubtitle}>Monitor revenue, commissions and financial performance</p>
          </div>
          <div style={styles.timeRangeGroup}>
            <button 
              style={{ ...styles.timeRangeBtn, background: timeRange === "daily" ? "#f1f5f9" : "transparent" }}
              onClick={() => setTimeRange("daily")}
            >
              Daily
            </button>
            <button 
              style={{ ...styles.timeRangeBtn, background: timeRange === "weekly" ? "#f1f5f9" : "transparent" }}
              onClick={() => setTimeRange("weekly")}
            >
              Weekly
            </button>
            <button 
              style={{ ...styles.timeRangeBtn, background: timeRange === "monthly" ? "#f1f5f9" : "transparent" }}
              onClick={() => setTimeRange("monthly")}
            >
              Monthly
            </button>
            <button 
              style={{ ...styles.timeRangeBtn, background: timeRange === "yearly" ? "#f1f5f9" : "transparent" }}
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
              <h2 style={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</h2>
              <div style={styles.statTrend}>
                {getTrendIcon(12.5)} <span style={{ color: "#10b981" }}>+12.5%</span> from last month
              </div>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaRupeeSign color="#10b981" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Orders</div>
              <h2 style={styles.statValue}>{stats.totalOrders.toLocaleString()}</h2>
              <div style={styles.statTrend}>
                {getTrendIcon(8.3)} <span style={{ color: "#10b981" }}>+8.3%</span> from last month
              </div>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaChartLine color="#3b82f6" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{stats.totalShipments.toLocaleString()}</h2>
              <div style={styles.statTrend}>
                {getTrendIcon(5.2)} <span style={{ color: "#10b981" }}>+5.2%</span> from last month
              </div>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaMoneyBillWave color="#f59e0b" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Pending Settlement</div>
              <h2 style={styles.statValue}>₹0</h2>
              <div style={styles.statTrend}>
                {getTrendIcon(-2.1)} <span style={{ color: "#ef4444" }}>-2.1%</span> from last month
              </div>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaWallet color="#ef4444" size={22} />
            </div>
          </div>
        </div>

        {/* Revenue Performance */}
        <div style={styles.chartBox}>
          <div style={styles.chartTitle}>
            <span>📈 Revenue Performance</span>
            <button style={styles.exportBtn}>
              <FaDownload size={12} /> Export Report
            </button>
          </div>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>Revenue Growth Target (₹1,00,000)</span>
              <span>{stats.totalRevenue > 0 ? Math.min(100, (stats.totalRevenue / 100000) * 100).toFixed(0) : 0}%</span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{ ...styles.progressFill, width: stats.totalRevenue > 0 ? Math.min(100, (stats.totalRevenue / 100000) * 100) : 0 }}
              />
            </div>
          </div>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>Monthly Growth Rate</span>
              <span>+12.5%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "62.5%" }} />
            </div>
          </div>
        </div>

        {/* Revenue Summary Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Monthly Revenue Summary</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>MONTH</th>
                  <th style={styles.th}>ORDERS</th>
                  <th style={styles.th}>SHIPMENTS</th>
                  <th style={styles.th}>REVENUE</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {styles.monthlyData.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaCalendarAlt color="#94a3b8" size={14} />
                        <span style={{ fontWeight: "600" }}>{item.month}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{item.orders}</td>
                    <td style={styles.td}>{item.shipments}</td>
                    <td style={styles.td}>
                      <span style={styles.revenueCell}>₹{item.revenue.toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn} title="View Details">
                        <FaEye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Revenue Summary */}
        <div style={{ ...styles.tableContainer, marginTop: "30px" }}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Platform Revenue Summary</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>METRIC</th>
                  <th style={styles.th}>VALUE</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Total Orders</td>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{stats.totalOrders}</td>
                  <td style={styles.td}>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Total Shipments</td>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{stats.totalShipments}</td>
                  <td style={styles.td}>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Total Revenue</td>
                  <td style={{ ...styles.td, fontWeight: "800", color: "#059669", fontSize: "18px" }}>₹{stats.totalRevenue.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>
                      Growing
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;