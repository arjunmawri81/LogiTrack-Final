// MerchantRTO.jsx - Fixed with Orange Gradient Header
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

const MerchantRTO = () => {
  const [rtoRecords, setRtoRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAWB, setSearchAWB] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    completed: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

      const pending = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'pending' || status === 'initiated';
      }).length;
      
      const inTransit = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'in_transit' || status === 'picked_up';
      }).length;
      
      const completed = data.filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'completed' || status === 'delivered' || status === 'closed';
      }).length;
      
      setStats({
        total: data.length,
        pending,
        inTransit,
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
      'Return Attempts',
      'Last Attempt',
      'Status',
      'Current Status',
      'Courier Remarks',
      'Remarks'
    ];
    
    const csvData = filteredRecords.map(record => [
      record.awb || '',
      record.orderId || '',
      record.customerName || '',
      record.customerPhone || '',
      (record.address || '').replace(/"/g, '""'),
      record.pincode || '',
      record.courier || '',
      record.rtoReason || '',
      record.rtoSubReason || '',
      `${record.returnAttempts || 0} of ${record.maxAttempts || 3}`,
      record.lastAttemptDate ? new Date(record.lastAttemptDate).toLocaleDateString('en-IN') : '',
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
      filtered = filtered.filter(record =>
        ((record.awb || '').toLowerCase()).includes(searchAWB.toLowerCase()) ||
        ((record.orderId || '').toLowerCase()).includes(searchAWB.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => 
        ((record.status || '').toLowerCase()) === statusFilter.toLowerCase()
      );
    }

    if (courierFilter !== 'all') {
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
      
      if (actionType === 'pickup') {
        await api.put(`/rto/${recordId}/request-pickup`, {
          note: actionNote.trim()
        });
        showToast('Pickup request submitted successfully', 'success');
      } else if (actionType === 'return') {
        await api.put(`/rto/${recordId}/request-return`, {
          note: actionNote.trim()
        });
        showToast('Return request submitted successfully', 'success');
      }
      
      await fetchRTOData();
      setActionModal(false);
      setActionNote('');
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error performing action:', error);
      showToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const badges = {
      pending: { 
        icon: '🟡', 
        label: 'Pending',
        color: '#f97316',
        bg: '#fff7ed'
      },
      initiated: { 
        icon: '🟡', 
        label: 'Initiated',
        color: '#f97316',
        bg: '#fff7ed'
      },
      in_transit: { 
        icon: '🔵', 
        label: 'In Transit',
        color: '#3b82f6',
        bg: '#eff6ff'
      },
      picked_up: { 
        icon: '🔵', 
        label: 'Picked Up',
        color: '#3b82f6',
        bg: '#eff6ff'
      },
      completed: { 
        icon: '🟢', 
        label: 'Completed',
        color: '#22c55e',
        bg: '#f0fdf4'
      },
      delivered: { 
        icon: '🟢', 
        label: 'Delivered',
        color: '#22c55e',
        bg: '#f0fdf4'
      },
      closed: { 
        icon: '🟢', 
        label: 'Closed',
        color: '#22c55e',
        bg: '#f0fdf4'
      }
    };
    return badges[normalizedStatus] || badges.pending;
  };

  const getSubStatus = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const subStatusMap = {
      'pending': 'Awaiting Pickup',
      'initiated': 'Return Initiated',
      'in_transit': 'Return in Transit',
      'picked_up': 'Picked by Courier',
      'completed': 'Return Completed',
      'delivered': 'Delivered to Origin',
      'closed': 'Case Closed'
    };
    return subStatusMap[normalizedStatus] || normalizedStatus;
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
      gridTemplateColumns: 'repeat(4, 1fr)',
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
    reasonSubText: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    attemptsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    attemptsText: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#0f172a'
    },
    nextAttemptText: {
      fontSize: '11px',
      color: '#94a3b8'
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
    subStatusText: {
      fontSize: '11px',
      color: '#94a3b8'
    },
    actionContainer: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap'
    },
    viewButton: {
      padding: '6px 12px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#fff',
      color: '#64748b',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    pickupButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      whiteSpace: 'nowrap'
    },
    returnButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      color: '#fff',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
      whiteSpace: 'nowrap'
    },
    completedStatus: {
      color: '#22c55e',
      fontWeight: '600',
      fontSize: '13px'
    },
    inTransitStatus: {
      color: '#3b82f6',
      fontWeight: '600',
      fontSize: '13px'
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
      maxWidth: '600px',
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
      gap: '8px'
    },
    attemptItem: {
      padding: '8px 12px',
      marginBottom: '6px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#1e293b',
      border: '1px solid #e2e8f0'
    },
    attemptDate: {
      color: '#64748b',
      fontSize: '12px',
      marginRight: '12px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      marginTop: '12px',
      marginBottom: '16px',
      fontSize: '14px',
      fontFamily: 'inherit',
      minHeight: '80px',
      resize: 'vertical',
      outline: 'none',
      transition: 'all 0.2s ease',
      background: '#fff',
      color: '#1e293b'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '16px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '16px',
      color: '#94a3b8'
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
    submitActionButton: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      transition: 'all 0.2s ease'
    },
    pickupSubmitButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    returnSubmitButton: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
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

        {/* Header with Orange Gradient - Same as NDR */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>🔄</div>
            <div style={styles.headerText}>
              <h1 style={styles.title}>RTO Management</h1>
              <p style={styles.subtitle}>Return to Origin tracking and resolution</p>
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

        {/* Stats Cards - 4 Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total RTO</div>
            <div style={{ ...styles.statValue, color: '#f97316' }}>{stats.total}</div>
            <div style={styles.statSub}>All return cases</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{ ...styles.statValue, color: '#ff9800' }}>{stats.pending}</div>
            <div style={styles.statSub}>Awaiting action</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>In Transit</div>
            <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.inTransit}</div>
            <div style={styles.statSub}>Return in progress</div>
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
              placeholder="Search AWB / Order ID..."
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
              <option value="all">All Status</option>
              <option value="pending">🟡 Pending</option>
              <option value="in_transit">🔵 In Transit</option>
              <option value="completed">🟢 Completed</option>
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
                  <th style={styles.th}>Attempts</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const statusBadge = getStatusBadge(record.status);
                  const reasonBadge = getReasonBadge(record.rtoReason);
                  const courierIcon = getCourierIcon(record.courier);
                  const subStatus = getSubStatus(record.status);
                  const canTakeAction = (record.status || '').toLowerCase() === 'pending' || 
                                       (record.status || '').toLowerCase() === 'initiated';
                  
                  return (
                    <tr key={record._id || record.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.awbContainer}>
                          <span style={styles.awbText}>{record.awb || ''}</span>
                          <span style={styles.orderIdText}>{record.orderId || '-'}</span>
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.customerContainer}>
                          <span style={styles.customerName}>{record.customerName || 'N/A'}</span>
                          <span style={styles.customerPhone}>📞 {record.customerPhone || 'N/A'}</span>
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
                          {record.rtoSubReason && (
                            <span style={styles.reasonSubText}>{record.rtoSubReason}</span>
                          )}
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        <div style={styles.attemptsContainer}>
                          <span style={styles.attemptsText}>
                            {record.returnAttempts || 0} of {record.maxAttempts || 3}
                          </span>
                          {record.nextAttemptDate && (
                            <span style={styles.nextAttemptText}>
                              📅 {new Date(record.nextAttemptDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                          )}
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
                        <div style={styles.statusContainer}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color
                          }}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                          <span style={styles.subStatusText}>{subStatus}</span>
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
                          {canTakeAction && (
                            <>
                              <button
                                style={styles.pickupButton}
                                onClick={() => handleAction(record, 'pickup')}
                              >
                                📦 Pickup
                              </button>
                              <button
                                style={styles.returnButton}
                                onClick={() => handleAction(record, 'return')}
                              >
                                ↩️ Return
                              </button>
                            </>
                          )}
                          {(record.status || '').toLowerCase() === 'completed' && (
                            <span style={styles.completedStatus}>✅ Completed</span>
                          )}
                          {(record.status || '').toLowerCase() === 'delivered' && (
                            <span style={styles.completedStatus}>✅ Delivered</span>
                          )}
                          {(record.status || '').toLowerCase() === 'in_transit' && (
                            <span style={styles.inTransitStatus}>🚚 In Transit</span>
                          )}
                          {(record.status || '').toLowerCase() === 'picked_up' && (
                            <span style={styles.inTransitStatus}>📦 Picked Up</span>
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
                  <span style={styles.detailLabel}>Order ID</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.orderId || '-'}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer</span>
                  <span style={styles.detailValue}>
                    <strong>{selectedRecord.customerName || ''}</strong>
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.customerPhone || ''}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Address</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.address || ''}<br />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Pincode: {selectedRecord.pincode || ''}
                    </span>
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Courier</span>
                  <span style={styles.detailValue}>
                    {getCourierIcon(selectedRecord.courier)} {selectedRecord.courier || ''}
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
                      {selectedRecord.rtoReason || ''}
                    </span>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                      {selectedRecord.rtoSubReason || ''}
                    </div>
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Expected Return</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.expectedReturnDate ? 
                      new Date(selectedRecord.expectedReturnDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 
                      'Pending Courier Update'
                    }
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Attempts</span>
                  <span style={styles.detailValue}>
                    Attempt {selectedRecord.returnAttempts || 0} of {selectedRecord.maxAttempts || 3}
                    {selectedRecord.nextAttemptDate && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        📅 Next: {new Date(selectedRecord.nextAttemptDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Last Attempt</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.lastAttemptDate ? 
                      new Date(selectedRecord.lastAttemptDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 
                      'No attempts yet'
                    }
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Created</span>
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
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {getSubStatus(selectedRecord.status)}
                    </div>
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Remarks</span>
                  <span style={styles.detailValue}>{selectedRecord.remarks || 'No remarks'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Courier Remarks</span>
                  <span style={styles.detailValue}>{selectedRecord.courierRemarks || 'No remarks from courier'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Attempt History</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.attemptHistory && selectedRecord.attemptHistory.length > 0 ? (
                      selectedRecord.attemptHistory.map((attempt, index) => (
                        <div key={index} style={styles.attemptItem}>
                          <span style={styles.attemptDate}>{attempt.date}</span>
                          {attempt.status}
                        </div>
                      ))
                    ) : (
                      'No attempt history available'
                    )}
                  </span>
                </div>
              </div>

              <div style={styles.modalButtons}>
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

        {/* Action Modal */}
        {actionModal && selectedRecord && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalTitle}>
                {actionType === 'pickup' ? '📦 Request Pickup' : '↩️ Process Return'}
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
                  <span style={styles.detailLabel}>Order ID</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.orderId || '-'}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.customerName || ''}
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
                  <span style={styles.detailLabel}>Request Type</span>
                  <span style={styles.detailValue}>
                    <strong>
                      {actionType === 'pickup' ? '📦 Pickup Request' : '↩️ Return Request'}
                    </strong>
                  </span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontWeight: '500', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Action Note <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    style={styles.textarea}
                    placeholder={actionType === 'pickup' 
                      ? 'Enter reason for pickup request...' 
                      : 'Enter reason for return process...'}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.modalButtons}>
                <button
                  style={styles.closeButton}
                  onClick={() => {
                    setActionModal(false);
                    setActionNote('');
                    setSelectedRecord(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.submitActionButton,
                    ...(actionType === 'pickup' ? styles.pickupSubmitButton : styles.returnSubmitButton),
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={submitAction}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Submitting...' : (actionType === 'pickup' ? 'Request Pickup' : 'Process Return')}
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