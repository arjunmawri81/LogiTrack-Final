// NDR.jsx - Admin NDR Management Page (Actions in Single Line)
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaExclamationTriangle,
  FaClock,
  FaRedo,
  FaUndo,
  FaEye,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFileExport,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaBox,
  FaTruck,
  FaCalendarAlt,
  FaComment,
  FaPhone
} from 'react-icons/fa';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';

const NDR = () => {
  const [ndrRecords, setNdrRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAWB, setSearchAWB] = useState('');
  const [searchMerchant, setSearchMerchant] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reattemptRequested: 0,
    rtoRequested: 0,
    resolved: 0
  });

  // =================================
  // FETCH NDR DATA
  // =================================
  const fetchNDR = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/ndr');
      
      const records = res.data.ndrs || res.data || [];
      setNdrRecords(records);
      setFilteredRecords(records);
      
      // Calculate stats
      const total = records.length;
      const pending = records.filter(r => r.status === 'PENDING').length;
      const reattemptRequested = records.filter(r => r.status === 'REATTEMPT_REQUESTED').length;
      const rtoRequested = records.filter(r => r.status === 'RTO_REQUESTED').length;
      const resolved = records.filter(r => r.status === 'RESOLVED').length;
      
      setStats({
        total,
        pending,
        reattemptRequested,
        rtoRequested,
        resolved
      });
    } catch (error) {
      console.error('Error fetching NDR:', error);
      setError('Failed to load NDR records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNDR();
  }, [fetchNDR]);

  // =================================
  // FILTER RECORDS
  // =================================
  useEffect(() => {
    let filtered = ndrRecords;

    if (searchAWB) {
      filtered = filtered.filter(r =>
        r.awb?.toLowerCase().includes(searchAWB.toLowerCase())
      );
    }

    if (searchMerchant) {
      filtered = filtered.filter(r =>
        r.merchantId?.name?.toLowerCase().includes(searchMerchant.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (courierFilter !== 'ALL') {
      filtered = filtered.filter(r => r.courier === courierFilter);
    }

    setFilteredRecords(filtered);
  }, [searchAWB, searchMerchant, statusFilter, courierFilter, ndrRecords]);

  // =================================
  // GET UNIQUE COURIERS
  // =================================
  const uniqueCouriers = [...new Set(ndrRecords.map(r => r.courier).filter(Boolean))];

  // =================================
  // SHOW TOAST
  // =================================
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: '', type: '', visible: false });
    }, 3000);
  };

  // =================================
  // EXPORT CSV
  // =================================
  const handleExportCSV = () => {
    const headers = [
      'AWB',
      'Merchant',
      'Customer',
      'Phone',
      'Courier',
      'Reason',
      'Attempts',
      'Status',
      'Created At'
    ];

    const csvData = filteredRecords.map(r => [
      r.awb || '',
      r.merchantId?.name || '',
      r.customerName || r.orderId?.customerName || '',
      r.customerPhone || r.orderId?.customerPhone || '',
      r.courier || '',
      r.reason || '',
      `${r.deliveryAttempts || 0}/${r.maxAttempts || 3}`,
      r.status || '',
      r.createdAt ? new Date(r.createdAt).toLocaleString() : ''
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

  // =================================
  // APPROVE REATTEMPT
  // =================================
  const approveReattempt = async (id) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/ndr/${id}/approve-reattempt`);
      showToast('Reattempt approved successfully', 'success');
      await fetchNDR();
    } catch (error) {
      console.error('Error approving reattempt:', error);
      showToast(error.response?.data?.message || 'Failed to approve reattempt', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // =================================
  // APPROVE RTO
  // =================================
  const approveRTO = async (id) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/ndr/${id}/approve-rto`);
      showToast('RTO approved successfully', 'success');
      await fetchNDR();
    } catch (error) {
      console.error('Error approving RTO:', error);
      showToast(error.response?.data?.message || 'Failed to approve RTO', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // =================================
  // REJECT REQUEST
  // =================================
  const rejectRequest = async (id) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/ndr/${id}/reject`);
      showToast('Request rejected successfully', 'success');
      await fetchNDR();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast(error.response?.data?.message || 'Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // =================================
  // VIEW DETAILS
  // =================================
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  // =================================
  // GET STATUS BADGE
  // =================================
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: {
        icon: '🟡',
        label: 'Pending',
        color: '#f59e0b',
        bg: '#fef3c7'
      },
      REATTEMPT_REQUESTED: {
        icon: '🔄',
        label: 'Awaiting Approval',
        color: '#3b82f6',
        bg: '#dbeafe'
      },
      REATTEMPT: {
        icon: '✅',
        label: 'Approved',
        color: '#10b981',
        bg: '#d1fae5'
      },
      RTO_REQUESTED: {
        icon: '📦',
        label: 'Awaiting RTO Approval',
        color: '#f97316',
        bg: '#ffedd5'
      },
      RTO: {
        icon: '↩️',
        label: 'RTO Approved',
        color: '#ef4444',
        bg: '#fee2e2'
      },
      RESOLVED: {
        icon: '🎉',
        label: 'Resolved',
        color: '#6366f1',
        bg: '#e0e7ff'
      }
    };
    return badges[status] || badges.PENDING;
  };

  // =================================
  // GET REQUEST TYPE
  // =================================
  const getRequestType = (status) => {
    if (status === 'REATTEMPT_REQUESTED' || status === 'REATTEMPT') {
      return { label: 'Reattempt', color: '#3b82f6', bg: '#dbeafe' };
    }
    if (status === 'RTO_REQUESTED' || status === 'RTO') {
      return { label: 'RTO', color: '#ef4444', bg: '#fee2e2' };
    }
    return null;
  };

  // =================================
  // STYLES
  // =================================
  const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  };

  // =================================
  // LOADING STATE
  // =================================
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: '280px', padding: '20px 30px' }}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <FaSpinner size={48} color="#f97316" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', marginTop: '20px' }}>Loading NDR records...</p>
          </div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <AdminSidebar />

      <div style={{ flex: 1, marginLeft: '280px', padding: '20px 30px' }}>
        {/* Toast Notification */}
        {toast.visible && (
          <div style={{
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
            fontWeight: '500',
            background: toast.type === 'success' 
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #ef4444, #dc2626)'
          }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            📋 NDR Management
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Manage merchant NDR requests and approvals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Stats Cards - 5 Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaExclamationTriangle size={28} color="#f59e0b" />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>Total NDR</h4>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>{stats.total}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaClock size={28} color="#3b82f6" />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>Pending Requests</h4>
                <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '28px' }}>{stats.pending}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaRedo size={28} color="#10b981" />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>Reattempt Requests</h4>
                <h2 style={{ margin: 0, color: '#10b981', fontSize: '28px' }}>{stats.reattemptRequested}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaUndo size={28} color="#ef4444" />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>RTO Requests</h4>
                <h2 style={{ margin: 0, color: '#ef4444', fontSize: '28px' }}>{stats.rtoRequested}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaCheckCircle size={28} color="#6366f1" />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>Resolved</h4>
                <h2 style={{ margin: 0, color: '#6366f1', fontSize: '28px' }}>{stats.resolved}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '14px',
          marginBottom: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
            <FaSearch color="#94a3b8" size={14} />
            <input
              type="text"
              placeholder="Search AWB..."
              value={searchAWB}
              onChange={(e) => setSearchAWB(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                background: 'transparent',
                width: '100%',
                color: '#0f172a'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
            <FaUser color="#94a3b8" size={14} />
            <input
              type="text"
              placeholder="Search Merchant..."
              value={searchMerchant}
              onChange={(e) => setSearchMerchant(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                background: 'transparent',
                width: '100%',
                color: '#0f172a'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#f8fafc',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
              color: '#0f172a'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="REATTEMPT_REQUESTED">Reattempt Requested</option>
            <option value="RTO_REQUESTED">RTO Requested</option>
            <option value="REATTEMPT">Reattempt Approved</option>
            <option value="RTO">RTO Approved</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#f8fafc',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '140px',
              color: '#0f172a'
            }}
          >
            <option value="ALL">All Couriers</option>
            {uniqueCouriers.map((courier) => (
              <option key={courier} value={courier}>{courier}</option>
            ))}
          </select>

          <button
            onClick={fetchNDR}
            style={{
              padding: '8px 16px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <FaRedo size={12} /> Refresh
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
            }}
          >
            <FaFileExport size={12} /> Export CSV
          </button>
        </div>

        {/* Result Count */}
        <div style={{
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '12px',
          fontWeight: '500'
        }}>
          Showing {filteredRecords.length} of {ndrRecords.length} NDR Cases
        </div>

        {/* Table */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AWB</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Merchant</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courier</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attempts</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  const statusBadge = getStatusBadge(r.status);
                  const requestType = getRequestType(r.status);
                  const isPending = r.status === 'PENDING';
                  const isReattemptRequested = r.status === 'REATTEMPT_REQUESTED';
                  const isRTORequested = r.status === 'RTO_REQUESTED';
                  
                  return (
                    <tr
                      key={r._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600', fontSize: '13px', fontFamily: 'monospace' }}>
                        {r.awb || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontSize: '13px' }}>
                        {r.merchantId?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontSize: '13px' }}>
                        <div><strong>{r.customerName || r.orderId?.customerName || 'N/A'}</strong></div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          📞 {r.customerPhone || r.orderId?.customerPhone || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontSize: '13px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          background: '#f1f5f9',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          <FaTruck size={10} /> {r.courier || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                        {r.reason || 'Delivery Failed'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#0f172a', fontSize: '13px', fontWeight: '500' }}>
                        {r.deliveryAttempts || 0}/{r.maxAttempts || 3}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {requestType ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: requestType.bg,
                            color: requestType.color
                          }}>
                            {requestType.label}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.icon} {statusBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {/* ✅ FIXED: All buttons in a single line with flex-wrap: nowrap */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          justifyContent: 'center', 
                          flexWrap: 'nowrap',
                          alignItems: 'center'
                        }}>
                          <button
                            onClick={() => handleViewDetails(r)}
                            style={{
                              padding: '5px 10px',
                              background: '#f1f5f9',
                              color: '#475569',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          >
                            <FaEye size={12} /> View
                          </button>

                          {isReattemptRequested && (
                            <>
                              <button
                                onClick={() => approveReattempt(r._id)}
                                disabled={actionLoading}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: actionLoading ? 0.6 : 1,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FaCheck size={11} /> Approve
                              </button>
                              <button
                                onClick={() => rejectRequest(r._id)}
                                disabled={actionLoading}
                                style={{
                                  padding: '5px 10px',
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: actionLoading ? 0.6 : 1,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FaTimes size={11} /> Reject
                              </button>
                            </>
                          )}

                          {isRTORequested && (
                            <>
                              <button
                                onClick={() => approveRTO(r._id)}
                                disabled={actionLoading}
                                style={{
                                  padding: '5px 10px',
                                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: actionLoading ? 0.6 : 1,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FaCheck size={11} /> Approve
                              </button>
                              <button
                                onClick={() => rejectRequest(r._id)}
                                disabled={actionLoading}
                                style={{
                                  padding: '5px 10px',
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: actionLoading ? 0.6 : 1,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FaTimes size={11} /> Reject
                              </button>
                            </>
                          )}

                          {isPending && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#94a3b8', 
                              padding: '5px 10px',
                              whiteSpace: 'nowrap'
                            }}>
                              No action needed
                            </span>
                          )}

                          {['REATTEMPT', 'RTO', 'RESOLVED'].includes(r.status) && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#10b981', 
                              padding: '5px 10px', 
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}>
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ padding: 0 }}>
                    <div style={{
                      padding: '80px 20px',
                      textAlign: 'center',
                      background: '#fff'
                    }}>
                      <FaExclamationTriangle size={64} color="#cbd5e1" />
                      <h3 style={{
                        marginTop: '20px',
                        color: '#334155',
                        fontSize: '20px',
                        fontWeight: '600'
                      }}>
                        No NDR Cases Found
                      </h3>
                      <p style={{
                        color: '#94a3b8',
                        marginTop: '8px',
                        fontSize: '14px'
                      }}>
                        All shipments are currently healthy.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedRecord && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
              📦 NDR Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>AWB Number</label>
                    <div style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{selectedRecord.awb || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Merchant</label>
                    <div style={{ color: '#0f172a' }}>{selectedRecord.merchantId?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Customer</label>
                    <div style={{ color: '#0f172a', fontWeight: '500' }}>{selectedRecord.customerName || selectedRecord.orderId?.customerName || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Phone</label>
                    <div style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone size={14} color="#94a3b8" />
                      {selectedRecord.customerPhone || selectedRecord.orderId?.customerPhone || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Order Number</label>
                    <div style={{ color: '#0f172a' }}>{selectedRecord.orderId?.orderNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Courier</label>
                    <div style={{ color: '#0f172a' }}>{selectedRecord.courier || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Reason</label>
                    <div style={{ color: '#0f172a' }}>{selectedRecord.reason || 'Delivery Failed'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Attempts</label>
                    <div style={{ color: '#0f172a', fontWeight: '500' }}>
                      {selectedRecord.deliveryAttempts || 0} of {selectedRecord.maxAttempts || 3}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Status</label>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getStatusBadge(selectedRecord.status).bg,
                      color: getStatusBadge(selectedRecord.status).color
                    }}>
                      {getStatusBadge(selectedRecord.status).icon} {getStatusBadge(selectedRecord.status).label}
                    </span>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '2px' }}>Created At</label>
                    <div style={{ color: '#0f172a' }}>
                      {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Note */}
            {selectedRecord.actionNote && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
                <label style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  <FaComment size={12} style={{ marginRight: '4px' }} /> Merchant Note
                </label>
                <div style={{ color: '#0f172a', fontSize: '14px' }}>{selectedRecord.actionNote}</div>
              </div>
            )}

            {/* Admin Note */}
            {selectedRecord.adminNote && (
              <div style={{ marginTop: '8px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <label style={{ color: '#2563eb', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  <FaCheckCircle size={12} style={{ marginRight: '4px' }} /> Admin Note
                </label>
                <div style={{ color: '#0f172a', fontSize: '14px' }}>{selectedRecord.adminNote}</div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 24px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

        select:focus, input:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
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

export default NDR;