import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import {
  FaTicketAlt,
  FaSearch,
  FaPlus,
  FaEye,
  FaSync,
} from "react-icons/fa";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [formData, setFormData] = useState({
    awb: "",
    issueType: "SHIPMENT_DELAY",
    priority: "MEDIUM",
    description: "",
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/my");
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

  const handleCreateTicket = async () => {
    if (!formData.description.trim()) {
      return alert("Description is required");
    }

    if (formData.description.length < 10) {
      return alert("Please enter at least 10 characters");
    }

    try {
      await api.post("/tickets", formData);
      alert("Ticket Created Successfully");
      setShowRaiseModal(false);
      setFormData({
        awb: "",
        issueType: "SHIPMENT_DELAY",
        priority: "MEDIUM",
        description: "",
      });
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const progressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;
  const closedTickets = tickets.filter((t) => t.status === "CLOSED").length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.awb?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  // ============================================
  // STYLES (Following Reports.jsx pattern)
  // ============================================
  const s = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
    },

    main: {
      flex: 1,
      marginLeft: "280px",
      padding: "30px",
      width: "calc(100% - 280px)",
      boxSizing: "border-box",
    },

    header: {
      marginBottom: "30px",
    },

    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "6px",
    },

    headerSubtitle: {
      color: "#64748b",
      margin: 0,
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "20px",
      marginBottom: "30px",
    },

    statsCard: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },

    statsLabel: {
      fontSize: "13px",
      color: "#64748b",
      textTransform: "uppercase",
      fontWeight: "600",
    },

    statsValue: {
      margin: "8px 0 0",
      color: "#0f172a",
      fontSize: "32px",
      fontWeight: "700",
    },

    filterSection: {
      background: "#fff",
      padding: "20px 24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      marginBottom: "30px",
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      alignItems: "center",
    },

    searchWrapper: {
      flex: 1,
      minWidth: "200px",
      position: "relative",
    },

    searchInput: {
      width: "100%",
      padding: "10px 16px 10px 40px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },

    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
    },

    select: {
      padding: "10px 16px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      background: "#fff",
      outline: "none",
      minWidth: "140px",
    },

    refreshBtn: {
      padding: "10px 20px",
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#475569",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    tableWrapper: {
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
    },

    th: {
      padding: "14px 20px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      borderBottom: "1px solid #e2e8f0",
      background: "#f8fafc",
    },

    td: {
      padding: "14px 20px",
      fontSize: "14px",
      color: "#0f172a",
      borderBottom: "1px solid #f1f5f9",
    },

    emptyState: {
      padding: "60px 20px",
      textAlign: "center",
    },

    emptyIcon: {
      fontSize: "64px",
      marginBottom: "16px",
    },

    emptyTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "8px",
    },

    emptySub: {
      color: "#94a3b8",
    },

    badge: {
      padding: "4px 12px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block",
    },

    actionBtn: {
      background: "none",
      border: "none",
      color: "#2563eb",
      cursor: "pointer",
      fontSize: "16px",
      padding: "4px",
    },

    // Modal Styles
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },

    modal: {
      background: "#fff",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "500px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto",
    },

    modalTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "20px",
    },

    modalLabel: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#475569",
      marginBottom: "6px",
    },

    modalInput: {
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },

    modalTextarea: {
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical",
      boxSizing: "border-box",
    },

    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
    },

    btnCancel: {
      padding: "10px 24px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      background: "#fff",
      fontSize: "14px",
      fontWeight: "500",
      color: "#475569",
      cursor: "pointer",
    },

    btnSubmit: {
      padding: "10px 24px",
      border: "none",
      borderRadius: "10px",
      background: "#2563eb",
      fontSize: "14px",
      fontWeight: "500",
      color: "#fff",
      cursor: "pointer",
    },

    viewModal: {
      background: "#fff",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "600px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto",
    },

    viewGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "16px",
    },

    viewLabel: {
      fontSize: "13px",
      color: "#94a3b8",
      marginBottom: "4px",
    },

    viewValue: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#0f172a",
    },

    viewDescription: {
      background: "#f8fafc",
      padding: "12px 16px",
      borderRadius: "10px",
      marginTop: "4px",
    },

    adminRemarks: {
      background: "#eff6ff",
      padding: "12px 16px",
      borderRadius: "10px",
      border: "1px solid #bfdbfe",
      marginTop: "4px",
    },

    charCount: {
      fontSize: "12px",
      color: "#94a3b8",
      marginTop: "4px",
      textAlign: "right",
    },

    summaryFooter: {
      padding: "12px 20px",
      background: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
      fontSize: "14px",
      color: "#64748b",
    },

    raiseBtn: {
      padding: "10px 24px",
      background: "#2563eb",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    headerFlex: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
  };

  return (
    <div style={s.container}>
      <Sidebar />

      <main style={s.main}>
        {/* Header */}
        <div style={s.headerFlex}>
          <div>
            <h1 style={s.headerTitle}>
              <FaTicketAlt style={{ display: "inline", marginRight: "10px", color: "#2563eb" }} />
              Support Tickets
            </h1>
            <p style={s.headerSubtitle}>Manage your support requests and track their status</p>
          </div>
          <button onClick={() => setShowRaiseModal(true)} style={s.raiseBtn}>
            <FaPlus /> Raise Ticket
          </button>
        </div>

        {/* Stats Cards */}
        <div style={s.statsGrid}>
          <div style={s.statsCard}>
            <div style={s.statsLabel}>Total</div>
            <h2 style={s.statsValue}>{totalTickets}</h2>
          </div>
          <div style={s.statsCard}>
            <div style={s.statsLabel}>Open</div>
            <h2 style={{ ...s.statsValue, color: "#ca8a04" }}>{openTickets}</h2>
          </div>
          <div style={s.statsCard}>
            <div style={s.statsLabel}>In Progress</div>
            <h2 style={{ ...s.statsValue, color: "#2563eb" }}>{progressTickets}</h2>
          </div>
          <div style={s.statsCard}>
            <div style={s.statsLabel}>Resolved</div>
            <h2 style={{ ...s.statsValue, color: "#16a34a" }}>{resolvedTickets}</h2>
          </div>
          <div style={s.statsCard}>
            <div style={s.statsLabel}>Closed</div>
            <h2 style={{ ...s.statsValue, color: "#64748b" }}>{closedTickets}</h2>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterSection}>
          <div style={s.searchWrapper}>
            <FaSearch style={s.searchIcon} />
            <input
              type="text"
              placeholder="Search by Ticket # or AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={s.select}
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
            style={s.select}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button onClick={fetchTickets} style={s.refreshBtn}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* Tickets Table */}
        <div style={s.tableWrapper}>
          {loading ? (
            <div style={s.emptyState}>
              <p style={{ color: "#94a3b8" }}>Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>🎫</div>
              <h3 style={s.emptyTitle}>No Support Tickets Found</h3>
              <p style={s.emptySub}>Raise your first support ticket.</p>
            </div>
          ) : (
            <>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Ticket #</th>
                    <th style={s.th}>AWB</th>
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Priority</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Created</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td style={s.td}>{ticket.ticketNumber}</td>
                      <td style={s.td}>{ticket.awb || "-"}</td>
                      <td style={s.td}>{ticket.issueType?.replace(/_/g, " ")}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          ...(ticket.priority === "HIGH" ? { background: "#fed7aa", color: "#9a3412" } :
                              ticket.priority === "MEDIUM" ? { background: "#fef08a", color: "#854d0e" } :
                              { background: "#bbf7d0", color: "#166534" })
                        }}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          ...(ticket.status === "OPEN" ? { background: "#fef08a", color: "#854d0e" } :
                              ticket.status === "IN_PROGRESS" ? { background: "#bfdbfe", color: "#1e40af" } :
                              ticket.status === "RESOLVED" ? { background: "#bbf7d0", color: "#166534" } :
                              { background: "#e2e8f0", color: "#475569" })
                        }}>
                          {ticket.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowViewModal(true);
                          }}
                          style={s.actionBtn}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={s.summaryFooter}>
                Showing {filteredTickets.length} of {tickets.length} tickets
              </div>
            </>
          )}
        </div>
      </main>

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Raise New Ticket</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.modalLabel}>
                AWB <span style={{ color: "#94a3b8", fontSize: "12px" }}>(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.awb}
                onChange={(e) => setFormData({...formData, awb: e.target.value})}
                style={s.modalInput}
                placeholder="Enter AWB number (optional)"
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.modalLabel}>Issue Type</label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                style={s.modalInput}
              >
                <option value="SHIPMENT_DELAY">Shipment Delay</option>
                <option value="TRACKING_ISSUE">Tracking Issue</option>
                <option value="NDR_ISSUE">NDR Issue</option>
                <option value="RTO_ISSUE">RTO Issue</option>
                <option value="LOST_SHIPMENT">Lost Shipment</option>
                <option value="DAMAGED_SHIPMENT">Damaged Shipment</option>
                <option value="BILLING_ISSUE">Billing Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.modalLabel}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                style={s.modalInput}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.modalLabel}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={s.modalTextarea}
                rows="4"
                maxLength={500}
                placeholder="Describe your issue in detail..."
              />
              <div style={s.charCount}>{formData.description.length}/500</div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setShowRaiseModal(false)} style={s.btnCancel}>Cancel</button>
              <button onClick={handleCreateTicket} style={s.btnSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div style={s.modalOverlay}>
          <div style={s.viewModal}>
            <h2 style={s.modalTitle}>Ticket Details</h2>
            <div style={s.viewGrid}>
              <div>
                <div style={s.viewLabel}>Ticket Number</div>
                <div style={s.viewValue}>{selectedTicket.ticketNumber}</div>
              </div>
              <div>
                <div style={s.viewLabel}>AWB</div>
                <div style={s.viewValue}>{selectedTicket.awb || "-"}</div>
              </div>
              <div>
                <div style={s.viewLabel}>Issue Type</div>
                <div style={s.viewValue}>{selectedTicket.issueType?.replace(/_/g, " ")}</div>
              </div>
              <div>
                <div style={s.viewLabel}>Priority</div>
                <div style={s.viewValue}>{selectedTicket.priority}</div>
              </div>
              <div>
                <div style={s.viewLabel}>Status</div>
                <div style={s.viewValue}>{selectedTicket.status?.replace(/_/g, " ")}</div>
              </div>
              <div>
                <div style={s.viewLabel}>Created Date</div>
                <div style={s.viewValue}>{new Date(selectedTicket.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={s.viewLabel}>Description</div>
              <div style={s.viewDescription}>{selectedTicket.description}</div>
            </div>
            {selectedTicket.adminRemarks && (
              <div style={{ marginBottom: "16px" }}>
                <div style={s.viewLabel}>Admin Remarks</div>
                <div style={s.adminRemarks}>{selectedTicket.adminRemarks}</div>
              </div>
            )}
            <div style={s.modalFooter}>
              <button onClick={() => setShowViewModal(false)} style={s.btnCancel}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;