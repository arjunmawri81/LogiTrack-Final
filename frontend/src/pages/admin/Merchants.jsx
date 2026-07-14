// src/pages/admin/Merchants.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaStore,
  FaUserCheck,
  FaBan,
  FaSearch,
  FaClock,
  FaEye,
  FaTimes,
  FaMoneyBillWave,
  FaBox,
  FaShoppingCart,
} from "react-icons/fa";

const Merchants = () => {
  // States
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

  // View Merchant function
  const viewMerchant = async (id) => {
    setLoading(true);

    try {
      const response = await api.get(`/admin/merchant/${id}`);
      console.log("Full Response:", response.data);
      
      // Store the entire response data
      setSelectedMerchant(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching merchant details:", error);
      alert("Failed to fetch merchant details");
    } finally {
      setLoading(false);
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
      color: "#0f172a"
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
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "18px 20px",
      borderBottom: "1px solid #f1f5f9",
      color: "#1e293b",
      background: "#ffffff",
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
      gap: "8px",
      flexWrap: "wrap"
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
      gap: "6px",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#94a3b8",
      background: "white"
    },
    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    },
    modalContent: {
      background: "white",
      borderRadius: "24px",
      padding: "40px",
      maxWidth: "700px",
      width: "90%",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
    },
    modalClose: {
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#94a3b8",
      padding: "8px",
      borderRadius: "8px",
      transition: "all 0.2s"
    },
    modalTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "24px",
      borderBottom: "2px solid #f1f5f9",
      paddingBottom: "16px"
    },
    modalField: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9"
    },
    modalLabel: {
      fontWeight: "600",
      color: "#64748b",
      fontSize: "14px"
    },
    modalValue: {
      color: "#0f172a",
      fontSize: "14px",
      fontWeight: "500"
    },
    modalStatusBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600"
    },
    loadingSpinner: {
      textAlign: "center",
      padding: "40px",
      color: "#64748b"
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "2px solid #f1f5f9"
    },
    statItem: {
      textAlign: "center",
      padding: "12px",
      background: "#f8fafc",
      borderRadius: "12px"
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0f172a"
    },
    statLabel: {
      fontSize: "12px",
      color: "#64748b",
      marginTop: "4px"
    },
    viewRateCardsBtn: {
      width: "100%",
      marginTop: "20px",
      padding: "12px",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.2s"
    }
  };

  // ✅ Function to close modal and reset selected merchant
  const closeModal = () => {
    setShowModal(false);
    setSelectedMerchant(null);
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
                        <button
                          onClick={() => viewMerchant(merchant._id)}
                          style={{
                            ...styles.actionBtn,
                            background: "#eff6ff",
                            color: "#3b82f6",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <FaEye />
                          View
                        </button>

                        {!merchant.isApproved && (
                          <button
                            style={{
                              ...styles.actionBtn,
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                            }}
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

      {/* Merchant Details Modal */}
      {showModal && selectedMerchant && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.modalClose}
              onClick={closeModal}
            >
              <FaTimes />
            </button>

            {loading ? (
              <div style={styles.loadingSpinner}>
                <p>Loading merchant details...</p>
              </div>
            ) : (
              <>
                <h2 style={styles.modalTitle}>
                  {selectedMerchant.merchant?.companyName || 
                   selectedMerchant.merchant?.name || 
                   "Merchant Details"}
                </h2>

                {/* Company Name */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Company Name</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.companyName || 
                     selectedMerchant.merchant?.name || 
                     "N/A"}
                  </span>
                </div>

                {/* Contact Person */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Contact Person</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.contactPerson || 
                     selectedMerchant.merchant?.name || 
                     "N/A"}
                  </span>
                </div>

                {/* Email */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Email</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.email || "N/A"}
                  </span>
                </div>

                {/* Phone */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Phone</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.phone || "N/A"}
                  </span>
                </div>

                {/* Address */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Address</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.address || 
                     selectedMerchant.merchant?.businessAddress || 
                     "N/A"}
                  </span>
                </div>

                {/* GST Number */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>GST Number</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.gstNumber || 
                     selectedMerchant.merchant?.gst || 
                     "N/A"}
                  </span>
                </div>

                {/* Business Type */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Business Type</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.businessType || 
                     selectedMerchant.merchant?.business || 
                     "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Status</span>
                  <span>
                    <span style={{
                      ...styles.modalStatusBadge,
                      background: selectedMerchant.merchant?.isBlocked
                        ? "#fee2e2"
                        : selectedMerchant.merchant?.isApproved
                        ? "#dcfce7"
                        : "#fef3c7",
                      color: selectedMerchant.merchant?.isBlocked
                        ? "#dc2626"
                        : selectedMerchant.merchant?.isApproved
                        ? "#166534"
                        : "#d97706",
                    }}>
                      {selectedMerchant.merchant?.isBlocked
                        ? "Blocked"
                        : selectedMerchant.merchant?.isApproved
                        ? "Approved"
                        : "Pending"}
                    </span>
                  </span>
                </div>

                {/* Joined Date */}
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Joined Date</span>
                  <span style={styles.modalValue}>
                    {selectedMerchant.merchant?.createdAt
                      ? new Date(selectedMerchant.merchant.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {/* Stats Row: Wallet Balance, Total Orders, Total Shipments */}
                <div style={styles.statsRow}>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>
                      ₹{selectedMerchant.walletBalance || 0}
                    </div>
                    <div style={styles.statLabel}>
                      <FaMoneyBillWave style={{ marginRight: "4px" }} />
                      Wallet Balance
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>
                      {selectedMerchant.totalOrders || 0}
                    </div>
                    <div style={styles.statLabel}>
                      <FaShoppingCart style={{ marginRight: "4px" }} />
                      Total Orders
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>
                      {selectedMerchant.totalShipments || 0}
                    </div>
                    <div style={styles.statLabel}>
                      <FaBox style={{ marginRight: "4px" }} />
                      Total Shipments
                    </div>
                  </div>
                </div>

                {/* View Rate Cards Button with modal close */}
                <button
                  style={styles.viewRateCardsBtn}
                  onClick={() => {
                    closeModal(); // ✅ Close modal first
                    navigate(`/admin/ratecard/${selectedMerchant.merchant._id}`);
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#2563eb";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "#3b82f6";
                  }}
                >
                  <FaEye size={16} />
                  View Rate Cards
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;