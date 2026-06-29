import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { 
  FaTruck,
  FaSearch,
  FaDownload,
  FaTimes,
  FaEye,
  FaFileInvoice,
  FaBox,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUndo,
  FaFilter,
} from "react-icons/fa";

const Shipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      
      const res = await api.get("/shipments");
      
      console.log("SHIPMENTS =>", res.data.shipments);
      console.log("FIRST SHIPMENT =>", res.data.shipments[0]);
      
      setShipments(res.data.shipments || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED": return { background: "#dcfce7", color: "#166534" };
      case "RTO": return { background: "#fee2e2", color: "#991b1b" };
      case "NDR": return { background: "#fef3c7", color: "#92400e" };
      case "IN_TRANSIT": return { background: "#dbeafe", color: "#1d4ed8" };
      case "OUT_FOR_DELIVERY": return { background: "#dbeafe", color: "#1d4ed8" };
      case "PICKED_UP": return { background: "#e0e7ff", color: "#4338ca" };
      case "READY_FOR_PICKUP": return { background: "#fef3c7", color: "#92400e" };
      case "PROCESSING": return { background: "#fce7f3", color: "#9d174d" };
      case "PACKED": return { background: "#ede9fe", color: "#6d28d9" };
      default: return { background: "#dbeafe", color: "#1d4ed8" };
    }
  };

  const downloadLabel = async (shipmentId, awb) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/label`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Label-${awb}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Label download failed");
    }
  };

  // ✅ UPDATED: Fixed Invoice download function
  const downloadInvoice = async (shipment) => {
    try {
      let invoiceId = null;

      if (shipment.invoiceId?._id) {
        invoiceId = shipment.invoiceId._id;
      } else if (typeof shipment.invoiceId === "string") {
        invoiceId = shipment.invoiceId;
      }

      if (!invoiceId) {
        alert("Invoice not generated");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invoice download failed");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Invoice download failed");
    }
  };

  // Statistics Calculations
  const totalShipments = shipments.length;
  const delivered = shipments.filter(s => s.status === "DELIVERED").length;
  const inTransit = shipments.filter(s => 
    s.status === "IN_TRANSIT" || 
    s.status === "OUT_FOR_DELIVERY"
  ).length;
  const pending = shipments.filter(s => 
    s.status === "PENDING" || 
    s.status === "PROCESSING" || 
    s.status === "PACKED" || 
    s.status === "READY_FOR_PICKUP"
  ).length;
  const ndr = shipments.filter(s => s.status === "NDR").length;
  const rto = shipments.filter(s => s.status === "RTO").length;

  // Filter with status
  const filtered = shipments.filter((s) => {
    const matchesSearch =
      s.awb?.toLowerCase().includes(search.toLowerCase()) ||
      (s.orderId?.customerName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const s = {
    container: { 
      display: "flex", 
      flexDirection: "column",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif" 
    },
    sidebarWrapper: { width: "100%", flexShrink: 0 },
    main: { flex: 1, padding: "20px", overflowX: "hidden" },
    card: { 
      background: "#ffffff", 
      padding: "24px", 
      borderRadius: "16px", 
      border: "1px solid #e2e8f0", 
      marginBottom: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      transition: "box-shadow 0.3s ease"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "12px",
      marginBottom: "24px"
    },
    statCard: (color) => ({
      background: "#ffffff",
      padding: "16px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      transition: "all 0.2s ease"
    }),
    statIcon: (color) => ({
      fontSize: "20px",
      color: color,
      marginBottom: "6px"
    }),
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0f172a"
    },
    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.3px"
    },
    tableHead: { 
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0"
    },
    td: { 
      padding: "18px 16px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
      background: "#ffffff"
    },
    btn: (bg) => ({ 
      background: bg, 
      color: "#fff", 
      border: "none", 
      padding: "8px 14px", 
      borderRadius: "10px", 
      cursor: "pointer", 
      marginRight: "5px", 
      fontSize: "12px", 
      fontWeight: "600",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }),
    pageTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.5px"
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "#64748b",
      marginBottom: "24px"
    },
    statsIconWrapper: {
      width: "52px",
      height: "52px",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "24px"
    },
    searchWrapper: {
      background: "#ffffff",
      padding: "8px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      transition: "all 0.2s ease",
      flexWrap: "wrap"
    },
    searchInput: {
      border: "none",
      outline: "none",
      flex: 1,
      fontSize: "14px",
      padding: "12px 0",
      background: "transparent",
      minWidth: "200px"
    },
    filterSelect: {
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
      fontWeight: "500",
      color: "#334155",
      background: "#ffffff",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.2s ease"
    },
    tableWrapper: {
      overflowX: "auto",
      borderRadius: "16px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1000px"
    },
    th: {
      padding: "16px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "600",
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    statusBadge: (status) => ({
      ...getStatusStyle(status),
      padding: "4px 12px",
      borderRadius: "100px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block"
    }),
    awbText: {
      fontWeight: "700",
      color: "#2563eb",
      fontFamily: "monospace",
      fontSize: "13px"
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    },
    modalContent: {
      background: "#fff",
      width: "500px",
      maxWidth: "90vw",
      maxHeight: "80vh",
      borderRadius: "20px",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px",
      borderBottom: "1px solid #f1f5f9"
    },
    modalTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#0f172a"
    },
    modalCloseBtn: {
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "#94a3b8",
      fontSize: "16px"
    },
    modalBody: {
      padding: "20px 24px",
      maxHeight: "50vh",
      overflowY: "auto"
    },
    timelineItem: {
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9"
    },
    timelineStatus: {
      fontWeight: "600",
      fontSize: "14px",
      color: "#0f172a"
    },
    timelineRemark: {
      fontSize: "13px",
      color: "#64748b",
      margin: "4px 0"
    },
    timelineMeta: {
      fontSize: "11px",
      color: "#94a3b8"
    }
  };

  const desktopStyles = `
    @media (min-width: 768px) {
      .shipments-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .shipments-main {
        padding: 30px !important;
      }
    }

    button:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    button:active {
      transform: translateY(0);
    }

    .search-wrapper:focus-within {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    tr:hover td {
      background: #f8fafc;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    select:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
  `;

  return (
    <>
      <style>{desktopStyles}</style>
      <div className="shipments-container" style={s.container}>
        <div className="sidebar-wrapper" style={s.sidebarWrapper}>
          <Sidebar />
        </div>

        <main className="shipments-main" style={s.main}>
          <h1 style={s.pageTitle}>Shipments Management</h1>
          <p style={s.pageSubtitle}>Manage and track all your shipments</p>

          {/* Statistics Cards */}
          <div style={s.statsGrid}>
            <div className="stat-card" style={s.statCard("#2563eb")}>
              <FaBox style={s.statIcon("#2563eb")} />
              <div style={s.statValue}>{totalShipments}</div>
              <div style={s.statLabel}>Total</div>
            </div>
            <div className="stat-card" style={s.statCard("#d97706")}>
              <FaClock style={s.statIcon("#d97706")} />
              <div style={s.statValue}>{pending}</div>
              <div style={s.statLabel}>Pending</div>
            </div>
            <div className="stat-card" style={s.statCard("#2563eb")}>
              <FaTruck style={s.statIcon("#2563eb")} />
              <div style={s.statValue}>{inTransit}</div>
              <div style={s.statLabel}>In Transit</div>
            </div>
            <div className="stat-card" style={s.statCard("#16a34a")}>
              <FaCheckCircle style={s.statIcon("#16a34a")} />
              <div style={s.statValue}>{delivered}</div>
              <div style={s.statLabel}>Delivered</div>
            </div>
            <div className="stat-card" style={s.statCard("#d97706")}>
              <FaExclamationTriangle style={s.statIcon("#d97706")} />
              <div style={s.statValue}>{ndr}</div>
              <div style={s.statLabel}>NDR</div>
            </div>
            <div className="stat-card" style={s.statCard("#dc2626")}>
              <FaUndo style={s.statIcon("#dc2626")} />
              <div style={s.statValue}>{rto}</div>
              <div style={s.statLabel}>RTO</div>
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className="search-wrapper" style={s.searchWrapper}>
            <FaSearch style={{ color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search by AWB or Customer Name..." 
              style={s.searchInput} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaFilter style={{ color: "#94a3b8", fontSize: "14px" }} />
              <select
                style={s.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="PACKED">Packed</option>
                <option value="READY_FOR_PICKUP">Ready For Pickup</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="NDR">NDR</option>
                <option value="RTO">RTO</option>
              </select>
            </div>
          </div>

          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#fff"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "18px",
                  fontWeight: "700"
                }}
              >
                Shipment Records
                <span style={{ 
                  fontSize: "13px", 
                  fontWeight: "400", 
                  color: "#64748b",
                  marginLeft: "10px"
                }}>
                  ({filtered.length} shipments)
                </span>
              </h3>
            </div>
            
            <div style={s.tableWrapper}>
              {loading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading Shipments...</div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      {[
                        "AWB",
                        "CUSTOMER",
                        "COURIER",
                        "STATUS",
                        "DATE",
                        "DETAILS",
                        "INVOICE",
                        "LABEL",
                        "TIMELINE"
                      ].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((shipment) => (
                        <tr key={shipment._id}>
                          <td style={s.td}>
                            <b style={s.awbText}>{shipment.awb}</b>
                          </td>
                          <td style={s.td}>
                            <span
                              style={{
                                fontWeight: "600",
                                color: "#0f172a",
                                fontSize: "14px"
                              }}
                            >
                              {shipment.orderId?.customerName || "N/A"}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "6px 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                color: "#475569",
                                fontWeight: "500"
                              }}
                            >
                              {shipment.courier}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={s.statusBadge(shipment.status)}>
                              {shipment.status}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: "12px" }}>{new Date(shipment.createdAt).toLocaleDateString('en-GB')}</span>
                          </td>
                          
                          <td style={s.td}>
                            <button
                              onClick={() =>
                                navigate(`/merchant/shipments/${shipment._id}`)
                              }
                              style={s.btn("#1e293b")}
                            >
                              <FaEye size={11} /> Details
                            </button>
                          </td>
                          
                          {/* ✅ Updated Invoice Button with fixed function */}
                          <td style={s.td}>
                            <button
                              onClick={() => downloadInvoice(shipment)}
                              style={s.btn("#059669")}
                            >
                              <FaFileInvoice size={11} />
                              Invoice
                            </button>
                          </td>
                          
                          <td style={s.td}>
                            <button onClick={() => downloadLabel(shipment._id, shipment.awb)} style={s.btn("#2563eb")}>
                              <FaDownload size={11} /> Label
                            </button>
                          </td>
                          <td style={s.td}>
                            <button 
                              onClick={async () => { 
                                try { 
                                  const res = await api.get(`/shipments/${shipment._id}/timeline`); 
                                  setSelectedTimeline(res.data.timeline); 
                                  setShowModal(true); 
                                } catch (err) { 
                                  alert("Timeline not available"); 
                                } 
                              }} 
                              style={s.btn("#f97316")}
                            >
                              <FaEye size={11} /> Timeline
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                          {search || statusFilter !== "ALL" ? "No matching shipments found" : "No Shipments Found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Timeline Modal */}
      {showModal && (
        <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Shipment Timeline</h2>
              <button onClick={() => setShowModal(false)} style={s.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            <div style={s.modalBody}>
              {selectedTimeline?.length > 0 ? selectedTimeline.map((item, index) => (
                <div key={index} style={s.timelineItem}>
                  <div style={s.timelineStatus}>{item.status}</div>
                  <div style={s.timelineRemark}>{item.remark}</div>
                  <div style={s.timelineMeta}>
                    {item.location && `📍 ${item.location}`} 
                    {item.location && item.createdAt && " • "}
                    {item.createdAt && new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              )) : <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>No updates yet</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipments;