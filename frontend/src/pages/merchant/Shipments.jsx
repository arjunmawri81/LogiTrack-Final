import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaTruck, FaSearch, FaDownload, FaTimes, FaBox, FaEye, FaQrcode } from "react-icons/fa";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState([]);
  
  // New States for QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shipments");
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

  const handleOpenQR = async (shipmentId) => {
    try {
      const res = await api.get(`/shipments/${shipmentId}/qr`);
      // Updated Logic
      if (res.data?.qrCode) {
        setQrImage(res.data.qrCode);
        setShowQRModal(true);
      } else {
        alert("QR Code not found");
      }
    } catch (err) {
      alert("Failed to fetch QR Code");
    }
  };

  const filtered = shipments.filter(
    (s) =>
      s.awb?.toLowerCase().includes(search.toLowerCase()) ||
      (s.orderId?.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

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
      borderRadius: "20px", 
      border: "1px solid #e2e8f0", 
      marginBottom: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.3s ease"
    },
    tableHead: { 
      background: "#f8fafc", 
      color: "#475569", 
      fontSize: "12px", 
      textTransform: "uppercase",
      fontWeight: "600",
      borderBottom: "2px solid #e2e8f0"
    },
    td: { 
      padding: "16px", 
      borderBottom: "1px solid #f1f5f9", 
      fontSize: "13px", 
      color: "#334155" 
    },
    btn: (bg) => ({ 
      background: bg, 
      color: "#fff", 
      border: "none", 
      padding: "6px 12px", 
      borderRadius: "8px", 
      cursor: "pointer", 
      marginRight: "5px", 
      fontSize: "12px", 
      fontWeight: "500",
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
      transition: "all 0.2s ease"
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      fontSize: "14px",
      padding: "12px 0",
      background: "transparent"
    },
    tableWrapper: {
      overflowX: "auto",
      borderRadius: "20px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "900px"
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
      color: "#0f172a",
      fontFamily: "monospace",
      fontSize: "12px"
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
    },
    qrModalContent: {
      background: "#fff",
      padding: "25px",
      borderRadius: "20px",
      textAlign: "center",
      maxWidth: "90vw"
    },
    qrImage: {
      width: "250px",
      height: "250px",
      marginTop: "15px",
      borderRadius: "12px"
    },
    qrCloseBtn: {
      marginTop: "15px",
      padding: "10px 20px",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "500"
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

          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={s.statsIconWrapper}>
                <FaTruck />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>TOTAL SHIPMENTS</h4>
                <h2 style={{ margin: "4px 0 0 0", fontSize: "32px", fontWeight: "700", color: "#0f172a" }}>{shipments.length}</h2>
              </div>
            </div>
          </div>

          <div className="search-wrapper" style={s.searchWrapper}>
            <FaSearch style={{ color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search by AWB or Customer Name..." 
              style={s.searchInput} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <div style={s.tableWrapper}>
              {loading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading Shipments...</div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      {["AWB", "CUSTOMER", "COURIER", "STATUS", "DATE", "QR", "LABEL", "TIMELINE"].map((h) => (
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
                            <span style={{ fontWeight: "500", color: "#1e293b" }}>{shipment.orderId?.customerName || "N/A"}</span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>{shipment.courier}</span>
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
                            <button onClick={() => handleOpenQR(shipment._id)} style={s.btn("#16a34a")}>
                              <FaQrcode size={11} /> QR
                            </button>
                          </td>
                          <td style={s.td}>
                            <button onClick={() => downloadLabel(shipment._id, shipment.awb)} style={s.btn("#2563eb")}>
                              <FaDownload size={11} /> 
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
                              <FaEye size={11} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>No Shipments Found</td>
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

      {/* QR Modal */}
      {showQRModal && (
        <div style={s.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div style={s.qrModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Shipment QR Code</h3>
            <img src={qrImage} alt="Shipment QR" style={s.qrImage} />
            <br />
            <button onClick={() => setShowQRModal(false)} style={s.qrCloseBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipments;