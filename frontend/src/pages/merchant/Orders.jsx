// Orders.jsx - Updated with all fixes
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import * as XLSX from 'xlsx';
import {
  FaSearch,
  FaEye,
  FaSpinner,
  FaEdit,
  FaTruck,
  FaFileExcel,
  FaUpload,
  FaDownload,
  FaFileInvoice,
  FaBox,
  FaTag,
  FaFilter,
  FaCalendarAlt,
  FaTimes,
  FaChevronDown,
  FaEllipsisV,
  FaBan,
} from "react-icons/fa";
import { format, subDays, isToday, isYesterday } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which order's menu is open
  
  // New state for filters
  const [activeTab, setActiveTab] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/orders");
      console.log("ORDERS =>", res.data.orders);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Apply all filters
  const filteredOrders = orders.filter((o) => {
    // Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.customerPhone?.includes(search) ||
      o.awb?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status tab filter
    if (activeTab !== 'ALL' && o.status !== activeTab) return false;

    // Courier filter
    if (courierFilter !== 'ALL' && o.courier !== courierFilter) return false;

    // Date filter
    if (dateFilter !== 'ALL') {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      
      switch(dateFilter) {
        case 'TODAY':
          if (!isToday(orderDate)) return false;
          break;
        case 'YESTERDAY':
          if (!isYesterday(orderDate)) return false;
          break;
        case 'LAST_7_DAYS':
          if (orderDate < subDays(today, 7)) return false;
          break;
        case 'LAST_30_DAYS':
          if (orderDate < subDays(today, 30)) return false;
          break;
        case 'CUSTOM':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59);
            if (orderDate < start || orderDate > end) return false;
          }
          break;
        default:
          break;
      }
    }

    return true;
  });

  const getStatusStyle = (status) => {
    const styles = {
      DELIVERED: { bg: "#dcfce7", color: "#166534" },
      CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
      PENDING: { bg: "#fef3c7", color: "#92400e" },
      PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
      SHIPPED: { bg: "#e0e7ff", color: "#3730a3" },
      READY_FOR_PICKUP: { bg: "#fef3c7", color: "#92400e" },
      OUT_FOR_DELIVERY: { bg: "#dbeafe", color: "#1e40af" },
      NDR: { bg: "#fce4ec", color: "#c62828" },
      RTO: { bg: "#ffebee", color: "#b71c1c" }
    };
    return styles[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  const getStatusCount = (status) => {
    if (status === 'ALL') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const tabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'NDR', label: 'NDR' },
    { id: 'RTO', label: 'RTO' }
  ];

  const couriers = ['DTDC', 'Delhivery', 'XpressBees', 'BlueDart'];

  const dateOptions = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { id: 'CUSTOM', label: 'Custom Range' }
  ];

  // Select/Deselect all orders
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredOrders.map(order => order._id);
      setSelectedOrders(allIds);
    } else {
      setSelectedOrders([]);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      setExporting(true);
      
      const exportData = filteredOrders.map((order) => ({
        'Order ID': order.orderNumber || order._id.slice(-6),
        'AWB': order.awb || 'N/A',
        'Customer Name': order.customerName || 'N/A',
        'Customer Phone': order.customerPhone || 'N/A',
        'Courier': order.courier || 'N/A',
        'Amount': order.amount || 0,
        'Status': order.status || 'PENDING',
        'Created Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A',
        'Shipment ID': order.shipmentId || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const colWidths = [
        { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Orders_${date}.xlsx`);
      
      alert(`✅ Exported ${exportData.length} orders successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Bulk Shipment Handler
  const handleBulkShipment = () => {
    if (selectedOrders.length === 0) {
      alert('⚠️ Please select at least one order for bulk shipment.');
      return;
    }
    navigate("/merchant/bulk-shipment", {
      state: { orderIds: selectedOrders, orderCount: selectedOrders.length }
    });
  };

  // ✅ CHANGE 1: Bulk Labels Fix - Extract shipmentIds from orders
  const handleBulkLabels = async () => {
    if (selectedOrders.length === 0) {
      alert('⚠️ Please select at least one order.');
      return;
    }

    try {
      // Extract shipment IDs from selected orders
      const shipmentIds = orders
        .filter(order => selectedOrders.includes(order._id))
        .map(order => order.shipmentId?._id)
        .filter(Boolean);

      if (shipmentIds.length === 0) {
        alert("⚠️ No shipment labels found for selected orders.");
        return;
      }

      const response = await api.post(
        "/shipments/bulk-labels",
        { shipmentIds },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `labels_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Bulk labels error:', error);
      alert('❌ Failed to download labels.');
    }
  };

  // ✅ TEMPORARILY REMOVED - Bulk Invoice and Generate Manifest
  // Will be added back when backend is ready

  // Bulk Cancel Orders
  const handleBulkCancel = async () => {
    if (selectedOrders.length === 0) {
      alert('⚠️ Please select at least one order.');
      return;
    }

    if (!window.confirm(`⚠️ Are you sure you want to cancel ${selectedOrders.length} order(s)?`)) {
      return;
    }

    try {
      await api.post('/orders/bulk-cancel', {
        orderIds: selectedOrders
      });
      
      alert(`✅ ${selectedOrders.length} order(s) cancelled successfully.`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error('Bulk cancel error:', error);
      alert('❌ Failed to cancel orders.');
    }
  };

  // ✅ FIXED: Download Single Label - uses shipmentId
  const handleDownloadLabel = async (shipmentId) => {
    if (!shipmentId) {
      alert('❌ No shipment found for this order.');
      return;
    }

    try {
      const response = await api.get(`/shipments/${shipmentId}/label`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `label_${shipmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Label download error:', error);
      alert('❌ Failed to download label.');
    }
  };

  // ✅ FIXED: Download Single Invoice - uses invoiceId
  const handleDownloadInvoice = async (invoiceId) => {
    if (!invoiceId) {
      alert('❌ No invoice found for this order.');
      return;
    }

    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Invoice download error:', error);
      alert('❌ Failed to download invoice.');
    }
  };

  // ✅ FIXED: Cancel Single Order - uses PATCH
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('⚠️ Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.patch(`/orders/${orderId}/cancel`);
      alert('✅ Order cancelled successfully.');
      fetchOrders();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('❌ Failed to cancel order.');
    }
  };

  // CSV Upload Handler
  const handleCSVUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        alert('❌ Please upload a valid CSV file.');
        e.target.value = '';
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/orders/upload-csv", formData);
      alert("✅ CSV Uploaded Successfully");
      fetchOrders();
    } catch (error) {
      console.error('CSV Upload error:', error);
      alert(error.response?.data?.message || "❌ CSV Upload Failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Excel Upload Handler
  const handleExcelUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('❌ Please upload a valid Excel file (.xlsx or .xls).');
        e.target.value = '';
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/orders/upload-excel", formData);
      alert("✅ Excel Uploaded Successfully");
      fetchOrders();
    } catch (error) {
      console.error('Excel Upload error:', error);
      alert(error.response?.data?.message || "❌ Excel Upload Failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTab('ALL');
    setCourierFilter('ALL');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedOrders([]);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <div style={{ width: "280px", flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <FaSpinner className="animate-spin" size={40} color="#f97316" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      background: "#f1f5f9", 
      minHeight: "100vh", 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" 
    }}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, padding: "24px 32px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "6px",
              }}>
                Orders Management
              </h1>
              <p style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px"
              }}>
                Manage and track all customer orders
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* Upload CSV Button */}
              <label
                style={{
                  background: uploading ? "#7c3aed" : "#8b5cf6",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: uploading ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
              >
                <FaUpload /> {uploading ? 'Uploading...' : 'Upload CSV'}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleCSVUpload}
                  disabled={uploading}
                />
              </label>

              {/* Upload Excel Button */}
              <label
                style={{
                  background: uploading ? "#0891b2" : "#06b6d4",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: uploading ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
              >
                <FaUpload /> {uploading ? 'Uploading...' : 'Upload Excel'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelUpload}
                  disabled={uploading}
                />
              </label>

              {/* Export Excel Button */}
              <button
                onClick={exportToExcel}
                disabled={exporting || filteredOrders.length === 0}
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: exporting || filteredOrders.length === 0 ? "not-allowed" : "pointer",
                  opacity: exporting || filteredOrders.length === 0 ? 0.6 : 1,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <FaFileExcel /> {exporting ? 'Exporting...' : 'Export Excel'}
              </button>

              {/* Bulk Actions Dropdown */}
              {selectedOrders.length > 0 && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                    onClick={() => {
                      const dropdown = document.getElementById('bulkDropdown');
                      dropdown?.classList.toggle('show');
                    }}
                  >
                    <FaTruck /> Bulk Actions ({selectedOrders.length})
                  </button>
                  <div id="bulkDropdown" style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    display: 'none',
                    zIndex: 10,
                    padding: '4px 0'
                  }}>
                    <button onClick={handleBulkShipment} style={dropdownItemStyle}>
                      <FaTruck /> Bulk Shipment
                    </button>
                    <button onClick={handleBulkLabels} style={dropdownItemStyle}>
                      <FaDownload /> Download Labels
                    </button>
                    {/* ✅ TEMPORARILY REMOVED - Bulk Invoice and Generate Manifest */}
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                    <button onClick={handleBulkCancel} style={{...dropdownItemStyle, color: '#dc2626' }}>
                      <FaTimes /> Cancel Orders
                    </button>
                  </div>
                </div>
              )}

              {/* Create Order Button */}
              <button
                style={{
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={() => navigate("/merchant/create-order")}
              >
                + Create Order
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#991b1b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{error}</span>
            <button
              onClick={fetchOrders}
              style={{
                background: "transparent",
                border: "1px solid #991b1b",
                padding: "4px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#991b1b",
                fontWeight: "500"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          overflowX: 'auto',
          padding: '4px 0',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeTab === tab.id ? '2px solid #f97316' : '1px solid #e2e8f0',
                background: activeTab === tab.id ? '#fff7ed' : '#fff',
                color: activeTab === tab.id ? '#f97316' : '#64748b',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? '#f97316' : '#e2e8f0',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                borderRadius: '50%',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {getStatusCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            flex: '1',
            minWidth: '250px',
            display: "flex",
            alignItems: "center",
          }}>
            <FaSearch color="#94a3b8" size={16} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, or AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                marginLeft: "12px",
                width: "100%",
                fontSize: "14px",
                color: "#0f172a",
                background: "transparent"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>

          {/* Courier Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCourierDropdown(!showCourierDropdown)}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#0f172a"
              }}
            >
              <FaFilter size={14} />
              Courier: {courierFilter === 'ALL' ? 'All' : courierFilter}
              <FaChevronDown size={12} />
            </button>
            {showCourierDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '4px 0',
                minWidth: '150px',
                zIndex: 10
              }}>
                <button
                  onClick={() => { setCourierFilter('ALL'); setShowCourierDropdown(false); }}
                  style={dropdownItemStyle}
                >
                  All
                </button>
                {couriers.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCourierFilter(c); setShowCourierDropdown(false); }}
                    style={dropdownItemStyle}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#0f172a"
              }}
            >
              <FaCalendarAlt size={14} />
              {dateFilter === 'ALL' ? 'Date' : dateOptions.find(d => d.id === dateFilter)?.label || 'Custom'}
              <FaChevronDown size={12} />
            </button>
            {showDateDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px',
                minWidth: '200px',
                zIndex: 10
              }}>
                {dateOptions.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { 
                      setDateFilter(d.id);
                      if (d.id !== 'CUSTOM') {
                        setShowDateDropdown(false);
                      }
                    }}
                    style={dropdownItemStyle}
                  >
                    {d.label}
                  </button>
                ))}
                {dateFilter === 'CUSTOM' && (
                  <div style={{ padding: '8px' }}>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={dateInputStyle}
                    />
                    <span style={{ margin: '0 4px', color: '#64748b' }}>to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={dateInputStyle}
                    />
                    <button
                      onClick={() => setShowDateDropdown(false)}
                      style={{
                        marginTop: '8px',
                        background: '#f97316',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(search || activeTab !== 'ALL' || courierFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              onClick={clearFilters}
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "none",
                borderRadius: "12px",
                padding: "12px 16px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaTimes size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}>
                  <th style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    width: "40px"
                  }}>
                    <input
                      type="checkbox"
                      checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {["ORDER ID", "AWB", "CUSTOMER", "PHONE", "COURIER", "AMOUNT", "STATUS", "DATE", "ACTIONS"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    const hasShipment = !!order.shipmentId;
                    const isDelivered = order.status === 'DELIVERED';
                    const isCancelled = order.status === 'CANCELLED';
                    const canCancel = !isDelivered && !isCancelled && !hasShipment;
                    
                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.2s",
                          background: "#ffffff"
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#ffffff")
                        }
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, order._id]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                              }
                            }}
                          />
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                          fontWeight: "500"
                        }}>
                          {order.orderNumber || order._id.slice(-6)}
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                          fontWeight: "500"
                        }}>
                          {order.awb || '-'}
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}>
                          {order.customerName || "N/A"}
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}>
                          {order.customerPhone || "N/A"}
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}>
                          <span style={{
                            background: '#f1f5f9',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {order.courier || '-'}
                          </span>
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#0f172a",
                          fontWeight: "600"
                        }}>
                          ₹{order.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block",
                          }}>
                            {order.status || "PENDING"}
                          </span>
                          {hasShipment && (
                            <span style={{
                              marginLeft: "6px",
                              background: "#dbeafe",
                              color: "#1e40af",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              fontSize: "10px",
                              fontWeight: "600",
                              display: "inline-block",
                            }}>
                              Shipped
                            </span>
                          )}
                        </td>
                        <td style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#64748b",
                        }}>
                          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : "N/A"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {/* Single Order Action Menu */}
                          <div className="action-menu-container" style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === order._id ? null : order._id);
                              }}
                              style={{
                                background: '#f1f5f9',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                color: '#475569'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e2e8f0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                              }}
                            >
                              <FaEllipsisV size={14} />
                              <span>Actions</span>
                              <FaChevronDown size={10} />
                            </button>

                            {openMenuId === order._id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '4px',
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                minWidth: '220px',
                                zIndex: 100,
                                padding: '6px 0',
                                border: '1px solid #e2e8f0'
                              }}>
                                {/* View Order */}
                                <button
                                  onClick={() => {
                                    navigate(`/merchant/orders/${order._id}`);
                                    setOpenMenuId(null);
                                  }}
                                  style={{...menuItemStyle, color: '#2563eb'}}
                                >
                                  <FaEye size={14} /> View Order
                                </button>

                                {/* Edit Order - Only if no shipment */}
                                {!hasShipment && !isDelivered && !isCancelled && (
                                  <button
                                    onClick={() => {
                                      navigate(`/merchant/orders/edit/${order._id}`);
                                      setOpenMenuId(null);
                                    }}
                                    style={{...menuItemStyle, color: '#16a34a'}}
                                  >
                                    <FaEdit size={14} /> Edit Order
                                  </button>
                                )}

                                {/* ✅ FIXED: Create Shipment - Pass order object in state */}
                                {!hasShipment && !isCancelled && (
                                  <button
                                    onClick={() => {
                                      navigate("/merchant/create-shipment", {
                                        state: { order }
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    style={{...menuItemStyle, color: '#f97316'}}
                                  >
                                    <FaTruck size={14} /> Create Shipment
                                  </button>
                                )}

                                {/* ✅ FIXED: Track Shipment - uses shipmentId._id */}
                                {hasShipment && (
                                  <button
                                    onClick={() => {
                                      navigate(`/merchant/shipment/track/${order.shipmentId?._id}`);
                                      setOpenMenuId(null);
                                    }}
                                    style={{...menuItemStyle, color: '#8b5cf6'}}
                                  >
                                    <FaBox size={14} /> Track Shipment
                                  </button>
                                )}

                                {/* ✅ CHANGE 2: Show Download Label only when shipment exists */}
                                {order.shipmentId && (
                                  <button
                                    onClick={() => handleDownloadLabel(order.shipmentId._id)}
                                    style={{...menuItemStyle, color: '#dc2626'}}
                                  >
                                    <FaTag size={14} /> Download Label
                                  </button>
                                )}

                                {/* ✅ CHANGE 3: Invoice Button Fix with check */}
                                <button
                                  onClick={() => {
                                    if (!order.invoiceId?._id) {
                                      alert("⚠️ Invoice not generated yet");
                                      return;
                                    }
                                    handleDownloadInvoice(order.invoiceId._id);
                                  }}
                                  style={{...menuItemStyle, color: '#059669'}}
                                >
                                  <FaFileInvoice size={14} /> Download Invoice
                                </button>

                                {/* Cancel Order - Only if not delivered, not cancelled, and no shipment */}
                                {canCancel && (
                                  <>
                                    <hr style={{ margin: '4px 8px', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                    <button
                                      onClick={() => handleCancelOrder(order._id)}
                                      style={{...menuItemStyle, color: '#dc2626', fontWeight: '600'}}
                                    >
                                      <FaBan size={14} /> Cancel Order
                                    </button>
                                  </>
                                )}

                                {/* Show disabled options info */}
                                {hasShipment && (
                                  <div style={{
                                    padding: '8px 16px',
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    borderTop: '1px solid #f1f5f9',
                                    marginTop: '4px'
                                  }}>
                                    <span>⚠️ Edit disabled - Shipment exists</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "14px"
                    }}>
                      {search || activeTab !== 'ALL' || courierFilter !== 'ALL' || dateFilter !== 'ALL'
                        ? "No orders found matching your filters"
                        : "No orders found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredOrders.length > 0 && (
          <div style={{
            marginTop: "16px",
            color: "#64748b",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            <span>
              {selectedOrders.length > 0 && (
                <span style={{ fontWeight: "500", color: "#0f172a" }}>
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""} selected
                  <button
                    onClick={() => setSelectedOrders([])}
                    style={{
                      marginLeft: "12px",
                      background: "transparent",
                      border: "1px solid #e2e8f0",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#64748b",
                      fontSize: "12px"
                    }}
                  >
                    Clear Selection
                  </button>
                </span>
              )}
            </span>
            <span>
              Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
              {orders.length > filteredOrders.length && ` (${orders.length} total)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper styles
const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#0f172a',
  transition: 'background 0.2s',
  borderRadius: '4px'
};

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 16px',
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#0f172a',
  transition: 'all 0.2s',
  borderRadius: '4px'
};

const dateInputStyle = {
  padding: '4px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  fontSize: '12px',
  width: '100%',
  marginBottom: '4px'
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [style*="dropdownItemStyle"]:hover {
    background: #f1f5f9;
  }
  [style*="menuItemStyle"]:hover {
    background: #f8fafc;
  }
  .show { display: block !important; }
`;
document.head.appendChild(styleSheet);

export default Orders;