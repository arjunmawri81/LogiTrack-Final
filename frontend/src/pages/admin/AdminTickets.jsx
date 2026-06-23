import { useEffect, useState } from "react";
import {
  FaTicketAlt,
  FaSearch,
  FaEye,
  FaSync,
  FaCheck,
  FaTimes,
  FaReply,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaTag,
  FaBox,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("");

  const [replyData, setReplyData] = useState({
    adminRemarks: "",
    status: "IN_PROGRESS",
  });

  // Fetch all tickets (admin sees all merchants' tickets)
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets");
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update ticket status and add admin remarks
  const handleUpdateTicket = async () => {
    if (!replyData.adminRemarks.trim()) {
      return alert("Please enter remarks");
    }

    try {
      await api.patch(`/tickets/${selectedTicket._id}/status`, {
        status: replyData.status,
        adminRemarks: replyData.adminRemarks,
      });

      alert("Ticket Updated Successfully");
      setShowReplyModal(false);
      setReplyData({
        adminRemarks: "",
        status: "IN_PROGRESS",
      });
      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Failed to update ticket");
    }
  };

  // Resolve ticket
  const handleResolveTicket = async (ticketId) => {
    if (!window.confirm("Resolve this ticket?")) return;

    try {
      await api.patch(`/tickets/${ticketId}/status`, {
        status: "RESOLVED",
        adminRemarks: "Ticket resolved by admin",
      });

      alert("Ticket Resolved Successfully");
      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Failed to resolve ticket");
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm("Close this ticket?")) return;

    try {
      await api.patch(`/tickets/${ticketId}/status`, {
        status: "CLOSED",
        adminRemarks: "Ticket closed by admin",
      });

      alert("Ticket Closed Successfully");
      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Failed to close ticket");
    }
  };

  // Stats
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const progressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;
  const closedTickets = tickets.filter((t) => t.status === "CLOSED").length;

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.awb?.toLowerCase().includes(search.toLowerCase()) ||
      t.merchantId?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesMerchant = !merchantFilter || t.merchantId?._id === merchantFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesMerchant;
  });

  // Get unique merchants for filter
  const uniqueMerchants = [...new Map(
    tickets
      .filter(t => t.merchantId)
      .map(t => [t.merchantId._id, t.merchantId])
  ).values()];

  // Helper functions
  const getStatusColor = (status) => {
    switch(status) {
      case "OPEN": return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status?.replace(/_/g, " ")}
      </span>
    );
  };

  // Styles matching Merchants page
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
      gridTemplateColumns: "repeat(5, 1fr)",
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
    filterContainer: {
      display: "flex",
      gap: "12px",
      marginBottom: "25px",
      flexWrap: "wrap"
    },
    searchBox: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      background: "white",
      padding: "12px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      minWidth: "200px"
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      marginLeft: "12px",
      fontSize: "14px",
      background: "transparent"
    },
    filterSelect: {
      padding: "12px 16px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "14px",
      color: "#0f172a",
      outline: "none",
      minWidth: "140px"
    },
    refreshBtn: {
      padding: "12px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#64748b",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      transition: "all 0.2s"
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
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#94a3b8",
      background: "white"
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
      gap: "6px",
      transition: "all 0.2s"
    }
  };

  // Modal styles
  const modalStyles = {
    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "20px"
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "24px",
      width: "100%",
      maxWidth: "700px",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    modalHeader: {
      padding: "24px 28px",
      borderBottom: "1px solid #eef2f6",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#fafbfc"
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    modalClose: {
      background: "none",
      border: "none",
      fontSize: "24px",
      color: "#94a3b8",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "8px",
      transition: "all 0.2s"
    },
    modalBody: {
      padding: "28px",
      overflowY: "auto",
      flex: 1
    },
    modalFooter: {
      padding: "20px 28px",
      borderTop: "1px solid #eef2f6",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      background: "#fafbfc"
    },
    merchantCard: {
      background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
      padding: "16px 20px",
      borderRadius: "16px",
      marginBottom: "24px",
      border: "1px solid #e9d5ff"
    },
    merchantName: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#6b21a5",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    merchantEmail: {
      fontSize: "14px",
      color: "#7c3aed",
      margin: "4px 0 0 0",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "20px"
    },
    infoItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    },
    infoLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    infoValue: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    descriptionBox: {
      background: "#f8fafc",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid #eef2f6",
      marginBottom: "16px"
    },
    descriptionLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px"
    },
    descriptionText: {
      fontSize: "14px",
      color: "#1e293b",
      lineHeight: "1.6",
      margin: 0
    },
    adminRemarkBox: {
      background: "#eff6ff",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid #bfdbfe"
    },
    adminRemarkLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#3b82f6",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px"
    },
    adminRemarkText: {
      fontSize: "14px",
      color: "#1e40af",
      lineHeight: "1.6",
      margin: 0
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #eef2f6",
      flexWrap: "wrap"
    },
    btnPrimary: {
      padding: "10px 20px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s"
    },
    btnClose: {
      padding: "10px 24px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#64748b",
      fontWeight: "500",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s"
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>
            🎫 Support Tickets
          </h1>
          <p style={styles.headerSubtitle}>
            View and manage all merchant support tickets
          </p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Total Tickets</div>
              <h2 style={styles.statValue}>{totalTickets}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaTicketAlt color="#3b82f6" size={22} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Open</div>
              <h2 style={styles.statValue}>{openTickets}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaTicketAlt color="#f59e0b" size={22} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>In Progress</div>
              <h2 style={styles.statValue}>{progressTickets}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaTicketAlt color="#3b82f6" size={22} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Resolved</div>
              <h2 style={styles.statValue}>{resolvedTickets}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaTicketAlt color="#10b981" size={22} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Closed</div>
              <h2 style={styles.statValue}>{closedTickets}</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#f1f5f9" }}>
              <FaTicketAlt color="#64748b" size={22} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterContainer}>
          <div style={styles.searchBox}>
            <FaSearch color="#94a3b8" size={16} />
            <input
              type="text"
              placeholder="Search by Ticket #, AWB, or Merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select
            value={merchantFilter}
            onChange={(e) => setMerchantFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Merchants</option>
            {uniqueMerchants.map((merchant) => (
              <option key={merchant._id} value={merchant._id}>
                {merchant.name || merchant.email}
              </option>
            ))}
          </select>
          <button
            onClick={fetchTickets}
            style={styles.refreshBtn}
            onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
            onMouseLeave={(e) => e.target.style.background = "white"}
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Tickets Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Ticket List</h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Showing {filteredTickets.length} of {tickets.length}
            </span>
          </div>
          
          {loading ? (
            <div style={styles.noData}>Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div style={styles.noData}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎫</div>
              <p style={{ margin: 0, fontWeight: "500" }}>
                {search || statusFilter || priorityFilter || merchantFilter
                  ? "No tickets match your filters"
                  : "No Support Tickets Found"}
              </p>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                All tickets from merchants will appear here.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ticket #</th>
                  <th style={styles.th}>Merchant</th>
                  <th style={styles.th}>AWB</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td style={styles.td}>
                      <strong style={{ color: "#0f172a" }}>{ticket.ticketNumber}</strong>
                    </td>
                    <td style={styles.td}>
                      {ticket.merchantId?.name || ticket.merchantId?.email || "Unknown"}
                    </td>
                    <td style={styles.td}>{ticket.awb || "-"}</td>
                    <td style={styles.td}>
                      {ticket.issueType?.replace(/_/g, " ")}
                    </td>
                    <td style={styles.td}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td style={styles.td}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowViewModal(true);
                          }}
                          style={styles.actionBtn}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setReplyData({
                                  adminRemarks: "",
                                  status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
                                });
                                setShowReplyModal(true);
                              }}
                              style={{ ...styles.actionBtn, color: "#3b82f6" }}
                              title="Reply & Update"
                            >
                              <FaReply />
                            </button>
                            <button
                              onClick={() => handleResolveTicket(ticket._id)}
                              style={{ ...styles.actionBtn, color: "#10b981" }}
                              title="Resolve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleCloseTicket(ticket._id)}
                              style={{ ...styles.actionBtn, color: "#ef4444" }}
                              title="Close"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {ticket.status === "RESOLVED" && (
                          <button
                            onClick={() => handleCloseTicket(ticket._id)}
                            style={{ ...styles.actionBtn, color: "#ef4444" }}
                            title="Close"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Ticket Modal - Redesigned */}
      {showViewModal && selectedTicket && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            {/* Modal Header */}
            <div style={modalStyles.modalHeader}>
              <h3 style={modalStyles.modalTitle}>
                <FaTicketAlt style={{ color: "#7c3aed" }} />
                Ticket Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={modalStyles.modalClose}
                onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={modalStyles.modalBody}>
              {/* Merchant Info Card */}
              <div style={modalStyles.merchantCard}>
                <p style={modalStyles.merchantName}>
                  <FaUser size={16} />
                  {selectedTicket.merchantId?.name || "Unknown Merchant"}
                </p>
                <p style={modalStyles.merchantEmail}>
                  <FaEnvelope size={14} />
                  {selectedTicket.merchantId?.email || "No email available"}
                </p>
              </div>

              {/* Ticket Info Grid */}
              <div style={modalStyles.infoGrid}>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>
                    <FaTag size={12} style={{ marginRight: "4px" }} />
                    Ticket Number
                  </span>
                  <span style={modalStyles.infoValue}>
                    {selectedTicket.ticketNumber}
                  </span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>
                    <FaBox size={12} style={{ marginRight: "4px" }} />
                    AWB
                  </span>
                  <span style={modalStyles.infoValue}>
                    {selectedTicket.awb || "-"}
                  </span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>
                    <FaExclamationTriangle size={12} style={{ marginRight: "4px" }} />
                    Issue Type
                  </span>
                  <span style={modalStyles.infoValue}>
                    {selectedTicket.issueType?.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>Priority</span>
                  <span style={modalStyles.infoValue}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>Status</span>
                  <span style={modalStyles.infoValue}>
                    {getStatusBadge(selectedTicket.status)}
                  </span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>
                    <FaClock size={12} style={{ marginRight: "4px" }} />
                    Created Date
                  </span>
                  <span style={modalStyles.infoValue}>
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={modalStyles.descriptionBox}>
                <div style={modalStyles.descriptionLabel}>Description</div>
                <p style={modalStyles.descriptionText}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Admin Remarks */}
              {selectedTicket.adminRemarks && (
                <div style={modalStyles.adminRemarkBox}>
                  <div style={modalStyles.adminRemarkLabel}>
                    <FaReply size={12} style={{ marginRight: "4px" }} />
                    Admin Remarks
                  </div>
                  <p style={modalStyles.adminRemarkText}>
                    {selectedTicket.adminRemarks}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {(selectedTicket.status === "OPEN" || selectedTicket.status === "IN_PROGRESS") && (
                <div style={modalStyles.actionButtons}>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setReplyData({
                        adminRemarks: "",
                        status: selectedTicket.status === "OPEN" ? "IN_PROGRESS" : selectedTicket.status,
                      });
                      setShowReplyModal(true);
                    }}
                    style={{
                      ...modalStyles.btnPrimary,
                      background: "#3b82f6",
                      color: "white"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                    onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
                  >
                    <FaReply /> Reply & Update
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleResolveTicket(selectedTicket._id);
                    }}
                    style={{
                      ...modalStyles.btnPrimary,
                      background: "#10b981",
                      color: "white"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#059669"}
                    onMouseLeave={(e) => e.target.style.background = "#10b981"}
                  >
                    <FaCheck /> Resolve
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleCloseTicket(selectedTicket._id);
                    }}
                    style={{
                      ...modalStyles.btnPrimary,
                      background: "#6b7280",
                      color: "white"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#4b5563"}
                    onMouseLeave={(e) => e.target.style.background = "#6b7280"}
                  >
                    <FaTimes /> Close
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={modalStyles.modalFooter}>
              <button
                onClick={() => setShowViewModal(false)}
                style={modalStyles.btnClose}
                onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.target.style.background = "white"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Ticket</h2>
            <p className="text-sm text-gray-600 mb-4">
              Ticket: <span className="font-medium">{selectedTicket.ticketNumber}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={replyData.status}
                  onChange={(e) => setReplyData({...replyData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyData.adminRemarks}
                  onChange={(e) => setReplyData({...replyData, adminRemarks: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  placeholder="Add your remarks..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {replyData.adminRemarks.length}/500
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyData({
                    adminRemarks: "",
                    status: "IN_PROGRESS",
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTicket}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;