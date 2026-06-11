// src/pages/admin/Merchants.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaStore,
  FaUserCheck,
  FaBan,
  FaWallet,
  FaEye,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get("/admin/users");
      const merchantUsers = response.data.users.filter(
        (user) => user.role === "MERCHANT"
      );
      setMerchants(merchantUsers);
    } catch (error) {
      console.log("Merchants Fetch Error Log:", error);
    }
  };

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inline styles - Improved with white table
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
    // Welcome Section
    welcomeSection: {
      background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
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
      margin: "0 0 12px 0"
    },
    loginInfo: {
      fontSize: "12px",
      opacity: 0.75,
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
    // Stats Grid
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
    // Search Box
    searchBox: {
      display: "flex",
      alignItems: "center",
      background: "white",
      padding: "12px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "25px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      marginLeft: "12px",
      fontSize: "14px",
      background: "transparent"
    },
    // Table Section - IMPROVED WHITE BACKGROUND
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
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    avatar: {
      width: "40px",
      height: "40px",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "14px",
      fontWeight: "700"
    },
    companyName: {
      fontWeight: "700",
      color: "#0f172a"
    },
    ownerName: {
      fontWeight: "500",
      color: "#1e293b"
    },
    emailText: {
      color: "#64748b"
    },
    walletAmount: {
      fontWeight: "700",
      color: "#0f172a"
    },
    statusBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#dcfce7",
      color: "#166534"
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
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#94a3b8",
      fontSize: "14px"
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Welcome Back, Admin</h1>
          <p style={styles.welcomeSubtitle}>
            Manage merchants, couriers and platform operations
          </p>
          <p style={styles.loginInfo}>Last Login: Today, 10:25 AM</p>
        </div>

        {/* Merchants Header */}
        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>🏢 Merchants Management</h1>
          <p style={styles.headerSubtitle}>
            Manage merchants, wallets, profiles, and platform clearance status
          </p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Merchants</div>
              <h2 style={styles.statValue}>{merchants.length}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaStore color="#3b82f6" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Active Merchants</div>
              <h2 style={styles.statValue}>{merchants.length}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaUserCheck color="#10b981" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Blocked Accounts</div>
              <h2 style={styles.statValue}>0</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaBan color="#ef4444" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Wallet Balance</div>
              <h2 style={styles.statValue}>₹0</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaWallet color="#f59e0b" size={22} />
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div style={styles.searchBox}>
          <FaSearch color="#94a3b8" size={16} />
          <input
            type="text"
            placeholder="Search merchants by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Merchants Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Merchant List</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>COMPANY</th>
                  <th style={styles.th}>OWNER</th>
                  <th style={styles.th}>EMAIL</th>
                  <th style={styles.th}>WALLET</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredMerchants.length > 0 ? (
                  filteredMerchants.map((merchant) => (
                    <tr key={merchant._id}>
                      <td style={styles.td}>
                        <div style={styles.userInfo}>
                          <div style={styles.avatar}>
                            {merchant.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={styles.companyName}>{merchant.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.ownerName}>{merchant.name || "N/A"}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.emailText}>{merchant.email}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.walletAmount}>₹0</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>Active</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button style={styles.actionBtn} title="View">
                            <FaEye size={13} />
                          </button>
                          <button style={styles.actionBtn} title="Edit">
                            <FaEdit size={13} />
                          </button>
                          <button style={styles.actionBtn} title="Delete">
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={styles.noData}>
                      No Merchants Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchants;