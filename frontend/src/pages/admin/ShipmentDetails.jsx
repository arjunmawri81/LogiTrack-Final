import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

// Constants with Orange Theme
const STATUS_STYLES = {
  PENDING: { bg: "#fef3c7", color: "#92400e", icon: "⏳", border: "#f59e0b" },
  READY_FOR_PICKUP: { bg: "#ffedd5", color: "#9a3412", icon: "📦", border: "#ea580c" },
  IN_TRANSIT: { bg: "#fed7aa", color: "#9a3412", icon: "🚚", border: "#ea580c" },
  OUT_FOR_DELIVERY: { bg: "#fdba74", color: "#7c2d12", icon: "🛵", border: "#c2410c" },
  DELIVERED: { bg: "#dcfce7", color: "#166534", icon: "✅", border: "#16a34a" },
  NDR: { bg: "#fee2e2", color: "#991b1b", icon: "⚠️", border: "#dc2626" },
  RTO: { bg: "#fee2e2", color: "#991b1b", icon: "↩️", border: "#dc2626" },
};

const getStatusStyle = (status) => 
  STATUS_STYLES[status] || { bg: "#f1f5f9", color: "#334155", icon: "📋", border: "#94a3b8" };

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/shipments/${id}`);
      setShipment(response.data.shipment);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch shipment details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => 
    date ? new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "N/A";

  const sortedTrackingEvents = shipment?.trackingEvents?.length > 0
    ? [...shipment.trackingEvents].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )
    : [];

  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading shipment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>🔴</div>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={fetchShipment} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={styles.notFoundContainer}>
        <div style={styles.notFoundIcon}>📭</div>
        <p style={styles.notFoundText}>Shipment not found</p>
        <button onClick={() => navigate("/admin/shipments")} style={styles.retryButton}>
          Go Back
        </button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(shipment.status);

  return (
    <div style={styles.container}>
      <AdminSidebar />
      
      <div style={isMobile ? styles.mainContentMobile : styles.mainContent}>
        {/* Header */}
        <div style={isMobile ? styles.headerMobile : styles.header}>
          <div style={isMobile ? styles.headerLeftMobile : styles.headerLeft}>
            <button onClick={() => navigate("/admin/shipments")} style={isMobile ? styles.backButtonMobile : styles.backButton}>
              <span style={{ marginRight: "8px" }}>←</span> Back
            </button>
            <div>
              <h1 style={isMobile ? styles.pageTitleMobile : styles.pageTitle}>Shipment Details</h1>
              <p style={isMobile ? styles.pageSubtitleMobile : styles.pageSubtitle}>Track and manage shipment</p>
            </div>
          </div>
          <div style={isMobile ? styles.headerBadgeMobile : styles.headerBadge}>
            <span style={styles.badgeIcon}>{statusStyle.icon}</span>
            <span style={{ ...styles.badgeText, background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
              {shipment.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Main Grid Layout - Responsive */}
        <div style={isMobile ? styles.gridContainerMobile : styles.gridContainer}>
          {/* Left Column */}
          <div style={isMobile ? styles.leftColumnMobile : styles.leftColumn}>
            {/* AWB Card - Orange Gradient */}
            <div style={styles.awbCard}>
              <div style={styles.awbTopBar}>
                <span style={styles.awbLabel}>AWB Number</span>
                <span style={styles.awbCourier}>{shipment.courier}</span>
              </div>
              <div style={isMobile ? styles.awbValueMobile : styles.awbValue}>{shipment.awb}</div>
              <div style={styles.awbFooter}>
                <span>Order #{shipment.orderId?.orderNumber || 'N/A'}</span>
                <span style={styles.awbDot}>•</span>
                <span>₹{shipment.orderId?.amount || 0}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>👤</span>
                <h3 style={styles.cardTitle}>Customer Information</h3>
              </div>
              <div style={isMobile ? styles.customerGridMobile : styles.customerGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Full Name</div>
                  <div style={styles.infoValue}>{shipment.orderId?.customerName || 'N/A'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Phone</div>
                  <div style={styles.infoValue}>{shipment.orderId?.customerPhone || 'N/A'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={styles.infoLabel}>Delivery Address</div>
                  <div style={styles.infoValue}>{shipment.orderId?.customerAddress || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>📦</span>
                <h3 style={styles.cardTitle}>Order Information</h3>
              </div>
              <div style={isMobile ? styles.orderGridMobile : styles.orderGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Product</div>
                  <div style={styles.infoValue}>{shipment.orderId?.productName || 'N/A'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Amount</div>
                  <div style={{ ...styles.infoValue, fontSize: isMobile ? '18px' : '22px', color: '#ea580c', fontWeight: '700' }}>
                    ₹{shipment.orderId?.amount || 0}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Weight</div>
                  <div style={styles.infoValue}>{shipment.orderId?.weight || 0} KG</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Payment Mode</div>
                  <div style={{ ...styles.infoValue, background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '4px', display: 'inline-block' }}>
                    {shipment.orderId?.paymentMode || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tracking Timeline */}
          <div style={isMobile ? styles.rightColumnMobile : styles.rightColumn}>
            <div style={styles.timelineCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>📍</span>
                <h3 style={styles.cardTitle}>Tracking Timeline</h3>
                <span style={styles.timelineCount}>{sortedTrackingEvents.length} events</span>
              </div>

              <div style={isMobile ? styles.timelineContainerMobile : styles.timelineContainer}>
                {sortedTrackingEvents.length > 0 ? (
                  sortedTrackingEvents.map((event, index) => {
                    const eventStatus = getStatusStyle(event.status);
                    return (
                      <div key={index} style={styles.timelineItem}>
                        <div style={styles.timelineLine}>
                          <div style={{ ...styles.timelineDot, background: eventStatus.border || '#ea580c' }} />
                          {index < sortedTrackingEvents.length - 1 && <div style={styles.timelineConnector} />}
                        </div>
                        <div style={styles.timelineContent}>
                          <div style={isMobile ? styles.timelineHeaderMobile : styles.timelineHeader}>
                            <span style={{ ...styles.timelineStatus, color: eventStatus.color }}>
                              {eventStatus.icon} {event.status.replace(/_/g, ' ')}
                            </span>
                            <span style={isMobile ? styles.timelineDateMobile : styles.timelineDate}>{formatDate(event.timestamp)}</span>
                          </div>
                          {event.location && (
                            <div style={styles.timelineLocation}>📍 {event.location}</div>
                          )}
                          {event.remark && (
                            <div style={styles.timelineRemark}>{event.remark}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <p style={styles.emptyText}>No tracking events yet</p>
                    <p style={styles.emptySubtext}>Tracking updates will appear here as the shipment progresses</p>
                  </div>
                )}
              </div>

              {/* Shipment Meta */}
              <div style={isMobile ? styles.metaFooterMobile : styles.metaFooter}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Created</span>
                  <span style={styles.metaValue}>{formatDate(shipment.createdAt)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Last Updated</span>
                  <span style={styles.metaValue}>{formatDate(shipment.updatedAt)}</span>
                </div>
                {shipment.pickupDate && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Pickup Date</span>
                    <span style={styles.metaValue}>{formatDate(shipment.pickupDate)}</span>
                  </div>
                )}
                {shipment.deliveryDate && (
                  <div style={{ ...styles.metaItem, gridColumn: '1 / -1' }}>
                    <span style={{ ...styles.metaLabel, color: '#16a34a' }}>✅ Delivered On</span>
                    <span style={{ ...styles.metaValue, color: '#16a34a', fontWeight: '600' }}>{formatDate(shipment.deliveryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Responsive Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#ffffff",
  },
  mainContent: {
    flex: 1,
    marginLeft: "280px",
    padding: "30px 40px",
    maxWidth: "calc(100% - 280px)",
  },
  mainContentMobile: {
    flex: 1,
    marginLeft: "0",
    padding: "16px",
    maxWidth: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  headerMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    marginBottom: "20px",
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  headerLeftMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  },
  backButton: {
    padding: "8px 16px",
    border: "2px solid #fed7aa",
    borderRadius: "8px",
    background: "#fff",
    color: "#9a3412",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
  },
  backButtonMobile: {
    padding: "6px 14px",
    border: "2px solid #fed7aa",
    borderRadius: "8px",
    background: "#fff",
    color: "#9a3412",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    width: "fit-content",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  pageTitleMobile: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  pageSubtitleMobile: {
    fontSize: "12px",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 16px 6px 12px",
    background: "#fff",
    borderRadius: "999px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #f1e5de",
  },
  headerBadgeMobile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 12px 4px 8px",
    background: "#fff",
    borderRadius: "999px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #f1e5de",
    alignSelf: "flex-start",
  },
  badgeIcon: {
    fontSize: "20px",
  },
  badgeText: {
    padding: "4px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "2px solid",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },
  gridContainerMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  leftColumnMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  rightColumnMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  // AWB Card - Orange Gradient
  awbCard: {
    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)",
    padding: "28px 32px",
    borderRadius: "16px",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(234, 88, 12, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  awbTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  awbLabel: {
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "rgba(255,255,255,0.7)",
  },
  awbCourier: {
    fontSize: "13px",
    fontWeight: "500",
    background: "rgba(255,255,255,0.15)",
    padding: "4px 14px",
    borderRadius: "999px",
    color: "#fff",
  },
  awbValue: {
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "14px",
    fontFamily: "monospace",
  },
  awbValueMobile: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "12px",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  awbFooter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.85)",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    flexWrap: "wrap",
  },
  awbDot: {
    color: "rgba(255,255,255,0.3)",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid #f1e5de",
    transition: "box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f7f3f0",
  },
  cardIcon: {
    fontSize: "18px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  },
  customerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  customerGridMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  orderGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  orderGridMobile: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#94a3b8",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1e293b",
  },
  timelineCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid #f1e5de",
    height: "fit-content",
  },
  timelineContainer: {
    maxHeight: "460px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  timelineContainerMobile: {
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  timelineItem: {
    display: "flex",
    gap: "14px",
    marginBottom: "18px",
  },
  timelineLine: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "20px",
    flexShrink: 0,
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "3px solid #fee2d6",
    flexShrink: 0,
    marginTop: "4px",
  },
  timelineConnector: {
    width: "2px",
    flex: 1,
    background: "#f1e5de",
    marginTop: "4px",
  },
  timelineContent: {
    flex: 1,
    paddingBottom: "4px",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "4px",
  },
  timelineHeaderMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    marginBottom: "4px",
  },
  timelineStatus: {
    fontWeight: "600",
    fontSize: "14px",
  },
  timelineDate: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  timelineDateMobile: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  timelineLocation: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "2px",
  },
  timelineRemark: {
    fontSize: "13px",
    color: "#475569",
    background: "#faf6f3",
    padding: "4px 12px",
    borderRadius: "6px",
    marginTop: "4px",
    display: "inline-block",
  },
  timelineCount: {
    fontSize: "11px",
    color: "#94a3b8",
    background: "#f7f3f0",
    padding: "2px 10px",
    borderRadius: "999px",
    marginLeft: "auto",
  },
  metaFooter: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "2px solid #f7f3f0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  metaFooterMobile: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "2px solid #f7f3f0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  metaLabel: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#94a3b8",
  },
  metaValue: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e293b",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#64748b",
    margin: 0,
  },
  emptySubtext: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "8px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#ffffff",
  },
  loadingSpinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #fee2d6",
    borderTopColor: "#ea580c",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    color: "#475569",
    fontWeight: "500",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#ffffff",
    padding: "20px",
  },
  errorIcon: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: "16px",
    marginBottom: "20px",
    textAlign: "center",
  },
  retryButton: {
    padding: "10px 24px",
    background: "#ea580c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  notFoundContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#ffffff",
    padding: "20px",
  },
  notFoundIcon: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  notFoundText: {
    fontSize: "18px",
    color: "#475569",
    marginBottom: "20px",
  },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ShipmentDetails;