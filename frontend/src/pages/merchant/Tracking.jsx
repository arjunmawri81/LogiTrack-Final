import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaTruck, FaBox, FaCalendarAlt, FaPhoneAlt, FaUser, FaCheckCircle, FaClock, FaMapMarkerAlt } from "react-icons/fa";

const Tracking = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return { background: "#dcfce7", color: "#166534", icon: <FaCheckCircle /> };
      case "IN_TRANSIT":
        return { background: "#dbeafe", color: "#1d4ed8", icon: <FaTruck /> };
      case "READY_FOR_PICKUP":
        return { background: "#fef3c7", color: "#92400e", icon: <FaBox /> };
      case "RTO":
        return { background: "#fee2e2", color: "#991b1b", icon: <FaClock /> };
      default:
        return { background: "#f1f5f9", color: "#64748b", icon: <FaClock /> };
    }
  };

  const handleTrack = async () => {
    if (!awb) { alert("Please enter AWB number"); return; }
    try {
      setLoading(true);
      const res = await api.get(`/shipments/track/${awb}`);
      setShipment(res.data.shipment);
    } catch (error) {
      setShipment(null);
      alert(error?.response?.data?.message || "Shipment Not Found");
    } finally { setLoading(false); }
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case "DELIVERED": return "100%";
      case "IN_TRANSIT": return "70%";
      case "READY_FOR_PICKUP": return "40%";
      default: return "10%";
    }
  };

  const getProgressPercent = (status) => {
    switch (status) {
      case "DELIVERED": return "100%";
      case "IN_TRANSIT": return "70%";
      case "READY_FOR_PICKUP": return "40%";
      default: return "10%";
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    sidebarWrapper: {
      width: "100%",
      flexShrink: 0
    },
    main: {
      flex: 1,
      padding: "24px 20px",
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
      boxSizing: "border-box"
    },
    pageHeader: {
      marginBottom: "28px"
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0",
      letterSpacing: "-0.5px"
    },
    subtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0
    },
    searchCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.3s ease"
    },
    searchHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px"
    },
    searchIcon: {
      width: "40px",
      height: "40px",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "20px"
    },
    searchTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      margin: 0
    },
    inputWrapper: {
      marginBottom: "16px"
    },
    inputLabel: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#475569",
      marginBottom: "8px",
      display: "block"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s ease",
      fontFamily: "inherit"
    },
    button: {
      width: "100%",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      transition: "transform 0.1s ease, box-shadow 0.2s ease",
      boxShadow: "0 2px 4px rgba(249, 115, 22, 0.2)"
    },
    detailsCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
      paddingBottom: "16px",
      borderBottom: "2px solid #f1f5f9"
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    statusBadgeLarge: {
      padding: "6px 14px",
      borderRadius: "100px",
      fontSize: "13px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px",
      marginBottom: "24px"
    },
    infoItem: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },
    infoLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    infoValue: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1e293b",
      margin: 0,
      wordBreak: "break-word"
    },
    infoValueSmall: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#475569",
      margin: 0
    },
    divider: {
      height: "1px",
      background: "linear-gradient(90deg, #e2e8f0 0%, transparent 100%)",
      margin: "20px 0"
    },
    progressSection: {
      marginTop: "8px"
    },
    progressHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px"
    },
    progressLabel: {
      fontSize: "12px",
      fontWeight: "500",
      color: "#64748b"
    },
    progressPercent: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#f97316"
    },
    progressBarWrapper: {
      width: "100%",
      height: "8px",
      background: "#f1f5f9",
      borderRadius: "100px",
      overflow: "hidden"
    },
    progressBar: {
      height: "100%",
      background: "linear-gradient(90deg, #f97316 0%, #fbbf24 100%)",
      borderRadius: "100px",
      transition: "width 0.5s ease"
    },
    timelineCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    timelineItem: {
      display: "flex",
      gap: "16px",
      padding: "16px 0",
      borderBottom: "1px solid #f1f5f9",
      position: "relative"
    },
    timelineIcon: {
      width: "40px",
      height: "40px",
      background: "#f8fafc",
      borderRadius: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#f97316",
      fontSize: "18px",
      flexShrink: 0
    },
    timelineContent: {
      flex: 1
    },
    timelineStatus: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "4px"
    },
    timelineRemark: {
      fontSize: "13px",
      color: "#475569",
      marginBottom: "6px"
    },
    timelineMeta: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap"
    },
    timelineLocation: {
      fontSize: "12px",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    },
    timelineTime: {
      fontSize: "11px",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
      color: "#94a3b8"
    }
  };

  const desktopStyles = `
    @media (min-width: 768px) {
      .tracking-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .tracking-main {
        padding: 32px 40px !important;
        max-width: 900px !important;
      }
      .info-grid {
        gap: 28px !important;
      }
      .timeline-item:last-child {
        border-bottom: none !important;
      }
    }

    @media (min-width: 1024px) {
      .tracking-main {
        max-width: 1000px !important;
      }
      .info-grid {
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }

    input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
    }

    button:active {
      transform: translateY(0);
    }
  `;

  return (
    <>
      <style>{desktopStyles}</style>
      <div className="tracking-container" style={styles.container}>
        <div className="sidebar-wrapper" style={styles.sidebarWrapper}>
          <Sidebar />
        </div>

        <main className="tracking-main" style={styles.main}>
          <div style={styles.pageHeader}>
            <h1 style={styles.title}>Track Shipment</h1>
            <p style={styles.subtitle}>Real-time shipment tracking and updates</p>
          </div>

          {/* Search Card */}
          <div style={styles.searchCard}>
            <div style={styles.searchHeader}>
              <div style={styles.searchIcon}>
                <FaTruck />
              </div>
              <div>
                <h3 style={styles.searchTitle}>Enter AWB Details</h3>
              </div>
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.inputLabel}>Air Waybill Number</label>
              <input 
                type="text" 
                placeholder="e.g. AWB17813389631365888" 
                value={awb} 
                onChange={(e) => setAwb(e.target.value)} 
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = "#f97316"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <button onClick={handleTrack} disabled={loading} style={styles.button}>
              {loading ? "Tracking..." : "Track Shipment"}
            </button>
          </div>

          {/* Shipment Details */}
          {shipment && (
            <div style={styles.detailsCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <FaBox style={{ color: "#f97316" }} />
                  Shipment Details
                </div>
                <div style={{...styles.statusBadgeLarge, ...getStatusStyle(shipment.status)}}>
                  {getStatusStyle(shipment.status).icon}
                  {shipment.status || "PENDING"}
                </div>
              </div>

              {/* Desktop: 4 columns, Mobile: 2 columns */}
              <div className="info-grid" style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <FaTruck size={11} /> AWB NUMBER
                  </div>
                  <p style={styles.infoValue}>{shipment.awb || "N/A"}</p>
                  <p style={styles.infoValueSmall}>{shipment.courier || "Delhivery"}</p>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <FaUser size={11} /> CUSTOMER
                  </div>
                  <p style={styles.infoValue}>{shipment.orderId?.customerName || "Rahul Sharma"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <FaPhoneAlt size={10} style={{ color: "#94a3b8" }} />
                    <p style={styles.infoValueSmall}>{shipment.orderId?.customerPhone || "9876543210"}</p>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <FaCalendarAlt size={11} /> PICKUP DATE
                  </div>
                  <p style={styles.infoValue}>
                    {shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : "Pending"}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>
                    <FaCalendarAlt size={11} /> DELIVERY DATE
                  </div>
                  <p style={styles.infoValue}>
                    {shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : "Not Delivered"}
                  </p>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Progress Bar */}
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Shipment Progress</span>
                  <span style={styles.progressPercent}>{getProgressPercent(shipment.status)} Complete</span>
                </div>
                <div style={styles.progressBarWrapper}>
                  <div style={{...styles.progressBar, width: getProgressWidth(shipment.status)}} />
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          {shipment?.trackingEvents?.length > 0 && (
            <div style={styles.timelineCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <FaClock style={{ color: "#f97316" }} />
                  Tracking Timeline
                </div>
              </div>
              {[...shipment.trackingEvents].reverse().map((event, index) => (
                <div key={index} className="timeline-item" style={styles.timelineItem}>
                  <div style={styles.timelineIcon}>
                    {event.status === "DELIVERED" ? <FaCheckCircle /> : 
                     event.status === "IN_TRANSIT" ? <FaTruck /> : 
                     <FaClock />}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineStatus}>{event.status}</div>
                    <div style={styles.timelineRemark}>{event.remark}</div>
                    <div style={styles.timelineMeta}>
                      <span style={styles.timelineLocation}>
                        <FaMapMarkerAlt size={10} /> {event.location || "Warehouse"}
                      </span>
                      <span style={styles.timelineTime}>
                        <FaClock size={10} /> {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {shipment && shipment?.trackingEvents?.length === 0 && (
            <div style={styles.emptyState}>
              <FaTruck size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
              <p>No tracking events available yet</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Tracking;