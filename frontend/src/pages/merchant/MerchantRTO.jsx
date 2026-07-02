// MerchantRTO.jsx - Updated with NDR Design
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { 
  FaSearch, 
  FaDownload, 
  FaEye, 
  FaBox, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUndo,
  FaFilter,
  FaSync,
  FaCopy,
  FaTruck,
  FaPhone,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaInfoCircle,
  FaLocationArrow
} from 'react-icons/fa';

const MerchantRTO = () => {
  const navigate = useNavigate();
  const [rtoRecords, setRtoRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    initiated: 0,
    transit: 0,
    returned: 0,
    completed: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Fetch RTO Data
  useEffect(() => {
    fetchRTOData();
  }, []);

  const fetchRTOData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rto');
      const data = response.data.rtos || response.data;
      
      console.log('RTO Data:', data);
      
      setRtoRecords(data);
      setFilteredRecords(data);
      
      const uniqueCouriers = [
        'ALL',
        ...new Set(
          data
            .map(record => record.courier)
            .filter(Boolean)
        ),
      ];
      setCouriers(uniqueCouriers);

      const initiated = data.filter(r => 
        (r.status || '').toUpperCase() === 'INITIATED'
      ).length;
      
      const transit = data.filter(r => 
        (r.status || '').toUpperCase() === 'IN_TRANSIT'
      ).length;
      
      const returned = data.filter(r => 
        (r.status || '').toUpperCase() === 'RECEIVED_AT_WAREHOUSE'
      ).length;
      
      const completed = data.filter(r => 
        (r.status || '').toUpperCase() === 'COMPLETED'
      ).length;
      
      setStats({
        total: data.length,
        initiated,
        transit,
        returned,
        completed
      });
    } catch (error) {
      console.error('Error fetching RTO data:', error);
      showToast('Failed to fetch RTO records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: '', type: '', visible: false });
    }, 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRTOData();
  };

  const handleCopyAWB = async (awb) => {
    try {
      await navigator.clipboard.writeText(awb);
      showToast('AWB copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to copy AWB', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'AWB', 
      'Order ID', 
      'Customer', 
      'Phone', 
      'Address', 
      'Pincode', 
      'Courier', 
      'RTO Reason', 
      'Sub Reason',
      'Status',
      'Created Date'
    ];
    
    const csvData = filteredRecords.map(record => [
      record.awb || '',
      record.orderId?.orderNumber || '',
      record.orderId?.customerName || '',
      record.orderId?.customerPhone || '',
      (record.orderId?.address || '').replace(/"/g, '""'),
      record.orderId?.pincode || '',
      record.courier || '',
      record.rtoReason || '',
      record.rtoSubReason || '',
      record.status || '',
      record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rto_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully', 'success');
  };

  useEffect(() => {
    filterRecords();
  }, [search, statusFilter, courierFilter, rtoRecords]);

  const filterRecords = () => {
    let filtered = rtoRecords;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(record =>
        ((record.awb || '').toLowerCase()).includes(searchLower) ||
        ((record.orderId?.orderNumber || '').toLowerCase()).includes(searchLower) ||
        ((record.orderId?.customerName || '').toLowerCase()).includes(searchLower) ||
        ((record.orderId?.customerPhone || '').toLowerCase()).includes(searchLower)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(record => 
        (record.status || '').toUpperCase() === statusFilter
      );
    }

    if (courierFilter !== 'ALL') {
      filtered = filtered.filter(record => 
        (record.courier || '').toLowerCase() === courierFilter.toLowerCase()
      );
    }

    setFilteredRecords(filtered);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setViewModal(true);
  };

  const handleTrack = (awb) => {
    navigate(`/merchant/tracking/${awb}`);
  };

  // ✅ Status Badge matching NDR/Shipments style
  const getStatusStyle = (status) => {
    const normalizedStatus = (status || '').toUpperCase();
    const styles = {
      'INITIATED': { background: "#fef3c7", color: "#92400e" },
      'PICKUP_SCHEDULED': { background: "#dbeafe", color: "#1e40af" },
      'PICKED_UP': { background: "#f3e8ff", color: "#6d28d9" },
      'IN_TRANSIT': { background: "#dbeafe", color: "#1d4ed8" },
      'RECEIVED_AT_WAREHOUSE': { background: "#ede9fe", color: "#6d28d9" },
      'COMPLETED': { background: "#dcfce7", color: "#166534" }
    };
    return styles[normalizedStatus] || { background: "#f1f5f9", color: "#475569" };
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = (status || '').toUpperCase();
    const labels = {
      'INITIATED': 'Initiated',
      'PICKUP_SCHEDULED': 'Pickup Scheduled',
      'PICKED_UP': 'Picked Up',
      'IN_TRANSIT': 'In Transit',
      'RECEIVED_AT_WAREHOUSE': 'Warehouse',
      'COMPLETED': 'Completed'
    };
    return labels[normalizedStatus] || normalizedStatus;
  };

  const getReasonBadge = (reason) => {
    const reasonColors = {
      'Customer Refused': { background: '#fef2f2', color: '#dc2626' },
      'Wrong Address': { background: '#fff7ed', color: '#ea580c' },
      'Damaged Product': { background: '#faf5ff', color: '#7c3aed' },
      'Wrong Product': { background: '#eff6ff', color: '#2563eb' },
      'Delivery Failed': { background: '#fffbeb', color: '#d97706' },
      'Customer Cancelled': { background: '#f5f5f5', color: '#333' },
      'Quality Issue': { background: '#fef2f2', color: '#b91c1c' },
      'Exchange Request': { background: '#f0fdf4', color: '#16a34a' }
    };
    return reasonColors[reason] || { background: '#f5f5f5', color: '#333' };
  };

  const getCourierIcon = (courier) => {
    const icons = {
      'Delhivery': '📦',
      'Blue Dart': '✈️',
      'FedEx': '📬',
      'DTDC': '🚚',
      'XpressBees': '🐝',
      'Amazon Logistics': '📦',
      'Ecom Express': '🚛',
      'Shadowfax': '⚡'
    };
    return icons[courier] || '📦';
  };

  const getTimeline = () => {
    return [
      'INITIATED',
      'PICKUP_SCHEDULED',
      'PICKED_UP',
      'IN_TRANSIT',
      'RECEIVED_AT_WAREHOUSE',
      'COMPLETED'
    ];
  };

  // ✅ Updated Styles matching NDR/Shipments page
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
      minWidth: "1100px"
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
      padding: "5px 14px",
      borderRadius: "100px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      minWidth: "80px",
      textAlign: "center",
      letterSpacing: "0.3px"
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
      width: "650px",
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
      maxHeight: "55vh",
      overflowY: "auto"
    },
    detailRow: {
      display: "flex",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "flex-start"
    },
    detailLabel: {
      width: "140px",
      fontWeight: "500",
      color: "#64748b",
      flexShrink: 0,
      fontSize: "13px"
    },
    detailValue: {
      flex: 1,
      color: "#0f172a",
      fontSize: "14px"
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "16px 0 8px 0",
      paddingBottom: "8px",
      borderBottom: "2px solid #f1f5f9"
    },
    timelineItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px 12px",
      marginBottom: "4px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: "500"
    },
    timelineActive: {
      background: "#f0fdf4",
      color: "#16a34a"
    },
    timelineInactive: {
      background: "#f8fafc",
      color: "#94a3b8"
    }
  };

  const desktopStyles = `
    @media (min-width: 768px) {
      .rto-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .rto-main {
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

    .copy-btn:hover {
      background: #f1f5f9 !important;
    }

    .toast {
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .status-badge {
      white-space: nowrap;
    }
  `;

  // Sort records by creation date (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <style>{desktopStyles}</style>
      <div className="rto-container" style={s.container}>
        <div className="sidebar-wrapper" style={s.sidebarWrapper}>
          <Sidebar />
        </div>

        <main className="rto-main" style={s.main}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={s.pageTitle}>RTO Management</h1>
              <p style={s.pageSubtitle}>Return to Origin tracking and monitoring</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  ...s.btn("#1e293b"),
                  opacity: refreshing ? 0.6 : 1,
                  cursor: refreshing ? 'not-allowed' : 'pointer'
                }}
              >
                <FaSync size={11} /> {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleExportCSV}
                style={s.btn("#059669")}
              >
                <FaDownload size={11} /> Export CSV
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div style={s.statsGrid}>
            <div className="stat-card" style={s.statCard("#f97316")}>
              <FaBox style={s.statIcon("#f97316")} />
              <div style={s.statValue}>{stats.total}</div>
              <div style={s.statLabel}>Total RTO</div>
            </div>
            <div className="stat-card" style={s.statCard("#d97706")}>
              <FaClock style={s.statIcon("#d97706")} />
              <div style={s.statValue}>{stats.initiated}</div>
              <div style={s.statLabel}>Initiated</div>
            </div>
            <div className="stat-card" style={s.statCard("#2563eb")}>
              <FaTruck style={s.statIcon("#2563eb")} />
              <div style={s.statValue}>{stats.transit}</div>
              <div style={s.statLabel}>In Transit</div>
            </div>
            <div className="stat-card" style={s.statCard("#8b5cf6")}>
              <FaUndo style={s.statIcon("#8b5cf6")} />
              <div style={s.statValue}>{stats.returned}</div>
              <div style={s.statLabel}>Returned</div>
            </div>
            <div className="stat-card" style={s.statCard("#16a34a")}>
              <FaCheckCircle style={s.statIcon("#16a34a")} />
              <div style={s.statValue}>{stats.completed}</div>
              <div style={s.statLabel}>Completed</div>
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className="search-wrapper" style={s.searchWrapper}>
            <FaSearch style={{ color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search by AWB, Order ID or Customer Name..." 
              style={s.searchInput} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <FaFilter style={{ color: "#94a3b8", fontSize: "14px" }} />
              <select
                style={s.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="INITIATED">Initiated</option>
                <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="RECEIVED_AT_WAREHOUSE">Warehouse</option>
                <option value="COMPLETED">Completed</option>
              </select>
              
              <select
                style={s.filterSelect}
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
              >
                <option value="ALL">All Couriers</option>
                {couriers.filter(c => c !== 'ALL').map(courier => (
                  <option key={courier} value={courier}>
                    {getCourierIcon(courier)} {courier}
                  </option>
                ))}
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
                RTO Records
                <span style={{ 
                  fontSize: "13px", 
                  fontWeight: "400", 
                  color: "#64748b",
                  marginLeft: "10px"
                }}>
                  ({sortedRecords.length} cases)
                </span>
              </h3>
            </div>
            
            <div style={s.tableWrapper}>
              {loading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
                  <FaSync style={{ fontSize: "24px", marginBottom: "12px", animation: "spin 1s linear infinite" }} />
                  <div>Loading RTO records...</div>
                </div>
              ) : sortedRecords.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔄</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                    No RTO cases found
                  </div>
                  <div style={{ fontSize: "14px" }}>All returns are completed! Try adjusting your filters.</div>
                </div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      {[
                        "AWB",
                        "CUSTOMER",
                        "COURIER",
                        "RTO REASON",
                        "STATUS",
                        "CREATED",
                        "ACTIONS"
                      ].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record) => {
                      const statusStyle = getStatusStyle(record.status);
                      const statusLabel = getStatusLabel(record.status);
                      const reasonBadge = getReasonBadge(record.rtoReason);
                      const courierIcon = getCourierIcon(record.courier);
                      
                      return (
                        <tr key={record._id || record.id}>
                          <td style={s.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={s.awbText}>{record.awb || 'N/A'}</span>
                              <button
                                onClick={() => handleCopyAWB(record.awb)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "4px",
                                  borderRadius: "6px",
                                  color: "#94a3b8",
                                  transition: "all 0.2s ease"
                                }}
                                className="copy-btn"
                                title="Copy AWB"
                              >
                                <FaCopy size={12} />
                              </button>
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                              {record.orderId?.orderNumber || '-'}
                            </div>
                          </td>
                          
                          <td style={s.td}>
                            <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                              {record.orderId?.customerName || 'N/A'}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                              <FaPhone size={10} style={{ marginRight: "4px" }} />
                              {record.orderId?.customerPhone || 'N/A'}
                            </div>
                          </td>
                          
                          <td style={s.td}>
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "6px 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                color: "#475569",
                                fontWeight: "500",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span>{courierIcon}</span>
                              <span>{record.courier || 'N/A'}</span>
                            </span>
                          </td>
                          
                          <td style={s.td}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "500",
                                background: reasonBadge.background,
                                color: reasonBadge.color
                              }}
                            >
                              {record.rtoReason || 'N/A'}
                            </span>
                            {record.rtoSubReason && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                                {record.rtoSubReason}
                              </div>
                            )}
                          </td>
                          
                          <td style={s.td}>
                            <span className="status-badge" style={s.statusBadge(record.status)}>
                              {statusLabel}
                            </span>
                          </td>
                          
                          <td style={s.td}>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: "#0f172a" }}>
                              {record.createdAt ? 
                                new Date(record.createdAt).toLocaleDateString('en-GB') : 
                                'N/A'
                              }
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                              {record.createdAt ? 
                                new Date(record.createdAt).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                ''
                              }
                            </div>
                          </td>
                          
                          <td style={s.td}>
                            <div style={{ display: "flex", gap: "5px", flexWrap: "nowrap" }}>
                              <button
                                onClick={() => handleView(record)}
                                style={s.btn("#1e293b")}
                              >
                                <FaEye size={11} /> View
                              </button>
                              <button
                                onClick={() => handleTrack(record.awb)}
                                style={s.btn("#2563eb")}
                              >
                                <FaLocationArrow size={11} /> Track
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* View Modal */}
      {viewModal && selectedRecord && (
        <div style={s.modalOverlay} onClick={() => {
          setViewModal(false);
          setSelectedRecord(null);
        }}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                <FaInfoCircle style={{ color: "#f97316", marginRight: "8px" }} />
                RTO Details
                <span style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: getStatusStyle(selectedRecord.status).background,
                  color: getStatusStyle(selectedRecord.status).color,
                  marginLeft: "auto"
                }}>
                  {getStatusLabel(selectedRecord.status)}
                </span>
              </h2>
              <button onClick={() => {
                setViewModal(false);
                setSelectedRecord(null);
              }} style={s.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            <div style={s.modalBody}>
              {/* Order & Customer Information */}
              <div style={s.sectionTitle}>
                <FaUser style={{ marginRight: "8px", color: "#f97316" }} />
                Order & Customer Information
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>AWB Number</span>
                <span style={s.detailValue}>
                  <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#2563eb" }}>
                    {selectedRecord.awb || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleCopyAWB(selectedRecord.awb)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      color: "#94a3b8",
                      marginLeft: "8px"
                    }}
                  >
                    <FaCopy size={12} /> Copy
                  </button>
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Order ID</span>
                <span style={s.detailValue}>
                  <strong>{selectedRecord.orderId?.orderNumber || '-'}</strong>
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Customer Name</span>
                <span style={s.detailValue}>
                  <strong>{selectedRecord.orderId?.customerName || 'N/A'}</strong>
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Phone Number</span>
                <span style={s.detailValue}>
                  <FaPhone style={{ marginRight: "6px", color: "#94a3b8" }} />
                  {selectedRecord.orderId?.customerPhone || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Email</span>
                <span style={s.detailValue}>
                  {selectedRecord.orderId?.customerEmail || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Delivery Address</span>
                <span style={s.detailValue}>
                  <FaMapMarkerAlt style={{ marginRight: "6px", color: "#94a3b8" }} />
                  {selectedRecord.orderId?.address || 'N/A'}
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Pincode: {selectedRecord.orderId?.pincode || 'N/A'}
                  </div>
                </span>
              </div>

              {/* RTO Information */}
              <div style={s.sectionTitle}>
                <FaTruck style={{ marginRight: "8px", color: "#f97316" }} />
                RTO Information
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Courier</span>
                <span style={s.detailValue}>
                  {getCourierIcon(selectedRecord.courier)} {selectedRecord.courier || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>RTO Reason</span>
                <span style={s.detailValue}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: getReasonBadge(selectedRecord.rtoReason).background,
                    color: getReasonBadge(selectedRecord.rtoReason).color
                  }}>
                    {selectedRecord.rtoReason || 'N/A'}
                  </span>
                  {selectedRecord.rtoSubReason && (
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                      Sub Reason: {selectedRecord.rtoSubReason}
                    </div>
                  )}
                </span>
              </div>

              {/* Status Information */}
              <div style={s.sectionTitle}>
                <FaClock style={{ marginRight: "8px", color: "#f97316" }} />
                Status Information
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Current Status</span>
                <span style={s.detailValue}>
                  <span style={s.statusBadge(selectedRecord.status)}>
                    {getStatusLabel(selectedRecord.status)}
                  </span>
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Created At</span>
                <span style={s.detailValue}>
                  <FaCalendarAlt style={{ marginRight: "6px", color: "#94a3b8" }} />
                  {selectedRecord.createdAt ? 
                    new Date(selectedRecord.createdAt).toLocaleString('en-GB') : 
                    'N/A'
                  }
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Updated At</span>
                <span style={s.detailValue}>
                  {selectedRecord.updatedAt ? 
                    new Date(selectedRecord.updatedAt).toLocaleString('en-GB') : 
                    'N/A'
                  }
                </span>
              </div>

              {/* Timeline */}
              <div style={s.sectionTitle}>
                <FaClock style={{ marginRight: "8px", color: "#f97316" }} />
                Timeline
              </div>
              
              {getTimeline().map((item) => {
                const currentStatus = (selectedRecord.status || '').toUpperCase();
                const isActive = currentStatus === item;
                const isPast = getTimeline().indexOf(item) < getTimeline().indexOf(currentStatus);
                const isCompleted = currentStatus === 'COMPLETED';
                
                let statusIcon = '⚪';
                if (isActive || (isPast && !isCompleted)) {
                  statusIcon = '🟢';
                } else if (isCompleted && item === 'COMPLETED') {
                  statusIcon = '✅';
                }
                
                return (
                  <div
                    key={item}
                    style={{
                      ...s.timelineItem,
                      ...(isActive || (isPast && !isCompleted) ? s.timelineActive : s.timelineInactive)
                    }}
                  >
                    <span>{statusIcon}</span>
                    <span>{item.replace(/_/g, ' ')}</span>
                    {isActive && <span style={{ marginLeft: "auto", fontSize: "11px", color: "#16a34a" }}>● Current</span>}
                  </div>
                );
              })}

              {/* Remarks */}
              <div style={s.sectionTitle}>
                <FaFileAlt style={{ marginRight: "8px", color: "#f97316" }} />
                Remarks & Notes
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Remarks</span>
                <span style={s.detailValue}>
                  {selectedRecord.remarks || 'No remarks added'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Courier Remarks</span>
                <span style={s.detailValue}>
                  {selectedRecord.courierRemarks || 'No remarks from courier'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "16px 24px",
          borderRadius: "12px",
          color: "#fff",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          maxWidth: "400px",
          fontWeight: "500",
          background: toast.type === 'success' ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #ef4444, #dc2626)",
          animation: "slideIn 0.3s ease"
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default MerchantRTO;