import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaFileInvoice,
  FaTruck,
  FaRupeeSign,
  FaStore,
  FaCalendarAlt,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaPrint,
  FaPlus,
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

  // Detailed reports
  const detailedReports = [
    { id: 1, name: "Monthly Revenue Report", date: "June 2026", type: "Financial", size: "1.2 MB", status: "Ready" },
    { id: 2, name: "Quarterly Shipment Analysis", date: "Q2 2026", type: "Operations", size: "2.1 MB", status: "Ready" },
    { id: 3, name: "User Growth Report", date: "Jan-Jun 2026", type: "Analytics", size: "856 KB", status: "Ready" },
    { id: 4, name: "Courier Performance", date: "June 2026", type: "Performance", size: "1.5 MB", status: "Processing" },
    { id: 5, name: "Merchant Settlement", date: "May 2026", type: "Financial", size: "943 KB", status: "Ready" },
  ];

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
    filterGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    filterSelect: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "13px",
      color: "#334155",
      cursor: "pointer",
      outline: "none"
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
      borderRadius: "16px",  // Changed from 12px to 16px
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
    // Table Section
    tableContainer: {
      background: "white",
      borderRadius: "16px",  // Changed from 12px to 16px
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #eef2f6"
    },
    tableHeader: {
      padding: "16px 24px",
      borderBottom: "1px solid #eef2f6",
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px"
    },
    tableTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0
    },
    generateBtn: {
      background: "#3b82f6",
      border: "none",
      padding: "8px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#fff",
      transition: "all 0.2s"
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
      color: "#64748b",
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
    statusBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500"
    },
    actionGroup: {
      display: "flex",
      gap: "6px"
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
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Header */}
        <div style={styles.headerBlock}>
          <div>
            <h1 style={styles.headerTitle}>Reports & Analytics</h1>
            <p style={styles.headerSubtitle}>Generate and download business reports</p>
          </div>
          <div style={styles.filterGroup}>
            <select 
              style={styles.filterSelect} 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="financial">Financial Reports</option>
              <option value="operations">Operations Reports</option>
              <option value="analytics">Analytics Reports</option>
            </select>
            <select 
              style={styles.filterSelect} 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
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
              <h2 style={styles.statValue}>{stats.totalUsers || 0}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaFileInvoice color="#3b82f6" size={20} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{stats.totalShipments || 0}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaTruck color="#f59e0b" size={20} />
            </div>
          </div>

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
              <h2 style={styles.statValue}>{stats.totalOrders || 0}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaStore color="#ef4444" size={20} />
            </div>
          </div>
        </div>

        {/* Generated Reports Table - Main Section */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Generated Reports</h3>
            <button style={styles.generateBtn}>
              <FaPlus size={12} /> Generate New
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
                        <FaFileInvoice 
                          color={
                            report.type === "Financial" ? "#10b981" : 
                            report.type === "Operations" ? "#f59e0b" : "#3b82f6"
                          } 
                          size={14} 
                        />
                        <span style={{ fontWeight: "500" }}>{report.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaCalendarAlt size={11} color="#94a3b8" />
                        {report.date}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        background: "#f1f5f9", 
                        padding: "3px 10px", 
                        borderRadius: "6px", 
                        fontSize: "12px",
                        color: "#475569"
                      }}>
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
                          <FaEye size={12} />
                        </button>
                        <button style={styles.actionBtn} title="Download PDF">
                          <FaFilePdf size={12} color="#ef4444" />
                        </button>
                        <button style={styles.actionBtn} title="Download Excel">
                          <FaFileExcel size={12} color="#10b981" />
                        </button>
                        <button style={styles.actionBtn} title="Print">
                          <FaPrint size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;