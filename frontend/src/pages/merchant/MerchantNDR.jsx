// NDR.jsx - Merchant NDR Page (Updated with Complete View Modal)
import React, { useState, useEffect } from 'react';
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
  FaInfoCircle
} from 'react-icons/fa';

const MerchantNDR = () => {
  const [ndrRecords, setNdrRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reattemptRequested: 0,
    resolved: 0,
    rto: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Fetch NDR Data
  useEffect(() => {
    fetchNDRData();
  }, []);

  const fetchNDRData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ndr');
      const data = response.data.ndrs || response.data;
      
      console.log('NDR Data:', data);
      
      setNdrRecords(data);
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

      const pending = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'pending';
      }).length;
      
      const reattemptRequested = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'reattempt_requested';
      }).length;
      
      const resolved = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'resolved';
      }).length;
      
      const rto = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'rto';
      }).length;
      
      setStats({
        total: data.length,
        pending,
        reattemptRequested,
        resolved,
        rto
      });
    } catch (error) {
      console.error('Error fetching NDR data:', error);
      showToast('Failed to fetch NDR records', 'error');
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
    await fetchNDRData();
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
      'NDR Reason', 
      'Sub Reason', 
      'Attempts', 
      'Last Attempt', 
      'Next Attempt',
      'Status',
      'Current Status',
      'Courier Remarks',
      'Remarks'
    ];
    
    const csvData = filteredRecords.map(record => [
      record.awb || '',
      record.orderId?.orderNumber || '',
      record.customerName || record.orderId?.customerName || '',
      record.customerPhone || record.orderId?.customerPhone || '',
      (record.address || '').replace(/"/g, '""'),
      record.pincode || '',
      record.courier || '',
      record.ndrReason || '',
      record.ndrSubReason || '',
      `${record.deliveryAttempts || 0} of ${record.maxAttempts || 3} Attempts`,
      record.lastAttemptDate ? new Date(record.lastAttemptDate).toLocaleDateString('en-IN') : '',
      record.nextAttemptDate ? new Date(record.nextAttemptDate).toLocaleDateString('en-IN') : '',
      record.status || '',
      getSubStatus(record.status),
      (record.courierRemarks || '').replace(/"/g, '""'),
      (record.remarks || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ndr_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully', 'success');
  };

  useEffect(() => {
    filterRecords();
  }, [search, statusFilter, courierFilter, ndrRecords]);

  const filterRecords = () => {
    let filtered = ndrRecords;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(record =>
        ((record.awb || '').toLowerCase()).includes(searchLower) ||
        ((record.orderId?.orderNumber || '').toLowerCase()).includes(searchLower) ||
        ((record.customerName || record.orderId?.customerName || '').toLowerCase()).includes(searchLower)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(record => 
        ((record.status || '').toLowerCase()) === statusFilter.toLowerCase()
      );
    }

    if (courierFilter !== 'ALL') {
      filtered = filtered.filter(record => 
        ((record.courier || '').toLowerCase()) === courierFilter.toLowerCase()
      );
    }

    setFilteredRecords(filtered);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setViewModal(true);
  };

  const handleAction = (record, type) => {
    setSelectedRecord(record);
    setActionType(type);
    if (type === 'reattempt') {
      setNewAddress(record.address || record.orderId?.customerAddress || '');
      setNewPhone(record.customerPhone || record.orderId?.customerPhone || '');
      setNewPincode(record.pincode || record.orderId?.customerPincode || '');
    }
    setActionModal(true);
  };

  const submitAction = async () => {
    if (!actionNote.trim()) {
      showToast('Please enter remarks before submitting', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const recordId = selectedRecord._id || selectedRecord.id;
      
      if (actionType === 'reattempt') {
        await api.patch(`/ndr/${recordId}/reattempt`, {
          note: actionNote.trim(),
          address: newAddress.trim() || undefined,
          customerPhone: newPhone.trim() || undefined,
          pincode: newPincode.trim() || undefined,
        });
        showToast('Reattempt request submitted successfully', 'success');
      } else if (actionType === 'rto') {
        await api.patch(`/ndr/${recordId}/rto`, {
          note: actionNote.trim()
        });
        showToast('RTO request submitted successfully', 'success');
      }
      
      await fetchNDRData();
      setActionModal(false);
      setActionNote('');
      setNewAddress('');
      setNewPhone('');
      setNewPincode('');
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error performing action:', error);
      showToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Updated Status Badge with consistent sizing
  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const styles = {
      pending: { background: "#fef3c7", color: "#92400e" },
      reattempt_requested: { background: "#f3e8ff", color: "#6d28d9" },
      reattempt: { background: "#dbeafe", color: "#1e40af" },
      rto_requested: { background: "#fef3c7", color: "#92400e" },
      resolved: { background: "#dcfce7", color: "#166534" },
      rto: { background: "#fee2e2", color: "#991b1b" },
      delivered: { background: "#dcfce7", color: "#166534" },
      failed: { background: "#fee2e2", color: "#991b1b" },
      ready_for_reattempt: { background: "#dbeafe", color: "#1e40af" },
      out_for_delivery: { background: "#dbeafe", color: "#1d4ed8" },
    };
    return styles[normalizedStatus] || { background: "#f1f5f9", color: "#475569" };
  };

  const getSubStatus = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const subStatusMap = {
      'pending': 'Awaiting Action',
      'reattempt_requested': 'Waiting for Admin Approval',
      'reattempt': 'Reattempt in Progress',
      'rto_requested': 'Waiting for Admin Approval',
      'resolved': 'Delivery Completed',
      'rto': 'Return to Origin Initiated',
      'delivered': 'Successfully Delivered',
      'failed': 'Delivery Failed',
      'ready_for_reattempt': 'Ready for Reattempt'
    };
    return subStatusMap[normalizedStatus] || normalizedStatus;
  };

  const getReasonBadge = (reason) => {
    const reasonColors = {
      'Customer Not Available': { background: '#fff7ed', color: '#ea580c' },
      'Address Issue': { background: '#fef2f2', color: '#dc2626' },
      'Customer Refused': { background: '#faf5ff', color: '#7c3aed' },
      'Phone Unreachable': { background: '#eff6ff', color: '#2563eb' },
      'Delivery Delayed': { background: '#fffbeb', color: '#d97706' },
      'Wrong Contact Number': { background: '#fef3c7', color: '#92400e' },
      'Address Not Found': { background: '#ffedd5', color: '#9a3412' },
      'Incorrect Address': { background: '#fef2f2', color: '#b91c1c' }
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
    return icons[courier] || '📧';
  };

  // ✅ Updated Styles matching Shipments page exactly
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
    textarea: {
      width: "100%",
      padding: "12px",
      border: "1.5px solid #e2e8f0",
      borderRadius: "10px",
      marginTop: "8px",
      fontSize: "14px",
      fontFamily: "inherit",
      minHeight: "80px",
      resize: "vertical",
      outline: "none",
      transition: "all 0.2s ease"
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "16px 0 8px 0",
      paddingBottom: "8px",
      borderBottom: "2px solid #f1f5f9"
    }
  };

  const desktopStyles = `
    @media (min-width: 768px) {
      .ndr-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .ndr-main {
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

    .action-btn {
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      transform: translateY(-2px);
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
      <div className="ndr-container" style={s.container}>
        <div className="sidebar-wrapper" style={s.sidebarWrapper}>
          <Sidebar />
        </div>

        <main className="ndr-main" style={s.main}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={s.pageTitle}>NDR Management</h1>
              <p style={s.pageSubtitle}>Non-Delivery Report tracking and resolution</p>
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
              <div style={s.statLabel}>Total NDR</div>
            </div>
            <div className="stat-card" style={s.statCard("#d97706")}>
              <FaClock style={s.statIcon("#d97706")} />
              <div style={s.statValue}>{stats.pending}</div>
              <div style={s.statLabel}>Pending</div>
            </div>
            <div className="stat-card" style={s.statCard("#8b5cf6")}>
              <FaUndo style={s.statIcon("#8b5cf6")} />
              <div style={s.statValue}>{stats.reattemptRequested}</div>
              <div style={s.statLabel}>Reattempt Requested</div>
            </div>
            <div className="stat-card" style={s.statCard("#16a34a")}>
              <FaCheckCircle style={s.statIcon("#16a34a")} />
              <div style={s.statValue}>{stats.resolved}</div>
              <div style={s.statLabel}>Resolved</div>
            </div>
            <div className="stat-card" style={s.statCard("#dc2626")}>
              <FaExclamationTriangle style={s.statIcon("#dc2626")} />
              <div style={s.statValue}>{stats.rto}</div>
              <div style={s.statLabel}>Marked RTO</div>
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
                <option value="PENDING">Awaiting Action</option>
                <option value="REATTEMPT_REQUESTED">Reattempt Requested</option>
                <option value="RESOLVED">Resolved</option>
                <option value="RTO">RTO</option>
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
                NDR Records
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
                  <div>Loading NDR records...</div>
                </div>
              ) : sortedRecords.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                    No NDR cases found
                  </div>
                  <div style={{ fontSize: "14px" }}>All deliveries are going smoothly! Try adjusting your filters.</div>
                </div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      {[
                        "AWB",
                        "CUSTOMER",
                        "COURIER",
                        "ATTEMPTS",
                        "CREATED",
                        "STATUS",
                        "ACTIONS"
                      ].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record) => {
                      const statusStyle = getStatusStyle(record.status);
                      const courierIcon = getCourierIcon(record.courier);
                      const subStatus = getSubStatus(record.status);
                      const canTakeAction = (record.status || '').toLowerCase() === 'pending';
                      const isReattemptRequested = (record.status || '').toLowerCase() === 'reattempt_requested';
                      const isRTORequested = (record.status || '').toLowerCase() === 'rto_requested';
                      const isReattempt = (record.status || '').toLowerCase() === 'reattempt';
                      const isResolved = (record.status || '').toLowerCase() === 'resolved';
                      const isRTO = (record.status || '').toLowerCase() === 'rto';
                      
                      const customerName = record.customerName || record.orderId?.customerName || 'N/A';
                      const customerPhone = record.customerPhone || record.orderId?.customerPhone || 'N/A';
                      
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
                              {customerName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                              <FaPhone size={10} style={{ marginRight: "4px" }} />
                              {customerPhone}
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
                            <div style={{ fontWeight: "500", fontSize: "13px", color: "#0f172a" }}>
                              {record.deliveryAttempts || 0} / {record.maxAttempts || 3}
                            </div>
                            {record.nextAttemptDate && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                                📅 {new Date(record.nextAttemptDate).toLocaleDateString('en-GB')}
                              </div>
                            )}
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
                            <span className="status-badge" style={s.statusBadge(record.status)}>
                              {record.status || 'PENDING'}
                            </span>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", textAlign: "center" }}>
                              {subStatus}
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
                              
                              {canTakeAction && (
                                <>
                                  <button
                                    onClick={() => handleAction(record, 'reattempt')}
                                    style={s.btn("#f97316")}
                                    className="action-btn"
                                  >
                                    <FaUndo size={11} /> Reattempt
                                  </button>
                                  <button
                                    onClick={() => handleAction(record, 'rto')}
                                    style={s.btn("#dc2626")}
                                    className="action-btn"
                                  >
                                    <FaTimes size={11} /> RTO
                                  </button>
                                </>
                              )}
                              
                              {(isReattemptRequested || isRTORequested) && (
                                <span style={{ 
                                  fontSize: "11px", 
                                  fontWeight: "500", 
                                  color: "#8b5cf6",
                                  padding: "8px 12px",
                                  background: "#f3e8ff",
                                  borderRadius: "8px",
                                  whiteSpace: "nowrap"
                                }}>
                                  Awaiting Admin
                                </span>
                              )}
                              
                              {isReattempt && (
                                <span style={{ 
                                  fontSize: "11px", 
                                  fontWeight: "500", 
                                  color: "#3b82f6",
                                  padding: "8px 12px",
                                  background: "#dbeafe",
                                  borderRadius: "8px",
                                  whiteSpace: "nowrap"
                                }}>
                                  Reattempting
                                </span>
                              )}
                              
                              {isResolved && (
                                <span style={{ 
                                  fontSize: "11px", 
                                  fontWeight: "600", 
                                  color: "#16a34a",
                                  padding: "8px 12px",
                                  background: "#dcfce7",
                                  borderRadius: "8px",
                                  whiteSpace: "nowrap"
                                }}>
                                  ✓ Delivered
                                </span>
                              )}
                              
                              {isRTO && (
                                <span style={{ 
                                  fontSize: "11px", 
                                  fontWeight: "600", 
                                  color: "#dc2626",
                                  padding: "8px 12px",
                                  background: "#fee2e2",
                                  borderRadius: "8px",
                                  whiteSpace: "nowrap"
                                }}>
                                  ✗ RTO
                                </span>
                              )}
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

      {/* ✅ Updated View Modal with Complete Details */}
      {viewModal && selectedRecord && (
        <div style={s.modalOverlay} onClick={() => {
          setViewModal(false);
          setSelectedRecord(null);
        }}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                <FaInfoCircle style={{ color: "#f97316", marginRight: "8px" }} />
                NDR Details
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
                  {selectedRecord.status || 'PENDING'}
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
                  <strong>{selectedRecord.customerName || selectedRecord.orderId?.customerName || 'N/A'}</strong>
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Phone Number</span>
                <span style={s.detailValue}>
                  <FaPhone style={{ marginRight: "6px", color: "#94a3b8" }} />
                  {selectedRecord.customerPhone || selectedRecord.orderId?.customerPhone || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Email</span>
                <span style={s.detailValue}>
                  {selectedRecord.orderId?.customerEmail || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Address</span>
                <span style={s.detailValue}>
                  <FaMapMarkerAlt style={{ marginRight: "6px", color: "#94a3b8" }} />
                  {selectedRecord.address || 'N/A'}
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Pincode: {selectedRecord.pincode || 'N/A'}
                  </div>
                </span>
              </div>

              {/* Delivery Information */}
              <div style={s.sectionTitle}>
                <FaTruck style={{ marginRight: "8px", color: "#f97316" }} />
                Delivery Information
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Courier</span>
                <span style={s.detailValue}>
                  {getCourierIcon(selectedRecord.courier)} {selectedRecord.courier || 'N/A'}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>NDR Reason</span>
                <span style={s.detailValue}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: getReasonBadge(selectedRecord.ndrReason).background,
                    color: getReasonBadge(selectedRecord.ndrReason).color
                  }}>
                    {selectedRecord.ndrReason || 'N/A'}
                  </span>
                  {selectedRecord.ndrSubReason && (
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                      Sub Reason: {selectedRecord.ndrSubReason}
                    </div>
                  )}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Delivery Attempts</span>
                <span style={s.detailValue}>
                  <div style={{ fontWeight: "500" }}>
                    {selectedRecord.deliveryAttempts || 0} of {selectedRecord.maxAttempts || 3}
                  </div>
                  {selectedRecord.lastAttemptDate && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      Last Attempt: {new Date(selectedRecord.lastAttemptDate).toLocaleString('en-GB')}
                    </div>
                  )}
                  {selectedRecord.nextAttemptDate && (
                    <div style={{ fontSize: "12px", color: "#f97316", marginTop: "2px" }}>
                      📅 Next Attempt: {new Date(selectedRecord.nextAttemptDate).toLocaleString('en-GB')}
                    </div>
                  )}
                </span>
              </div>
              
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Expected Delivery</span>
                <span style={s.detailValue}>
                  {selectedRecord.expectedDeliveryDate ? 
                    new Date(selectedRecord.expectedDeliveryDate).toLocaleString('en-GB') : 
                    'Pending Courier Update'
                  }
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
                    {selectedRecord.status || 'PENDING'}
                  </span>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    {getSubStatus(selectedRecord.status)}
                  </div>
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

              {/* Attempt History */}
              {selectedRecord.attemptHistory && selectedRecord.attemptHistory.length > 0 && (
                <>
                  <div style={s.sectionTitle}>
                    <FaClock style={{ marginRight: "8px", color: "#f97316" }} />
                    Attempt History
                  </div>
                  {selectedRecord.attemptHistory.map((attempt, index) => (
                    <div key={index} style={{
                      padding: "8px 12px",
                      marginBottom: "6px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#1e293b",
                      border: "1px solid #e2e8f0"
                    }}>
                      <span style={{ color: "#64748b", fontSize: "12px", marginRight: "12px" }}>
                        {attempt.date || 'N/A'}
                      </span>
                      {attempt.status || 'Attempt'}
                      {attempt.remark && (
                        <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "8px" }}>
                          - {attempt.remark}
                        </span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && selectedRecord && (
        <div style={s.modalOverlay} onClick={() => {
          setActionModal(false);
          setActionNote('');
          setNewAddress('');
          setNewPhone('');
          setNewPincode('');
          setSelectedRecord(null);
        }}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {actionType === 'reattempt' ? '🔄 Request Reattempt' : '📦 Mark as RTO'}
              </h2>
              <button onClick={() => {
                setActionModal(false);
                setActionNote('');
                setNewAddress('');
                setNewPhone('');
                setNewPincode('');
                setSelectedRecord(null);
              }} style={s.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>AWB</span>
                <span style={s.detailValue}>
                  <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#2563eb" }}>
                    {selectedRecord.awb || ''}
                  </span>
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Order ID</span>
                <span style={s.detailValue}>{selectedRecord.orderId?.orderNumber || '-'}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Customer</span>
                <span style={s.detailValue}>{selectedRecord.customerName || selectedRecord.orderId?.customerName || ''}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Current Status</span>
                <span style={s.detailValue}>
                  <span style={s.statusBadge(selectedRecord.status)}>
                    {selectedRecord.status || 'PENDING'}
                  </span>
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>NDR Reason</span>
                <span style={s.detailValue}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "500",
                    background: getReasonBadge(selectedRecord.ndrReason).background,
                    color: getReasonBadge(selectedRecord.ndrReason).color
                  }}>
                    {selectedRecord.ndrReason || 'N/A'}
                  </span>
                </span>
              </div>
              
              {actionType === 'reattempt' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontWeight: "500", color: "#0f172a", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                        New Contact Phone
                      </label>
                      <input
                        type="text"
                        style={{ ...s.filterSelect, width: "100%", padding: "8px 12px" }}
                        placeholder="Enter phone number..."
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: "500", color: "#0f172a", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                        New Pincode
                      </label>
                      <input
                        type="text"
                        style={{ ...s.filterSelect, width: "100%", padding: "8px 12px" }}
                        placeholder="Enter pincode..."
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: "500", color: "#0f172a", display: "block", marginBottom: "4px", fontSize: "13px" }}>
                      New Delivery Address
                    </label>
                    <textarea
                      style={{ ...s.textarea, minHeight: "60px", marginTop: 0 }}
                      placeholder="Enter new delivery address..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: "16px" }}>
                <label style={{ fontWeight: "500", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                  Action Note <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  style={s.textarea}
                  placeholder={actionType === 'reattempt' 
                    ? 'Enter reason for reattempt request...' 
                    : 'Enter reason for marking as RTO...'}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                />
              </div>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  onClick={() => {
                    setActionModal(false);
                    setActionNote('');
                    setNewAddress('');
                    setNewPhone('');
                    setNewPincode('');
                    setSelectedRecord(null);
                  }}
                  style={{
                    padding: "10px 24px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#fff",
                    color: "#64748b",
                    transition: "all 0.2s ease"
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  disabled={submitting}
                  style={{
                    ...s.btn(actionType === 'reattempt' ? "#f97316" : "#dc2626"),
                    padding: "10px 24px",
                    fontSize: "14px",
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? '⏳ Submitting...' : (actionType === 'reattempt' ? 'Request Reattempt' : 'Mark RTO')}
                </button>
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

export default MerchantNDR;