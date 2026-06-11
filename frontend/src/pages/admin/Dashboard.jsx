import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { FaUsers, FaTruck, FaRupeeSign, FaBox } from "react-icons/fa";

const Dashboard = () => {
  // Static data - single source of truth
  const [stats] = useState({ 
    totalUsers: 3, 
    totalOrders: 1, 
    totalShipments: 2, 
    totalRevenue: 500 
  });

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      fontFamily: "'Inter', sans-serif"
    },
   // MainContent style mein "width" property hata do
mainContent: {
  flex: 1,
  marginLeft: "280px",  // Ye add karo
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  overflowX: "hidden",
  padding: "20px 30px",
  minWidth: 0
},
    headerBlock: {
      marginBottom: "30px"
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "35px"
    },
    card: {
      padding: "24px",
      borderRadius: "16px",
      color: "white"
    },
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px"
    },
    cardLabel: {
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    cardValue: {
      fontSize: "38px",
      fontWeight: "800",
      margin: 0
    },
    overviewBox: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0"
    },
    overviewTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px"
    },
    statCard: {
      backgroundColor: "#f8fafc",
      padding: "16px",
      borderRadius: "12px",
      borderLeft: "4px solid"
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "8px"
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <p style={styles.headerSubtitle}>
            Complete platform monitoring, operational logs, and business analytics
          </p>
        </div>

        {/* 4 Cards - Only Once */}
        <div style={styles.cardsGrid}>
          <div style={{ ...styles.card, background: "linear-gradient(135deg, #1e40af, #1d4ed8)" }}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Users</span>
              <FaUsers size={20} />
            </div>
            <p style={styles.cardValue}>{stats.totalUsers}</p>
          </div>

          <div style={{ ...styles.card, background: "linear-gradient(135deg, #065f46, #10b981)" }}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Orders</span>
              <FaBox size={20} />
            </div>
            <p style={styles.cardValue}>{stats.totalOrders}</p>
          </div>

          <div style={{ ...styles.card, background: "linear-gradient(135deg, #c2410c, #ea580c)" }}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Shipments</span>
              <FaTruck size={20} />
            </div>
            <p style={styles.cardValue}>{stats.totalShipments}</p>
          </div>

          <div style={{ ...styles.card, background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Revenue</span>
              <FaRupeeSign size={20} />
            </div>
            <p style={styles.cardValue}>₹{stats.totalRevenue}</p>
          </div>
        </div>

        {/* Platform Overview - Only Once */}
        <div style={styles.overviewBox}>
          <h2 style={styles.overviewTitle}>Platform Overview</h2>
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderLeftColor: "#2563eb" }}>
              <div style={styles.statLabel}>Total Users</div>
              <h2 style={styles.statValue}>{stats.totalUsers}</h2>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: "#10b981" }}>
              <div style={styles.statLabel}>Total Orders</div>
              <h2 style={styles.statValue}>{stats.totalOrders}</h2>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: "#f97316" }}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{stats.totalShipments}</h2>
            </div>
            <div style={{ ...styles.statCard, borderLeftColor: "#9333ea" }}>
              <div style={styles.statLabel}>Total Revenue</div>
              <h2 style={styles.statValue}>₹{stats.totalRevenue}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;