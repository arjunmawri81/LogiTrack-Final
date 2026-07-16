
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import LabelSettingsModal from "../../components/LabelSettingsModal";
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
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [downloadingLabel, setDownloadingLabel] = useState(false);
  
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelModalMode, setLabelModalMode] = useState(null);
  const [singleShipmentId, setSingleShipmentId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const getUniqueCouriers = () => {
    const courierSet = new Set();
    orders.forEach(order => {
      if (order.shipmentId?.courier) {
        courierSet.add(order.shipmentId.courier);
      }
    });
    return Array.from(courierSet);
  };

  const couriers = getUniqueCouriers();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
      if (showBulkDropdown && !event.target.closest('.bulk-actions-wrapper')) {
        setShowBulkDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId, showBulkDropdown]);

  const filteredOrders = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.customerPhone?.includes(search) ||
      o.awb?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;
    if (activeTab !== 'ALL' && o.status !== activeTab) return false;
    
    if (
      courierFilter !== "ALL" &&
      o.shipmentId?.courier?.toLowerCase() !== courierFilter.toLowerCase()
    )
      return false;

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
      NEW: { bg: "#fef3c7", color: "#92400e" },
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
    { id: 'NEW', label: 'New' },
    { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'NDR', label: 'NDR' },
    { id: 'RTO', label: 'RTO' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  const dateOptions = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { id: 'CUSTOM', label: 'Custom Range' }
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredOrders.map(order => order._id);
      setSelectedOrders(allIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const exportToExcel = () => {
    try {
      setExporting(true);
      
      const exportData = filteredOrders.map((order) => ({
        'Order ID': order.orderNumber || order._id.slice(-6),
        'AWB': order.awb || 'N/A',
        'Customer Name': order.customerName || 'N/A',
        'Customer Phone': order.customerPhone || 'N/A',
        'Courier': order.shipmentId?.courier || 'N/A',
        'Amount': order.amount || 0,
        'Status': order.status || 'NEW',
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

  const handleBulkShipment = () => {
    if (selectedOrders.length === 0) {
      alert("⚠️ Please select at least one order.");
      return;
    }
    setShowBulkDropdown(false);
    navigate("/merchant/create-shipment", {
      state: {
        orderIds: selectedOrders,
        isBulk: true,
      },
    });
  };

  const handleBulkLabels = async (settings) => {
    if (downloadingLabel) return;
    
    if (selectedOrders.length === 0) {
      alert('⚠️ Please select at least one order.');
      return;
    }

    setDownloadingLabel(true);

    try {
      const shipmentIds = orders
        .filter(order => selectedOrders.includes(order._id))
        .map(order => order.shipmentId?._id)
        .filter(Boolean);

      if (shipmentIds.length === 0) {
        alert("⚠️ No shipment labels found for selected orders.");
        setDownloadingLabel(false);
        return;
      }

      const formData = new FormData();
      
      const settingsData = { ...settings };
      delete settingsData.logoFile;
      
      formData.append("shipmentIds", JSON.stringify(shipmentIds));
      formData.append("settings", JSON.stringify(settingsData));

      if (settings.logoFile) {
        formData.append("logo", settings.logoFile);
      }

      const response = await api.post(
        "/shipments/bulk-labels",
        formData,
        {
          responseType: 'blob',
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        "download",
        `labels_${settings.format}_${Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setShowLabelModal(false);
    } catch (error) {
      console.error('Bulk labels error:', error);
      alert(error.response?.data?.message || "❌ Failed to download labels. Please try again.");
    } finally {
      setDownloadingLabel(false);
    }
  };

  const handleSingleLabelClick = (shipmentId) => {
    if (!shipmentId) {
      alert('❌ No shipment found for this order.');
      return;
    }
    setSingleShipmentId(shipmentId);
    setLabelModalMode('single');
    setShowLabelModal(true);
  };

  const downloadSingleLabel = async (settings) => {
    if (downloadingLabel) return;
    
    if (!singleShipmentId) {
      alert('❌ No shipment found.');
      return;
    }

    setDownloadingLabel(true);

    try {
      const formData = new FormData();
      
      const settingsData = { ...settings };
      delete settingsData.logoFile;
      
      formData.append("settings", JSON.stringify(settingsData));

      if (settings.logoFile) {
        formData.append("logo", settings.logoFile);
      }

      const response = await api.post(
        `/shipments/${singleShipmentId}/label`,
        formData,
        {
          responseType: 'blob',
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `label_${singleShipmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setOpenMenuId(null);
      
      setShowLabelModal(false);
    } catch (error) {
      console.error('Label download error:', error);
      alert(error.response?.data?.message || "❌ Failed to download label. Please try again.");
    } finally {
      setDownloadingLabel(false);
    }
  };

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
      setShowBulkDropdown(false);
      fetchOrders();
    } catch (error) {
      console.error('Bulk cancel error:', error);
      alert('❌ Failed to cancel orders.');
    }
  };

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
      window.URL.revokeObjectURL(url);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Invoice download error:', error);
      alert(error.response?.data?.message || "❌ Failed to download invoice.");
    }
  };

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
      <div className="orders-loading-container">
        <div className="orders-sidebar">
          <Sidebar />
        </div>
        <div className="orders-loading-spinner">
          <FaSpinner className="animate-spin" size={40} color="#f97316" />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-sidebar">
        <Sidebar />
      </div>

      <div className="orders-main">
        <div className="orders-header-section">
          <div className="orders-header-top">
            <div>
              <h1 className="orders-title">Orders Management</h1>
              <p className="orders-subtitle">Manage and track all customer orders</p>
            </div>
            <div className="orders-header-actions">
              <label className="orders-upload-btn orders-upload-csv">
                <FaUpload /> {uploading ? 'Uploading...' : 'Upload CSV'}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleCSVUpload}
                  disabled={uploading}
                />
              </label>

              <label className="orders-upload-btn orders-upload-excel">
                <FaUpload /> {uploading ? 'Uploading...' : 'Upload Excel'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelUpload}
                  disabled={uploading}
                />
              </label>

              <button
                onClick={exportToExcel}
                disabled={exporting || filteredOrders.length === 0}
                className="orders-export-btn"
              >
                <FaFileExcel /> {exporting ? 'Exporting...' : 'Export Excel'}
              </button>

              {selectedOrders.length > 0 && (
                <div className="bulk-actions-wrapper">
                  <button
                    className="orders-bulk-btn"
                    onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                  >
                    <FaTruck /> Bulk Actions ({selectedOrders.length})
                  </button>
                  
                  {showBulkDropdown && (
                    <div className="orders-bulk-dropdown">
                      <button onClick={handleBulkShipment} className="orders-dropdown-item">
                        <FaTruck /> Bulk Ship
                      </button>
                      <button
                        onClick={() => {
                          setShowBulkDropdown(false);
                          setLabelModalMode('bulk');
                          setShowLabelModal(true);
                        }}
                        className="orders-dropdown-item"
                      >
                        <FaDownload /> Download Labels
                      </button>
                      <hr className="orders-dropdown-divider" />
                      <button onClick={handleBulkCancel} className="orders-dropdown-item orders-dropdown-danger">
                        <FaTimes /> Cancel Orders
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="orders-create-btn"
                onClick={() => navigate("/merchant/create-order")}
              >
                + Create Order
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="orders-error-banner">
            <span>{error}</span>
            <button onClick={fetchOrders} className="orders-retry-btn">
              Retry
            </button>
          </div>
        )}

        <div className="orders-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`orders-tab ${activeTab === tab.id ? 'orders-tab-active' : ''}`}
            >
              {tab.label}
              <span className={`orders-tab-count ${activeTab === tab.id ? 'orders-tab-count-active' : ''}`}>
                {getStatusCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        <div className="orders-filters">
          <div className="orders-search">
            <FaSearch color="#94a3b8" size={16} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, or AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="orders-search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="orders-clear-search">
                <FaTimes size={14} />
              </button>
            )}
          </div>

          <div className="orders-filter-wrapper">
            <button
              onClick={() => setShowCourierDropdown(!showCourierDropdown)}
              className="orders-filter-btn"
            >
              <FaFilter size={14} />
              Courier: {courierFilter === 'ALL' ? 'All' : courierFilter}
              <FaChevronDown size={12} />
            </button>
            {showCourierDropdown && (
              <div className="orders-filter-dropdown">
                <button
                  onClick={() => { setCourierFilter('ALL'); setShowCourierDropdown(false); }}
                  className="orders-dropdown-item"
                >
                  All
                </button>
                {couriers.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCourierFilter(c); setShowCourierDropdown(false); }}
                    className="orders-dropdown-item"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="orders-filter-wrapper">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="orders-filter-btn"
            >
              <FaCalendarAlt size={14} />
              {dateFilter === 'ALL' ? 'Date' : dateOptions.find(d => d.id === dateFilter)?.label || 'Custom'}
              <FaChevronDown size={12} />
            </button>
            {showDateDropdown && (
              <div className="orders-filter-dropdown orders-date-dropdown">
                {dateOptions.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { 
                      setDateFilter(d.id);
                      if (d.id !== 'CUSTOM') {
                        setShowDateDropdown(false);
                      }
                    }}
                    className="orders-dropdown-item"
                  >
                    {d.label}
                  </button>
                ))}
                {dateFilter === 'CUSTOM' && (
                  <div className="orders-custom-date">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="orders-date-input"
                    />
                    <span className="orders-date-separator">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="orders-date-input"
                    />
                    <button
                      onClick={() => setShowDateDropdown(false)}
                      className="orders-apply-date"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {(search || activeTab !== 'ALL' || courierFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <button onClick={clearFilters} className="orders-clear-filters">
              <FaTimes size={14} /> Clear Filters
            </button>
          )}
        </div>

        <div className="orders-table-wrapper">
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr className="orders-table-header">
                  <th className="orders-table-th orders-table-checkbox">
                    <input
                      type="checkbox"
                      checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {["ORDER ID", "AWB", "CUSTOMER", "PHONE", "COURIER", "AMOUNT", "STATUS", "DATE", "ACTIONS"].map((h) => (
                    <th key={h} className="orders-table-th">
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
                      <tr key={order._id} className="orders-table-row">
                        <td className="orders-table-td orders-table-checkbox">
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
                        <td className="orders-table-td orders-order-id">
                          {order.orderNumber || order._id.slice(-6)}
                        </td>
                        <td className="orders-table-td orders-awb">
                          {order.awb || '-'}
                        </td>
                        <td className="orders-table-td orders-customer">
                          {order.customerName || "N/A"}
                        </td>
                        <td className="orders-table-td orders-phone">
                          {order.customerPhone || "N/A"}
                        </td>
                        <td className="orders-table-td orders-courier">
                          <span className="orders-courier-badge">
                            {order.shipmentId?.courier
                              ? order.shipmentId.courier.charAt(0).toUpperCase() +
                                order.shipmentId.courier.slice(1)
                              : "-"}
                          </span>
                        </td>
                        <td className="orders-table-td orders-amount">
                          ₹{order.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="orders-table-td">
                          <span className="orders-status-badge" style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}>
                            {order.status || "NEW"}
                          </span>
                        </td>
                        <td className="orders-table-td orders-date">
                          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : "N/A"}
                        </td>
                        <td className="orders-table-td">
                          <div className="action-menu-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === order._id ? null : order._id);
                              }}
                              className="orders-action-btn"
                            >
                              <FaEllipsisV size={14} />
                              <span>Actions</span>
                              <FaChevronDown size={10} />
                            </button>

                            {openMenuId === order._id && (
                              <div className="orders-action-menu">
                                <button
                                  onClick={() => {
                                    navigate(`/merchant/orders/${order._id}`);
                                    setOpenMenuId(null);
                                  }}
                                  className="orders-menu-item orders-menu-view"
                                >
                                  <FaEye size={14} /> View Order
                                </button>

                                {!hasShipment && !isDelivered && !isCancelled && (
                                  <button
                                    onClick={() => {
                                      navigate(`/merchant/orders/edit/${order._id}`);
                                      setOpenMenuId(null);
                                    }}
                                    className="orders-menu-item orders-menu-edit"
                                  >
                                    <FaEdit size={14} /> Edit Order
                                  </button>
                                )}

                                {!hasShipment && !isCancelled && (
                                  <button
                                    onClick={() => {
                                      navigate("/merchant/create-shipment", {
                                        state: { order }
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="orders-menu-item orders-menu-ship"
                                  >
                                    <FaTruck size={14} /> Create Shipment
                                  </button>
                                )}

                                {hasShipment && (
                                  <button
                                    onClick={() => {
                                      navigate(`/merchant/shipment/track/${order.shipmentId?._id}`);
                                      setOpenMenuId(null);
                                    }}
                                    className="orders-menu-item orders-menu-track"
                                  >
                                    <FaBox size={14} /> Track Shipment
                                  </button>
                                )}

                                {order.shipmentId && (
                                  <button
                                    onClick={() => handleSingleLabelClick(order.shipmentId._id)}
                                    className="orders-menu-item orders-menu-label"
                                  >
                                    <FaTag size={14} /> Download Label
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    if (!order.invoiceId?._id) {
                                      alert("⚠️ Invoice not generated yet");
                                      return;
                                    }
                                    handleDownloadInvoice(order.invoiceId._id);
                                  }}
                                  className="orders-menu-item orders-menu-invoice"
                                >
                                  <FaFileInvoice size={14} /> Download Invoice
                                </button>

                                {canCancel && (
                                  <>
                                    <hr className="orders-menu-divider" />
                                    <button
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="orders-menu-item orders-menu-cancel"
                                    >
                                      <FaBan size={14} /> Cancel Order
                                    </button>
                                  </>
                                )}

                                {hasShipment && (
                                  <div className="orders-menu-disabled">
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
                    <td colSpan="10" className="orders-empty">
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

        {filteredOrders.length > 0 && (
          <div className="orders-footer">
            <span>
              {selectedOrders.length > 0 && (
                <span className="orders-selected-info">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""} selected
                  <button
                    onClick={() => setSelectedOrders([])}
                    className="orders-clear-selection"
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

      <LabelSettingsModal
        open={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        isBulk={labelModalMode === "bulk"}
        selectedCount={selectedOrders.length}
        downloading={downloadingLabel}
        onDownload={(settings) => {
          if (labelModalMode === "bulk") {
            handleBulkLabels(settings);
          } else {
            downloadSingleLabel(settings);
          }
        }}
      />
    </div>
  );
};

export default Orders;