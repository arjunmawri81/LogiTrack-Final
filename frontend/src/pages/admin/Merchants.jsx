// src/pages/admin/Merchants.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaStore,
  FaUserCheck,
  FaBan,
  FaSearch,
  FaClock,
} from "react-icons/fa";

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get("/admin/merchants");
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.log("Merchants Fetch Error Log:", error);
    }
  };

  const approveMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/approve`);
      fetchMerchants();
      alert("✅ Merchant Approved Successfully");
    } catch (error) {
      console.error("Approval Error:", error);
      alert("❌ Approval Failed. Please try again.");
    }
  };

  const blockMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/block`);
      fetchMerchants();
      alert("🔒 Merchant Blocked Successfully");
    } catch (error) {
      console.error("Block Error:", error);
      alert("❌ Block Failed. Please try again.");
    }
  };

  const unblockMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/unblock`);
      fetchMerchants();
      alert("✅ Merchant Unblocked Successfully");
    } catch (error) {
      console.error("Unblock Error:", error);
      alert("❌ Unblock Failed. Please try again.");
    }
  };

  const activeMerchants = merchants.filter(
    (m) => m.isApproved && !m.isBlocked
  ).length;
  
  const blockedMerchants = merchants.filter((m) => m.isBlocked).length;
  const pendingMerchants = merchants.filter((m) => !m.isApproved).length;

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "8px"
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
    searchBox: {
      display: "flex",
      alignItems: "center",
      background: "white",
      padding: "12px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "25px"
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      marginLeft: "12px",
      fontSize: "14px",
      background: "transparent"
    },
    tableContainer: {
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #eef2f6",
      color: "#0f172a" // ✅ Added
    },
    tableHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #eef2f6",
      background: "white" // ✅ Added
    },
    tableTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white" // ✅ Added
    },
    th: {
      textAlign: "left",
      padding: "16px 20px",
      background: "#f8fafc",
      color: "#475569",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "18px 20px",
      borderBottom: "1px solid #f1f5f9",
      color: "#1e293b",
      background: "#ffffff", // ✅ Added - Force white
      fontSize: "14px"
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
      fontWeight: "700"
    },
    companyName: {
      fontWeight: "700",
      color: "#0f172a"
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
      fontSize: "12px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    },
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#94a3b8",
      background: "white" // ✅ Added
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>
            🏪 Merchant Management
          </h1>
          <p style={styles.headerSubtitle}>
            View and manage all registered merchants
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Total Merchants</div>
              <h2 style={styles.statValue}>{merchants.length}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaStore color="#3b82f6" size={22} />
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Active Merchants</div>
              <h2 style={styles.statValue}>{activeMerchants}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaUserCheck color="#10b981" size={22} />
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Blocked Accounts</div>
              <h2 style={styles.statValue}>{blockedMerchants}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaBan color="#ef4444" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Pending Approval</div>
              <h2 style={styles.statValue}>{pendingMerchants}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaClock color="#f59e0b" size={22} />
            </div>
          </div>
        </div>

        <div style={styles.searchBox}>
          <FaSearch color="#94a3b8" size={16} />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Merchant List</h3>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>COMPANY</th>
                <th style={styles.th}>EMAIL</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <tr
                    key={merchant._id}
                    style={{
                      background: "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                          {merchant.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={styles.companyName}>{merchant.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{merchant.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: merchant.isBlocked
                          ? "#fee2e2"
                          : merchant.isApproved
                          ? "#dcfce7"
                          : "#fef3c7",
                        color: merchant.isBlocked
                          ? "#dc2626"
                          : merchant.isApproved
                          ? "#166534"
                          : "#d97706",
                      }}>
                        {merchant.isBlocked
                          ? "Blocked"
                          : merchant.isApproved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        {!merchant.isApproved && (
                          <button
                            style={styles.actionBtn}
                            onClick={() => approveMerchant(merchant._id)}
                          >
                            Approve
                          </button>
                        )}
                        
                        {merchant.isBlocked ? (
                          <button
                            style={{
                              ...styles.actionBtn,
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                            }}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Unblock "${merchant.name}"?`
                                )
                              ) {
                                unblockMerchant(merchant._id);
                              }
                            }}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            style={{
                              ...styles.actionBtn,
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                            }}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Block "${merchant.name}"?`
                                )
                              ) {
                                blockMerchant(merchant._id);
                              }
                            }}
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={styles.noData}>
                    {searchTerm ? "No merchants match your search" : "No Merchants Found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Merchants;