import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaTruck,
  FaLink,
  FaTimesCircle,
  FaChartLine,
  FaEye,
  FaEdit,
  FaPlug,
  FaPowerOff,
} from "react-icons/fa";

const Couriers = () => {
  const [stats, setStats] = useState({
    totalShipments: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const couriers = [
    {
      name: "DTDC",
      apiStatus: "Connected",
      priority: "#1",
      status: "Active",
      performance: 98,
    },
    {
      name: "Delhivery",
      apiStatus: "Connected",
      priority: "#2",
      status: "Active",
      performance: 96,
    },
    {
      name: "Blue Dart",
      apiStatus: "Disconnected",
      priority: "#3",
      status: "Inactive",
      performance: 91,
    },
    {
      name: "XpressBees",
      apiStatus: "Connected",
      priority: "#4",
      status: "Active",
      performance: 95,
    },
  ];

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
      background: "linear-gradient(135deg, #ea580c, #c2410c)",
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
      marginBottom: "25px"
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
    // Performance Section
    performanceBox: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "30px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    performanceTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0"
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
      background: "linear-gradient(90deg, #f59e0b, #ea580c)",
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
    courierInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    courierAvatar: {
      width: "40px",
      height: "40px",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "12px",
      fontWeight: "700"
    },
    courierName: {
      fontWeight: "600",
      color: "#0f172a"
    },
    apiStatusBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600"
    },
    statusBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600"
    },
    priorityBadge: {
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#f1f5f9",
      color: "#475569"
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
    }
  };

  const getApiStatusStyle = (status) => {
    if (status === "Connected") {
      return { ...styles.apiStatusBadge, background: "#dcfce7", color: "#166534" };
    }
    return { ...styles.apiStatusBadge, background: "#fee2e2", color: "#991b1b" };
  };

  const getStatusStyle = (status) => {
    if (status === "Active") {
      return { ...styles.statusBadge, background: "#dcfce7", color: "#166534" };
    }
    return { ...styles.statusBadge, background: "#fee2e2", color: "#991b1b" };
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>🚚 Courier Management</h1>
          <p style={styles.welcomeSubtitle}>
            Manage courier integrations, track API performance and monitor deliveries
          </p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Couriers</div>
              <h2 style={styles.statValue}>{couriers.length}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaTruck color="#f59e0b" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Connected APIs</div>
              <h2 style={styles.statValue}>
                {couriers.filter(c => c.apiStatus === "Connected").length}
              </h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaLink color="#10b981" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Failed APIs</div>
              <h2 style={styles.statValue}>
                {couriers.filter(c => c.apiStatus === "Disconnected").length}
              </h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaTimesCircle color="#ef4444" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{stats.totalShipments}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaChartLine color="#3b82f6" size={22} />
            </div>
          </div>
        </div>

        {/* Courier Performance Section */}
        <div style={styles.performanceBox}>
          <h2 style={styles.performanceTitle}>📊 Courier Performance</h2>
          {couriers.map((courier) => (
            <div style={styles.progressItem} key={courier.name}>
              <div style={styles.progressHeader}>
                <span>{courier.name}</span>
                <span>{courier.performance}%</span>
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${courier.performance}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Couriers Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Courier Partner List</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>COURIER</th>
                  <th style={styles.th}>API STATUS</th>
                  <th style={styles.th}>PRIORITY</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((courier) => (
                  <tr key={courier.name}>
                    <td style={styles.td}>
                      <div style={styles.courierInfo}>
                        <div style={styles.courierAvatar}>
                          {courier.name.substring(0, 2)}
                        </div>
                        <span style={styles.courierName}>{courier.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={getApiStatusStyle(courier.apiStatus)}>
                        {courier.apiStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priorityBadge}>{courier.priority}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(courier.status)}>
                        {courier.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button style={styles.actionBtn} title="View Details">
                          <FaEye size={13} />
                        </button>
                        <button style={styles.actionBtn} title="Edit">
                          <FaEdit size={13} />
                        </button>
                        {courier.apiStatus === "Connected" ? (
                          <button style={styles.actionBtn} title="Disconnect">
                            <FaPowerOff size={13} color="#ef4444" />
                          </button>
                        ) : (
                          <button style={styles.actionBtn} title="Connect">
                            <FaPlug size={13} color="#10b981" />
                          </button>
                        )}
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

export default Couriers;