import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaRupeeSign,
  FaChartLine,
  FaMoneyBillWave,
  FaWallet,
  FaSync,
  FaCalculator,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Revenue = () => {
  // ✅ STEP 4: Added range state
  const [range, setRange] = useState("month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);

  // ✅ STEP 5: Auto reload on range change
  useEffect(() => {
    fetchRevenue();
  }, [range]);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError("");
      
      // ✅ STEP 6: API Call with range filter
      const response = await api.get(`/admin/revenue?range=${range}`);
      
      if (response.data.success) {
        // ✅ STEP 7: Removed extra dashboard API call
        // Backend already returns totalOrders and totalShipments
        setStats({
          totalRevenue: response.data.totalRevenue || 0,
          totalOrders: response.data.totalOrders || 0,
          totalShipments: response.data.totalShipments || 0,
          totalInvoices: response.data.totalInvoices || 0,
        });

        // Process monthly revenue data
        const revenueData = Object.entries(
          response.data.monthlyRevenue || {}
        ).map(([month, revenue]) => ({
          month,
          revenue,
        }));
        setMonthlyData(revenueData);

        // Set recent invoices from backend
        setRecentInvoices(response.data.recentInvoices || []);

        // Process top merchants from backend data
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
      setError("Failed to load revenue data. Please try again.");
      setLoading(false);
    }
  };

  // Calculate averages
  const avgOrderRevenue = stats.totalOrders > 0
    ? stats.totalRevenue / stats.totalOrders
    : 0;

  const avgShipmentRevenue = stats.totalShipments > 0
    ? stats.totalRevenue / stats.totalShipments
    : 0;

  // Get status badge style
  const getStatusStyle = (status) => {
    const statusMap = {
      PAID: { bg: "#dcfce7", color: "#166534", label: "Paid" },
      PENDING: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
      FAILED: { bg: "#fee2e2", color: "#991b1b", label: "Failed" },
    };
    return statusMap[status] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
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
    refreshButton: {
      padding: "8px 18px",
      background: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s"
    },
    filterSelect: {
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "#fff",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      color: "#0f172a",
      outline: "none",
      transition: "border-color 0.2s"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "16px"
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
    avgMetricsRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "30px"
    },
    avgMetricCard: {
      background: "white",
      padding: "16px 20px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #eef2f6"
    },
    avgMetricInfo: {
      flex: 1
    },
    avgMetricLabel: {
      fontSize: "12px",
      fontWeight: "500",
      color: "#64748b",
      marginBottom: "4px"
    },
    avgMetricValue: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    avgMetricIconWrapper: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: "#f1f5f9"
    },
    chartContainer: {
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #eef2f6",
      marginBottom: "20px",
      height: "350px"
    },
    chartTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 16px 0"
    },
    emptyChartState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "270px",
      color: "#94a3b8"
    },
    emptyChartIcon: {
      fontSize: "48px",
      marginBottom: "12px"
    },
    emptyChartText: {
      fontSize: "16px",
      fontWeight: "500"
    },
    emptyChartSubtext: {
      fontSize: "13px",
      color: "#cbd5e1",
      marginTop: "4px"
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
    invoiceCell: {
      fontWeight: "500",
      color: "#0f172a",
      fontSize: "13px"
    },
    statusBadge: {
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.3px"
    },
    twoColumnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px"
    },
    errorContainer: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "12px",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#991b1b",
      marginBottom: "20px"
    },
    errorIcon: {
      fontSize: "20px"
    },
    errorText: {
      fontSize: "14px",
      fontWeight: "500"
    },
    retryButton: {
      marginLeft: "auto",
      padding: "6px 16px",
      background: "#991b1b",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* ✅ STEP 8: Replace Coming Soon with Working Filter */}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={styles.filterSelect}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
            <button onClick={fetchRevenue} style={styles.refreshButton}>
              <FaSync size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
            <button onClick={fetchRevenue} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards - 4 Cards */}
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
              <div style={styles.statLabel}>Total Invoices</div>
              <h2 style={styles.statValue}>{(stats.totalInvoices || 0).toLocaleString()}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#e0e7ff" }}>
              <FaWallet color="#6366f1" size={20} />
            </div>
          </div>
        </div>

        {/* Average Revenue Metrics */}
        <div style={styles.avgMetricsRow}>
          <div style={styles.avgMetricCard}>
            <div style={styles.avgMetricInfo}>
              <div style={styles.avgMetricLabel}>Average Revenue / Order</div>
              <h3 style={styles.avgMetricValue}>₹{avgOrderRevenue.toFixed(2)}</h3>
            </div>
            <div style={styles.avgMetricIconWrapper}>
              <FaCalculator color="#64748b" size={18} />
            </div>
          </div>
          <div style={styles.avgMetricCard}>
            <div style={styles.avgMetricInfo}>
              <div style={styles.avgMetricLabel}>Average Revenue / Shipment</div>
              <h3 style={styles.avgMetricValue}>₹{avgShipmentRevenue.toFixed(2)}</h3>
            </div>
            <div style={styles.avgMetricIconWrapper}>
              <FaCalculator color="#64748b" size={18} />
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Revenue Trend</h3>
          {monthlyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChartState}>
              <div style={styles.emptyChartIcon}>📊</div>
              <div style={styles.emptyChartText}>
                {monthlyData.length === 0 
                  ? "No revenue data available yet" 
                  : "Not enough data for trend analysis"}
              </div>
              <div style={styles.emptyChartSubtext}>
                {monthlyData.length === 0 
                  ? "Revenue data will appear here as transactions are processed"
                  : "Need at least 2 months of data to show trend"}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout: Recent Activity & Top Merchants */}
        <div style={styles.twoColumnGrid}>
          {/* Recent Revenue Activity with Status */}
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
                    <th style={styles.th}>Invoice</th>
                    <th style={styles.th}>Merchant</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice, index) => {
                      const statusStyle = getStatusStyle(invoice.status);
                      return (
                        <tr key={index}>
                          <td style={styles.td}>
                            <span style={styles.invoiceCell}>
                              {invoice.invoiceNumber || `INV-${index + 1}`}
                            </span>
                          </td>
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
                            <span style={{
                              ...styles.statusBadge,
                              background: statusStyle.bg,
                              color: statusStyle.color
                            }}>
                              {statusStyle.label}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {invoice.createdAt 
                              ? new Date(invoice.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyState}>
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
                    <th style={styles.th}>Revenue</th>
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
                        <td style={styles.td}>
                          <span style={styles.revenueCell}>
                            ₹{merchant.totalRevenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.emptyState}>
                        No merchant data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Revenue;