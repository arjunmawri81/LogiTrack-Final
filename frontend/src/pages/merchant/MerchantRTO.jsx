// MerchantRTO.jsx - Final Production Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

const MerchantRTO = () => {
  const navigate = useNavigate();
  const [rtoRecords, setRtoRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAWB, setSearchAWB] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('all');
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
      setRtoRecords(data);
      setFilteredRecords(data);
      
      const uniqueCouriers = [
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
  }, [searchAWB, statusFilter, courierFilter, rtoRecords]);

  const filterRecords = () => {
    let filtered = rtoRecords;

    if (searchAWB) {
      const searchTerm = searchAWB.toLowerCase();
      filtered = filtered.filter(record =>
        (record.awb || '').toLowerCase().includes(searchTerm) ||
        (record.orderId?.orderNumber || '').toLowerCase().includes(searchTerm) ||
        (record.orderId?.customerName || '').toLowerCase().includes(searchTerm) ||
        (record.orderId?.customerPhone || '').toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(record => 
        (record.status || '').toUpperCase() === statusFilter
      );
    }

    if (courierFilter !== 'all') {
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

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toUpperCase();
    const badges = {
      'INITIATED': { 
        icon: '🟡', 
        label: 'Initiated',
        color: '#f97316',
        bg: '#fff7ed'
      },
      'PICKUP_SCHEDULED': { 
        icon: '🔵', 
        label: 'Pickup Scheduled',
        color: '#3b82f6',
        bg: '#eff6ff'
      },
      'PICKED_UP': { 
        icon: '📦', 
        label: 'Picked Up',
        color: '#8b5cf6',
        bg: '#f5f3ff'
      },
      'IN_TRANSIT': { 
        icon: '🚚', 
        label: 'In Transit',
        color: '#3b82f6',
        bg: '#eff6ff'
      },
      'RECEIVED_AT_WAREHOUSE': { 
        icon: '🏠', 
        label: 'Warehouse',
        color: '#8b5cf6',
        bg: '#f5f3ff'
      },
      'COMPLETED': { 
        icon: '✅', 
        label: 'Completed',
        color: '#22c55e',
        bg: '#f0fdf4'
      }
    };
    return badges[normalizedStatus] || badges.INITIATED;
  };

  const getReasonBadge = (reason) => {
    const reasonColors = {
      'Customer Refused': { bg: '#fef2f2', color: '#dc2626' },
      'Wrong Address': { bg: '#fff7ed', color: '#ea580c' },
      'Damaged Product': { bg: '#faf5ff', color: '#7c3aed' },
      'Wrong Product': { bg: '#eff6ff', color: '#2563eb' },
      'Delivery Failed': { bg: '#fffbeb', color: '#d97706' },
      'Customer Cancelled': { bg: '#f5f5f5', color: '#333' },
      'Quality Issue': { bg: '#fef2f2', color: '#b91c1c' },
      'Exchange Request': { bg: '#f0fdf4', color: '#16a34a' }
    };
    return reasonColors[reason] || { bg: '#f5f5f5', color: '#333' };
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

  // ====================== STYLES ======================
  const styles = {
    mainContainer: {
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    content: {
      flex: 1,
      marginLeft: '280px',
      padding: '30px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      padding: '28px 32px',
      borderRadius: '24px',
      marginBottom: '24px',
      boxShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.1), 0 10px 10px -5px rgba(249, 115, 22, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    headerIcon: {
      width: '56px',
      height: '56px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      color: '#fff'
    },
    headerText: {
      color: '#fff'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 4px 0',
      letterSpacing: '-0.5px',
      color: '#fff'
    },
    subtitle: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.85)',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      gap: '10px'
    },
    refreshButton: {
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      color: '#fff',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    exportButton: {
      padding: '10px 20px',
      background: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      color: '#ea580c',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: '#ffffff',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    },
    statLabel: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '6px',
      fontWeight: '500'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0'
    },
    statSub: {
      fontSize: '12px',
      color: '#94a3b8',
      marginTop: '4px'
    },
    filtersContainer: {
      background: '#ffffff',
      padding: '16px 20px',
      borderRadius: '14px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      marginBottom: '24px',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterLabel: {
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '500'
    },
    searchInput: {
      padding: '10px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      minWidth: '220px',
      outline: 'none',
      transition: 'all 0.2s ease',
      background: '#fff',
      color: '#1e293b'
    },
    filterSelect: {
      padding: '10px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: '#fff',
      outline: 'none',
      minWidth: '140px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#1e293b'
    },
    tableContainer: {
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      minWidth: '900px'
    },
    th: {
      background: '#f8fafc',
      padding: '14px 16px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#475569',
      borderBottom: '2px solid #e2e8f0',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap'
    },
    tr: {
      transition: 'all 0.2s ease'
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'middle',
      color: '#1e293b'
    },
    awbContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    awbText: {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a',
      letterSpacing: '0.3px'
    },
    orderIdText: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    customerContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    customerName: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#0f172a'
    },
    customerPhone: {
      fontSize: '12px',
      color: '#94a3b8'
    },
    courierTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      backgroundColor: '#f1f5f9',
      borderRadius: '20px',
      fontSize: '13px',
      color: '#1e293b'
    },
    courierIcon: {
      fontSize: '14px'
    },
    reasonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    reasonBadge: {
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      maxWidth: '120px'
    },
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    createdContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px'
    },
    createdDate: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#0f172a'
    },
    createdTime: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    actionContainer: {
      display: 'flex',
      gap: '4px',
      flexWrap: 'nowrap',
      alignItems: 'center'
    },
    viewButton: {
      padding: '5px 10px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: '#fff',
      color: '#64748b',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    trackButton: {
      padding: '5px 10px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
      whiteSpace: 'nowrap',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '32px',
      borderRadius: '24px',
      maxWidth: '650px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      border: '1px solid rgba(226, 232, 240, 0.8)'
    },
    modalTitle: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '16px'
    },
    detailRow: {
      display: 'flex',
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    detailLabel: {
      width: '140px',
      fontWeight: '500',
      color: '#64748b',
      flexShrink: 0
    },
    detailValue: {
      flex: 1,
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    timelineContainer: {
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    timelineItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      marginBottom: '4px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500'
    },
    timelineActive: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a'
    },
    timelineInactive: {
      backgroundColor: '#f8fafc',
      color: '#94a3b8'
    },
    resultCount: {
      fontSize: '13px',
      color: '#64748b',
      marginTop: '8px',
      marginBottom: '12px',
      fontWeight: '500'
    },
    closeButton: {
      padding: '10px 24px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#fff',
      color: '#64748b',
      transition: 'all 0.2s ease'
    },
    toast: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '12px',
      color: '#fff',
      zIndex: 9999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px',
      fontWeight: '500'
    },
    toastSuccess: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)'
    },
    toastError: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    awbCopyButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '4px 8px',
      borderRadius: '6px',
      color: '#64748b',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    emptyTitle: {
      margin: '0',
      color: '#0f172a',
      fontSize: '20px',
      fontWeight: '600'
    },
    emptySub: {
      margin: '8px 0 16px',
      color: '#64748b',
      fontSize: '14px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '16px',
      color: '#94a3b8'
    }
  };

  if (loading) {
    return (
      <div style={styles.mainContainer}>
        <Sidebar />
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            <div>Loading RTO records...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <Sidebar />
      
      <div style={styles.content}>
        {/* Toast Notification */}
        {toast.visible && (
          <div style={{
            ...styles.toast,
            ...(toast.type === 'success' ? styles.toastSuccess : styles.toastError)
          }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>🔄</div>
            <div style={styles.headerText}>
              <h1 style={styles.title}>RTO Management</h1>
              <p style={styles.subtitle}>Return to Origin tracking and monitoring</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button 
              style={{
                ...styles.refreshButton,
                opacity: refreshing ? 0.6 : 1,
                cursor: refreshing ? 'not-allowed' : 'pointer'
              }}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '⏳' : '🔄'} Refresh
            </button>
            <button 
              style={styles.exportButton}
              onClick={handleExportCSV}
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total RTO</div>
            <div style={{ ...styles.statValue, color: '#f97316' }}>{stats.total}</div>
            <div style={styles.statSub}>All return cases</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Initiated</div>
            <div style={{ ...styles.statValue, color: '#f97316' }}>{stats.initiated}</div>
            <div style={styles.statSub}>Return initiated</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>In Transit</div>
            <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.transit}</div>
            <div style={styles.statSub}>Return in progress</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Returned</div>
            <div style={{ ...styles.statValue, color: '#8b5cf6' }}>{stats.returned}</div>
            <div style={styles.statSub}>Warehouse received</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed</div>
            <div style={{ ...styles.statValue, color: '#22c55e' }}>{stats.completed}</div>
            <div style={styles.statSub}>Return completed</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>🔍</span>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search AWB / Order ID / Customer..."
              value={searchAWB}
              onChange={(e) => setSearchAWB(e.target.value)}
            />
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Status:</span>
            <select
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="INITIATED">🟡 Initiated</option>
              <option value="PICKUP_SCHEDULED">🔵 Pickup Scheduled</option>
              <option value="PICKED_UP">📦 Picked Up</option>
              <option value="IN_TRANSIT">🚚 In Transit</option>
              <option value="RECEIVED_AT_WAREHOUSE">🏠 Warehouse</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Courier:</span>
            <select
              style={styles.filterSelect}
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
            >
              <option value="all">All Couriers</option>
              {couriers.map(courier => (
                <option key={courier} value={courier}>
                  {getCourierIcon(courier)} {courier}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Count */}
        <div style={styles.resultCount}>
          Showing {filteredRecords.length} of {rtoRecords.length} RTO Cases
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {filteredRecords.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔄</div>
              <h3 style={styles.emptyTitle}>No RTO cases found</h3>
              <p style={styles.emptySub}>All returns are completed! Try adjusting your filters.</p>
              <button 
                style={{
                  ...styles.refreshButton,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                }}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>AWB</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Courier</th>
                  <th style={styles.th}>RTO Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const statusBadge = getStatusBadge(record.status);
                  const reasonBadge = getReasonBadge(record.rtoReason);
                  const courierIcon = getCourierIcon(record.courier);
                  
                  return (
                    <tr key={record._id || record.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.awbContainer}>
                          <span style={styles.awbText}>{record.awb || ''}</span>
                          <span style={styles.orderIdText}>
                            {record.orderId?.orderNumber || '-'}
                          </span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.customerContainer}>
                          <span style={styles.customerName}>
                            {record.orderId?.customerName || 'N/A'}
                          </span>
                          <span style={styles.customerPhone}>
                            📞 {record.orderId?.customerPhone || 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <span style={styles.courierTag}>
                          <span style={styles.courierIcon}>{courierIcon}</span>
                          <span>{record.courier || 'N/A'}</span>
                        </span>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.reasonContainer}>
                          <span style={{
                            ...styles.reasonBadge,
                            backgroundColor: reasonBadge.bg,
                            color: reasonBadge.color
                          }}>
                            {record.rtoReason || 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.statusContainer}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color
                          }}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.createdContainer}>
                          <span style={styles.createdDate}>
                            {record.createdAt ? 
                              new Date(record.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }) : 
                              'N/A'
                            }
                          </span>
                          <span style={styles.createdTime}>
                            {record.createdAt ? 
                              new Date(record.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              ''
                            }
                          </span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.actionContainer}>
                          <button
                            style={styles.viewButton}
                            onClick={() => handleView(record)}
                          >
                            👁️ View
                          </button>
                          <button
                            style={styles.trackButton}
                            onClick={() => handleTrack(record.awb)}
                          >
                            📍 Track
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

        {/* View Modal */}
        {viewModal && selectedRecord && (
          <div style={styles.modalOverlay} onClick={() => {
            setViewModal(false);
            setSelectedRecord(null);
          }}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalTitle}>
                🔄 RTO Details
                <span style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: getStatusBadge(selectedRecord.status).bg,
                  color: getStatusBadge(selectedRecord.status).color,
                  marginLeft: 'auto'
                }}>
                  {getStatusBadge(selectedRecord.status).icon} {getStatusBadge(selectedRecord.status).label}
                </span>
              </div>
              
              <div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>AWB</span>
                  <span style={styles.detailValue}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      {selectedRecord.awb || ''}
                    </span>
                    <button
                      style={styles.awbCopyButton}
                      onClick={() => handleCopyAWB(selectedRecord.awb)}
                      title="Copy AWB"
                    >
                      📋 Copy
                    </button>
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Order Number</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.orderId?.orderNumber || '-'}
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer Name</span>
                  <span style={styles.detailValue}>
                    <strong>{selectedRecord.orderId?.customerName || 'N/A'}</strong>
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer Phone</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.orderId?.customerPhone || 'N/A'}
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Delivery Address</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.orderId?.address || 'N/A'}
                    <br />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Pincode: {selectedRecord.orderId?.pincode || 'N/A'}
                    </span>
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Courier</span>
                  <span style={styles.detailValue}>
                    {getCourierIcon(selectedRecord.courier)} {selectedRecord.courier || 'N/A'}
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>RTO Reason</span>
                  <span style={styles.detailValue}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: getReasonBadge(selectedRecord.rtoReason).bg,
                      color: getReasonBadge(selectedRecord.rtoReason).color
                    }}>
                      {selectedRecord.rtoReason || 'N/A'}
                    </span>
                    {selectedRecord.rtoSubReason && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {selectedRecord.rtoSubReason}
                      </div>
                    )}
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Current Status</span>
                  <span style={styles.detailValue}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getStatusBadge(selectedRecord.status).bg,
                      color: getStatusBadge(selectedRecord.status).color
                    }}>
                      {getStatusBadge(selectedRecord.status).icon} {getStatusBadge(selectedRecord.status).label}
                    </span>
                  </span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Created Date</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.createdAt ? 
                      new Date(selectedRecord.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'N/A'
                    }
                  </span>
                </div>
                
                {/* Timeline */}
                <div style={styles.timelineContainer}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0f172a' }}>
                    📊 Timeline
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
                          ...styles.timelineItem,
                          ...(isActive || (isPast && !isCompleted) ? styles.timelineActive : styles.timelineInactive)
                        }}
                      >
                        <span>{statusIcon}</span>
                        <span>{item.replace(/_/g, ' ')}</span>
                        {isActive && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#16a34a' }}>● Current</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  style={styles.closeButton}
                  onClick={() => {
                    setViewModal(false);
                    setSelectedRecord(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style>{`
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

        select:focus, input:focus, textarea:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
        }

        select:hover, input:hover {
          border-color: #f97316 !important;
        }

        button:hover {
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(0);
        }

        tbody tr:hover {
          background-color: #f8fafc !important;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
    </div>
  );
};

export default MerchantRTO;