import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import {
  FaBox,
  FaRupeeSign,
  FaTruck,
  FaWallet,
  FaFileInvoice,
  FaDownload,
  FaSearch,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaWeight,
  FaMapMarkerAlt,
  FaSync,
  FaCalendarAlt,
  FaCheck,
} from "react-icons/fa";
import { MdDateRange } from "react-icons/md";

const Reports = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,

    totalShipments: 0,
    pendingShipments: 0,
    deliveredShipments: 0,
    readyForPickup: 0,
    inTransit: 0,
    outForDelivery: 0,
    cancelledShipments: 0,

    totalNDR: 0,
    totalRTO: 0,

    walletBalance: 0,
    totalRevenue: 0,
    codRevenue: 0,
    pendingCod: 0,
    shippingCharges: 0,

    totalWeight: 0,
    averageWeight: 0,
    chargeableWeight: 0,

    codOrders: 0,
    codDelivered: 0,
    codPending: 0,

    paidInvoices: 0,
    pendingInvoices: 0,
    totalInvoices: 0,

    courierPerformance: [],
    topDestinations: [],
  });

  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const dateFilters = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thismonth", label: "This Month" },
    { value: "custom", label: "Custom Date" },
  ];

  // Orange Theme
  const theme = {
    primary: "#f97316",
    primaryDark: "#ea580c",
    primaryLight: "#fb923c",
    primaryBg: "#fff7ed",
    primaryHover: "#ea580c",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    text: "#0f172a",
    textSecondary: "#475569",
    textLight: "#94a3b8",
    bg: "#f8fafc",
    cardBg: "#ffffff",
    border: "#f97316",
    borderLight: "#fed7aa",
    success: "#166534",
    successBg: "#dcfce7",
    warning: "#92400e",
    warningBg: "#fef3c7",
    danger: "#991b1b",
    dangerBg: "#fee2e2",
    info: "#1d4ed8",
    infoBg: "#dbeafe",
    shadow: "0 1px 3px rgba(249, 115, 22, 0.08)",
    shadowHover: "0 8px 25px rgba(249, 115, 22, 0.15)",
  };

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: theme.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    main: {
      flex: 1,
      marginLeft: "280px",
      padding: "24px 20px",
      width: "calc(100% - 280px)",
      boxSizing: "border-box",
    },

    contentWrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    },

    loadingContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      marginLeft: "280px",
    },

    spinner: {
      width: "48px",
      height: "48px",
      border: `4px solid ${theme.borderLight}`,
      borderTop: `4px solid ${theme.primary}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },

    loadingText: {
      color: theme.textSecondary,
      marginTop: "16px",
      fontSize: "16px",
      fontWeight: "500",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "28px",
      flexWrap: "wrap",
      gap: "16px",
    },

    headerLeft: {
      flex: 1,
    },

    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: theme.text,
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },

    headerSubtitle: {
      color: theme.textSecondary,
      margin: 0,
      fontSize: "14px",
    },

    headerRight: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap",
    },

    lastUpdated: {
      fontSize: "13px",
      color: theme.textLight,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      background: theme.bg,
      borderRadius: "8px",
      border: `1px solid ${theme.borderLight}`,
    },

    btn: {
      padding: "9px 18px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      transition: "all 0.2s ease",
      fontFamily: "inherit",
    },

    btnPrimary: {
      background: theme.gradient,
      color: "#fff",
      boxShadow: "0 2px 4px rgba(249, 115, 22, 0.2)",
    },

    btnSecondary: {
      background: "#fff",
      color: theme.text,
      border: `1.5px solid ${theme.borderLight}`,
    },

    btnOutline: {
      background: "transparent",
      color: theme.textSecondary,
      border: `1.5px solid ${theme.borderLight}`,
    },

    dateFilterContainer: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: "32px",
      background: theme.cardBg,
      padding: "12px 20px",
      borderRadius: "20px",
      border: `2px solid ${theme.border}`,
      boxShadow: theme.shadow,
    },

    dateFilterBtn: {
      padding: "7px 16px",
      border: `1.5px solid ${theme.borderLight}`,
      borderRadius: "100px",
      background: "#fff",
      color: theme.textSecondary,
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      fontFamily: "inherit",
    },

    dateFilterBtnActive: {
      background: theme.gradient,
      color: "#fff",
      borderColor: theme.primary,
      boxShadow: "0 2px 8px rgba(249, 115, 22, 0.25)",
    },

    customDateInput: {
      padding: "7px 12px",
      border: `1.5px solid ${theme.borderLight}`,
      borderRadius: "8px",
      fontSize: "13px",
      background: "#fff",
      outline: "none",
      fontFamily: "inherit",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },

    statsCard: {
      background: theme.cardBg,
      padding: "20px 24px",
      borderRadius: "20px",
      border: `2px solid ${theme.border}`,
      boxShadow: theme.shadow,
      transition: "all 0.3s ease",
      cursor: "default",
    },

    statsIcon: {
      marginBottom: "12px",
      display: "inline-flex",
      padding: "10px",
      borderRadius: "12px",
      background: theme.primaryBg,
      color: theme.primary,
    },

    statsLabel: {
      fontSize: "12px",
      color: theme.textLight,
      textTransform: "uppercase",
      fontWeight: "600",
      letterSpacing: "0.8px",
    },

    statsValue: {
      color: theme.text,
      margin: "6px 0 0",
      fontSize: "28px",
      fontWeight: "700",
      letterSpacing: "-0.5px",
    },

    section: {
      background: theme.cardBg,
      padding: "28px 28px",
      borderRadius: "20px",
      border: `2px solid ${theme.border}`,
      marginBottom: "32px",
      boxShadow: theme.shadow,
    },

    sectionHeaderCentered: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "24px",
    },

    sectionTitleBox: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 28px",
      border: `2px solid ${theme.border}`,
      borderRadius: "100px",
      background: "#fff",
      color: theme.text,
      fontSize: "17px",
      fontWeight: "600",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },

    sectionTitleBoxIcon: {
      color: theme.primary,
      fontSize: "18px",
    },

    sectionBadge: {
      fontSize: "11px",
      fontWeight: "600",
      padding: "3px 12px",
      borderRadius: "100px",
      background: theme.primaryBg,
      color: theme.primary,
      marginLeft: "4px",
    },

    reportGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "14px",
      marginTop: "4px",
    },

    reportCard: {
      border: `2px solid ${theme.borderLight}`,
      borderRadius: "12px",
      padding: "16px 18px",
      background: theme.bg,
      transition: "all 0.3s ease",
    },

    reportTitle: {
      fontSize: "13px",
      fontWeight: "500",
      color: theme.textSecondary,
      marginBottom: "4px",
    },

    reportValue: {
      color: theme.text,
      margin: 0,
      fontSize: "26px",
      fontWeight: "700",
      letterSpacing: "-0.5px",
    },

    tableWrapper: {
      overflowX: "auto",
      marginTop: "8px",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },

    th: {
      textAlign: "left",
      padding: "12px 16px",
      background: theme.primaryBg,
      fontWeight: "600",
      color: theme.textSecondary,
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: `2px solid ${theme.border}`,
    },

    td: {
      padding: "12px 16px",
      borderBottom: `1px solid ${theme.borderLight}`,
      color: theme.text,
    },

    badge: {
      padding: "4px 14px",
      borderRadius: "100px",
      fontSize: "13px",
      fontWeight: "600",
      display: "inline-block",
    },

    badgeSuccess: {
      background: theme.successBg,
      color: theme.success,
    },

    badgeWarning: {
      background: theme.warningBg,
      color: theme.warning,
    },

    badgeDanger: {
      background: theme.dangerBg,
      color: theme.danger,
    },

    badgeInfo: {
      background: theme.infoBg,
      color: theme.info,
    },

    destinationList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },

    destinationItem: {
      padding: "10px 0",
      borderBottom: `1px solid ${theme.borderLight}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    destinationCity: {
      fontWeight: "500",
      color: theme.text,
    },

    destinationCount: {
      color: theme.textLight,
      fontSize: "14px",
      background: theme.bg,
      padding: "2px 12px",
      borderRadius: "100px",
      border: `1px solid ${theme.borderLight}`,
    },

    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "32px",
      marginBottom: "0px",
    },

    emptyState: {
      padding: "32px 20px",
      textAlign: "center",
      color: theme.textLight,
    },

    emptyStateIcon: {
      fontSize: "40px",
      marginBottom: "8px",
      opacity: 0.5,
    },
  };

  useEffect(() => {
    fetchReports();
  }, [dateFilter, customDateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        filter: dateFilter,
        ...(dateFilter === "custom" && {
          startDate: customDateRange.start,
          endDate: customDateRange.end,
        }),
      };

      const { data } = await api.get("/reports/dashboard", { params });

      setStats({
        totalOrders: data.orders?.totalOrders || 0,
        pendingOrders: data.orders?.pendingOrders || 0,
        deliveredOrders: data.orders?.deliveredOrders || 0,

        totalShipments: data.shipments?.totalShipments || 0,
        pendingShipments: data.shipments?.pendingShipments || 0,
        deliveredShipments: data.shipments?.deliveredShipments || 0,
        readyForPickup: data.shipments?.readyForPickup || 0,
        inTransit: data.shipments?.inTransit || 0,
        outForDelivery: data.shipments?.outForDelivery || 0,
        cancelledShipments: data.shipments?.cancelledShipments || 0,

        totalNDR: data.ndr?.totalNDR || 0,
        totalRTO: data.rto?.totalRTO || 0,

        walletBalance: data.wallet?.balance || 0,
        totalRevenue: data.revenue?.totalRevenue || 0,
        codRevenue: data.revenue?.codRevenue || 0,
        pendingCod: data.revenue?.pendingCod || 0,
        shippingCharges: data.revenue?.shippingCharges || 0,

        totalWeight: data.weight?.totalWeight || 0,
        averageWeight: data.weight?.averageWeight || 0,
        chargeableWeight: data.weight?.chargeableWeight || 0,

        codOrders: data.cod?.codOrders || 0,
        codDelivered: data.cod?.codDelivered || 0,
        codPending: data.cod?.codPending || 0,

        paidInvoices: data.invoices?.paid || 0,
        pendingInvoices: data.invoices?.pending || 0,
        totalInvoices: data.invoices?.total || 0,

        courierPerformance: data.courierPerformance || [],
        topDestinations: data.topDestinations || [],
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const handleExport = (format) => {
    const params = new URLSearchParams({
      filter: dateFilter,
      ...(dateFilter === "custom" && {
        startDate: customDateRange.start,
        endDate: customDateRange.end,
      }),
    });
    window.open(`/api/reports/export/${format}?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchReports();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingText}>Loading Reports...</h2>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Orders", value: stats.totalOrders, icon: FaBox },
    { title: "Shipments", value: stats.totalShipments, icon: FaTruck },
    { title: "Delivered", value: stats.deliveredShipments, icon: FaCheck },
    { title: "Revenue", value: `₹${stats.totalRevenue}`, icon: FaRupeeSign },
    { title: "Wallet", value: `₹${stats.walletBalance}`, icon: FaWallet },
    { title: "COD", value: `₹${stats.codRevenue}`, icon: FaRupeeSign },
  ];

  const shipmentStatuses = [
    { label: "Pending", value: stats.pendingShipments },
    { label: "Ready For Pickup", value: stats.readyForPickup },
    { label: "In Transit", value: stats.inTransit },
    { label: "Out For Delivery", value: stats.outForDelivery },
    { label: "Delivered", value: stats.deliveredShipments },
    { label: "Cancelled", value: stats.cancelledShipments },
    { label: "NDR Cases", value: stats.totalNDR },
    { label: "RTO Cases", value: stats.totalRTO },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h1 style={styles.headerTitle}>📊 Reports & Analytics</h1>
              <p style={styles.headerSubtitle}>
                Monitor orders, shipments, revenue and business performance
              </p>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.lastUpdated}>
                <FaCalendarAlt size={13} />
                Updated: {lastUpdated.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button style={{...styles.btn, ...styles.btnOutline}} onClick={handleRefresh}>
                <FaSync /> Refresh
              </button>
              <button style={{...styles.btn, ...styles.btnSecondary}} onClick={() => handleExport("csv")}>
                <FaDownload /> CSV
              </button>
              <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => handleExport("pdf")}>
                <FaDownload /> PDF
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div style={styles.dateFilterContainer}>
            <MdDateRange size={18} color={theme.primary} />
            {dateFilters.map((filter) => (
              <button
                key={filter.value}
                style={{
                  ...styles.dateFilterBtn,
                  ...(dateFilter === filter.value && styles.dateFilterBtnActive),
                }}
                onClick={() => {
                  setDateFilter(filter.value);
                  setShowCustomDate(filter.value === "custom");
                }}
              >
                {filter.label}
              </button>
            ))}

            {showCustomDate && (
              <>
                <input
                  type="date"
                  style={styles.customDateInput}
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, start: e.target.value })
                  }
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.borderLight}
                />
                <span style={{ color: theme.textLight }}>to</span>
                <input
                  type="date"
                  style={styles.customDateInput}
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, end: e.target.value })
                  }
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.borderLight}
                />
              </>
            )}
          </div>

          {/* KPI Cards */}
          <div style={styles.statsGrid}>
            {kpis.map((item, index) => (
              <div 
                key={index} 
                style={styles.statsCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = styles.shadowHover;
                  e.currentTarget.style.borderColor = theme.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = theme.shadow;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                <div style={styles.statsIcon}>
                  <item.icon size={20} />
                </div>
                <div style={styles.statsLabel}>{item.title}</div>
                <h2 style={styles.statsValue}>{item.value}</h2>
              </div>
            ))}
          </div>

          {/* Shipment Performance */}
          <div style={styles.section}>
            <div style={styles.sectionHeaderCentered}>
              <span style={styles.sectionTitleBox}>
                <FaTruck style={styles.sectionTitleBoxIcon} />
                Shipment Performance
                <span style={styles.sectionBadge}>Live</span>
              </span>
            </div>

            <div style={styles.reportGrid}>
              {shipmentStatuses.map((status, idx) => (
                <div 
                  key={idx} 
                  style={styles.reportCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(249, 115, 22, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.bg;
                    e.currentTarget.style.borderColor = theme.borderLight;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.reportTitle}>{status.label}</div>
                  <h2 style={styles.reportValue}>{status.value}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Performance */}
          <div style={styles.section}>
            <div style={styles.sectionHeaderCentered}>
              <span style={styles.sectionTitleBox}>
                <FaCheckCircle style={styles.sectionTitleBoxIcon} />
                Courier Performance
              </span>
            </div>

            {stats.courierPerformance.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Courier</th>
                      <th style={styles.th}>Shipments</th>
                      <th style={styles.th}>Delivered</th>
                      <th style={styles.th}>NDR</th>
                      <th style={styles.th}>RTO</th>
                      <th style={styles.th}>Success %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.courierPerformance.map((courier, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>
                          <strong style={{color: theme.primary}}>{courier.name}</strong>
                        </td>
                        <td style={styles.td}>{courier.shipments}</td>
                        <td style={styles.td}>{courier.delivered}</td>
                        <td style={styles.td}>{courier.ndr}</td>
                        <td style={styles.td}>{courier.rto}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(courier.successRate >= 90 ? styles.badgeSuccess :
                                courier.successRate >= 70 ? styles.badgeWarning :
                                styles.badgeDanger),
                          }}>
                            {courier.successRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📊</div>
                <p>No courier performance data available</p>
              </div>
            )}
          </div>

          {/* Financial & Invoice */}
          <div style={styles.twoCol}>
            <div style={styles.section}>
              <div style={styles.sectionHeaderCentered}>
                <span style={styles.sectionTitleBox}>
                  <FaWallet style={styles.sectionTitleBoxIcon} />
                  Financial Summary
                </span>
              </div>
              <div style={styles.reportGrid}>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>Wallet Balance</div>
                  <h2 style={styles.reportValue}>₹{stats.walletBalance}</h2>
                </div>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>Total Billing</div>
                  <h2 style={styles.reportValue}>₹{stats.totalRevenue}</h2>
                </div>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>Shipping Charges</div>
                  <h2 style={styles.reportValue}>₹{stats.shippingCharges}</h2>
                </div>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>COD Revenue</div>
                  <h2 style={styles.reportValue}>₹{stats.codRevenue}</h2>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeaderCentered}>
                <span style={styles.sectionTitleBox}>
                  <FaFileInvoice style={styles.sectionTitleBoxIcon} />
                  Invoice Summary
                </span>
              </div>
              <div style={styles.reportGrid}>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>Total Invoices</div>
                  <h2 style={styles.reportValue}>{stats.totalInvoices}</h2>
                </div>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>
                    <FaCheckCircle size={12} color={theme.success} /> Paid
                  </div>
                  <h2 style={styles.reportValue}>{stats.paidInvoices}</h2>
                </div>
                <div style={styles.reportCard}>
                  <div style={styles.reportTitle}>
                    <FaClock size={12} color={theme.warning} /> Pending
                  </div>
                  <h2 style={styles.reportValue}>{stats.pendingInvoices}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* COD Summary */}
          <div style={styles.section}>
            <div style={styles.sectionHeaderCentered}>
              <span style={styles.sectionTitleBox}>
                <FaRupeeSign style={styles.sectionTitleBoxIcon} />
                COD Summary
              </span>
            </div>
            <div style={styles.reportGrid}>
              <div style={styles.reportCard}>
                <div style={styles.reportTitle}>COD Orders</div>
                <h2 style={styles.reportValue}>{stats.codOrders}</h2>
              </div>
              <div style={styles.reportCard}>
                <div style={styles.reportTitle}>COD Delivered</div>
                <h2 style={styles.reportValue}>{stats.codDelivered}</h2>
              </div>
              <div style={styles.reportCard}>
                <div style={styles.reportTitle}>COD Pending</div>
                <h2 style={styles.reportValue}>{stats.codPending}</h2>
              </div>
              <div style={styles.reportCard}>
                <div style={styles.reportTitle}>COD Revenue</div>
                <h2 style={styles.reportValue}>₹{stats.codRevenue}</h2>
              </div>
            </div>
          </div>

          {/* Top Destinations */}
          <div style={styles.section}>
            <div style={styles.sectionHeaderCentered}>
              <span style={styles.sectionTitleBox}>
                <FaMapMarkerAlt style={styles.sectionTitleBoxIcon} />
                Top Destinations
              </span>
            </div>
            {stats.topDestinations.length > 0 ? (
              <ul style={styles.destinationList}>
                {stats.topDestinations.map((dest, idx) => (
                  <li key={idx} style={styles.destinationItem}>
                    <span style={styles.destinationCity}>
                      <span style={{marginRight: "8px"}}>📍</span>
                      {dest.city}
                    </span>
                    <span style={styles.destinationCount}>{dest.count} shipments</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📍</div>
                <p>No destination data available</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media print {
            .sidebar {
              display: none !important;
            }
            main {
              margin-left: 0 !important;
              padding: 20px !important;
            }
          }

          @media (max-width: 1024px) {
            .two-col {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            .header-right {
              flex-direction: column;
              align-items: stretch;
            }
            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
            }
            .date-filter-container {
              flex-direction: column;
              align-items: stretch;
            }
          }

          input:focus {
            border-color: #f97316 !important;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
          }

          button:hover {
            transform: translateY(-1px);
          }

          button:active {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default Reports;