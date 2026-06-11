import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaFileInvoice,
  FaTruck,
  FaRupeeSign,
  FaStore,
  FaDownload,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaPrint,
} from "react-icons/fa";

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
  });
  const [selectedReport, setSelectedReport] = useState("all");
  const [dateRange, setDateRange] = useState("monthly");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Report data
  const reportsList = [
    { 
      name: "User Report", 
      value: stats.totalUsers, 
      unit: "Users",
      icon: <FaUsers size={14} />,
      color: "#3b82f6",
      bg: "#dbeafe"
    },
    { 
      name: "Shipment Report", 
      value: stats.totalShipments, 
      unit: "Shipments",
      icon: <FaTruck size={14} />,
      color: "#f59e0b",
      bg: "#fef3c7"
    },
    { 
      name: "Revenue Report", 
      value: `₹${stats.totalRevenue}`, 
      unit: "Revenue",
      icon: <FaRupeeSign size={14} />,
      color: "#10b981",
      bg: "#dcfce7"
    },
    { 
      name: "Order Report", 
      value: stats.totalOrders, 
      unit: "Orders",
      icon: <FaStore size={14} />,
      color: "#ef4444",
      bg: "#fee2e2"
    },
  ];

  // Detailed reports
  const detailedReports = [
    { id: 1, name: "Monthly Revenue Report", date: "June 2026", type: "Financial", size: "1.2 MB", status: "Ready" },
    { id: 2, name: "Quarterly Shipment Analysis", date: "Q2 2026", type: "Operations", size: "2.1 MB", status: "Ready" },
    { id: 3, name: "User Growth Report", date: "Jan-Jun 2026", type: "Analytics", size: "856 KB", status: "Ready" },
    { id: 4, name: "Courier Performance", date: "June 2026", type: "Performance", size: "1.5 MB", status: "Processing" },
    { id: 5, name: "Merchant Settlement", date: "May 2026", type: "Financial", size: "943 KB", status: "Ready" },
  ];

  // Inline styles
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
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
    filterGroup: {
      display: "flex",
      gap: "10px"
    },
    filterSelect: {
      padding: "8px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "13px",
      color: "#334155",
      cursor: "pointer"
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
    statIconWrapper: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    // Reports Section
    reportsBox: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "30px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    reportsTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0"
    },
    reportItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 0",
      borderBottom: "1px solid #f1f5f9"
    },
    reportInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    reportIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    reportName: {
      fontWeight: "600",
      color: "#0f172a"
    },
    downloadBtn: {
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "transform 0.2s"
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
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    tableTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    generateBtn: {
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
    statusBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600"
    },
    actionGroup: {
      display: "flex",
      gap: "8px"
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
    valueCell: {
      fontWeight: "700",
      color: "#0f172a"
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>📊 Reports Center</h1>
          <p style={styles.welcomeSubtitle}>
            Generate, download and analyze business reports and analytics
          </p>
        </div>

        {/* Header with Filters */}
        <div style={styles.headerBlock}>
          <div>
            <h1 style={styles.headerTitle}>Reports & Analytics</h1>
            <p style={styles.headerSubtitle}>Generate and download business reports</p>
          </div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect} value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
              <option value="all">All Reports</option>
              <option value="financial">Financial Reports</option>
              <option value="operations">Operations Reports</option>
              <option value="analytics">Analytics Reports</option>
            </select>
            <select style={styles.filterSelect} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Users</div>
              <h2 style={styles.statValue}>{stats.totalUsers}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaFileInvoice color="#3b82f6" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{stats.totalShipments}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaTruck color="#f59e0b" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Revenue</div>
              <h2 style={styles.statValue}>₹{stats.totalRevenue}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaRupeeSign color="#10b981" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Orders</div>
              <h2 style={styles.statValue}>{stats.totalOrders}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaStore color="#ef4444" size={22} />
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div style={styles.reportsBox}>
          <h2 style={styles.reportsTitle}>📋 Available Reports</h2>
          {reportsList.map((report, index) => (
            <div style={styles.reportItem} key={index}>
              <div style={styles.reportInfo}>
                <div style={{ ...styles.reportIcon, background: report.bg, color: report.color }}>
                  {report.icon}
                </div>
                <div>
                  <div style={styles.reportName}>{report.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{report.unit} Summary</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ fontWeight: "700", color: "#0f172a" }}>{report.value}</div>
                <button style={styles.downloadBtn}>
                  <FaDownload size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Generated Reports Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Generated Reports</h3>
            <button style={styles.generateBtn}>
              <FaFilePdf size={14} /> Generate New Report
            </button>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>REPORT NAME</th>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>TYPE</th>
                  <th style={styles.th}>SIZE</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {detailedReports.map((report) => (
                  <tr key={report.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaFileInvoice color={report.type === "Financial" ? "#10b981" : report.type === "Operations" ? "#f59e0b" : "#3b82f6"} size={16} />
                        <span style={{ fontWeight: "500" }}>{report.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaCalendarAlt size={12} color="#94a3b8" />
                        {report.date}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" }}>
                        {report.type}
                      </span>
                    </td>
                    <td style={styles.td}>{report.size}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: report.status === "Ready" ? "#dcfce7" : "#fef3c7",
                        color: report.status === "Ready" ? "#166534" : "#92400e"
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button style={styles.actionBtn} title="View Report">
                          <FaEye size={13} />
                        </button>
                        <button style={styles.actionBtn} title="Download PDF">
                          <FaFilePdf size={13} color="#ef4444" />
                        </button>
                        <button style={styles.actionBtn} title="Download Excel">
                          <FaFileExcel size={13} color="#10b981" />
                        </button>
                        <button style={styles.actionBtn} title="Print">
                          <FaPrint size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ ...styles.reportsBox, marginTop: "30px", marginBottom: "0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Total Reports Generated</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>24</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>This Month</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>8</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Last Download</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Today, 10:30 AM</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;