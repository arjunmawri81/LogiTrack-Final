import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaSync,
  FaUser,
  FaPhone,
  FaClock as FaClockIcon,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaFilter,
  FaBuilding,
} from "react-icons/fa";
import "./Shipments.css"; 

const Shipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchShipments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchShipments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/shipments");
      setShipments(response.data.shipments || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch shipments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PICKUP_PENDING: "#f59e0b",
      PICKUP_SCHEDULED: "#06b6d4",
      PICKED_UP: "#3b82f6",
      IN_TRANSIT: "#3b82f6",
      OUT_FOR_DELIVERY: "#8b5cf6",
      DELIVERED: "#10b981",
      RTO: "#ef4444",
      NDR: "#f97316",
      CANCELLED: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const formatLastUpdated = (date) => {
    if (!date) return "---";
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredShipments = shipments.filter((shipment) => {
    const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "";
    const searchMatch = 
      shipment.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.customerPhone?.includes(searchTerm) ||
      shipment.courier?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "ALL" || shipment.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Stats calculations
  const totalCount = shipments.length;
  const pickupPendingCount = shipments.filter((s) => s.status === "PICKUP_PENDING").length;
  const inTransitCount = shipments.filter((s) => 
    s.status === "IN_TRANSIT" || 
    s.status === "OUT_FOR_DELIVERY" || 
    s.status === "PICKED_UP"
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const ndrCount = shipments.filter((s) => s.status === "NDR").length;
  const rtoCount = shipments.filter((s) => s.status === "RTO").length;

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: "PICKUP_PENDING", label: "Pickup Pending" },
    { value: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
    { value: "PICKED_UP", label: "Picked Up" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "NDR", label: "NDR" },
    { value: "RTO", label: "RTO" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="shipments-container">
      <AdminSidebar />
      <div className="shipments-content">
        {/* Header */}
        <div className="shipments-header">
          <div>
            <h1 className="shipments-header-title">
              🚚 Shipments
            </h1>
            <p className="shipments-header-subtitle">
              Monitor and manage all shipments
            </p>
          </div>
          <button
            onClick={fetchShipments}
            className="shipments-refresh-btn"
          >
            <FaSync /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="shipments-stats-grid">
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-blue">
                <FaTruck size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">Total Shipments</p>
                <h3 className="shipments-stat-value">{totalCount}</h3>
              </div>
            </div>
          </div>
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-yellow">
                <FaClock size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">Pickup Pending</p>
                <h3 className="shipments-stat-value">{pickupPendingCount}</h3>
              </div>
            </div>
          </div>
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-indigo">
                <FaTruck size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">In Transit</p>
                <h3 className="shipments-stat-value">{inTransitCount}</h3>
              </div>
            </div>
          </div>
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-green">
                <FaCheckCircle size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">Delivered</p>
                <h3 className="shipments-stat-value">{deliveredCount}</h3>
              </div>
            </div>
          </div>
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-orange">
                <FaClockIcon size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">NDR</p>
                <h3 className="shipments-stat-value">{ndrCount}</h3>
              </div>
            </div>
          </div>
          <div className="shipments-stat-card">
            <div className="shipments-stat-inner">
              <div className="shipments-stat-icon shipments-stat-icon-red">
                <FaTimesCircle size={20} />
              </div>
              <div>
                <p className="shipments-stat-label">RTO</p>
                <h3 className="shipments-stat-value">{rtoCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="shipments-search-filter">
          <div className="shipments-search-wrapper">
            <FaSearch className="shipments-search-icon" />
            <input
              type="text"
              placeholder="Search by AWB, Order, Merchant, Customer, Phone, or Courier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shipments-search-input"
            />
            {searchTerm && (
              <span
                className="shipments-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", flex: "1 1 auto" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shipments-filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="shipments-error">
            <span>❌ {error}</span>
            <button
              onClick={fetchShipments}
              className="shipments-error-btn"
            >
              Retry
            </button>
          </div>
        )}

        {/* Shipment List */}
        <div className="shipments-list">
          <div className="shipments-list-header">
            <h2 className="shipments-list-title">
              Shipment List
              <span className="shipments-list-count">
                ({filteredShipments.length} shipments)
              </span>
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="shipments-filter-toggle"
              >
                <FaFilter size={12} /> Filters
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="shipments-loading">
              Loading shipments...
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="shipments-table-wrapper">
                <table className="shipments-table">
                  <colgroup>
                    <col className="col-awb" />
                    <col className="col-order" />
                    <col className="col-merchant" />
                    <col className="col-customer" />
                    <col className="col-courier" />
                    <col className="col-status" />
                    <col className="col-scan" />
                    <col className="col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="shipments-th">AWB</th>
                      <th className="shipments-th">Order</th>
                      <th className="shipments-th">Merchant</th>
                      <th className="shipments-th">Customer</th>
                      <th className="shipments-th">Courier</th>
                      <th className="shipments-th">Status</th>
                      <th className="shipments-th">Last Scan</th>
                      <th className="shipments-th" style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment, index) => {
                        const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "N/A";
                        const lastTrackingUpdate = shipment.lastTrackingUpdate || shipment.tracking?.updatedAt || shipment.updatedAt;
                        
                        return (
                          <tr key={shipment._id} className="shipments-row">
                            <td className="shipments-td shipments-awb">
                              {shipment.awb}
                            </td>
                            <td className="shipments-td">
                              {shipment.orderId?.orderNumber || "N/A"}
                            </td>
                            <td className="shipments-td">
                              <div className="shipments-merchant">
                                <FaBuilding className="shipments-merchant-icon" />
                                <span>{merchantName}</span>
                              </div>
                            </td>
                            <td className="shipments-td">
                              <div className="shipments-customer">
                                <span className="shipments-customer-name">
                                  <FaUser />
                                  {shipment.orderId?.customerName || "N/A"}
                                </span>
                                <span className="shipments-customer-phone">
                                  <FaPhone />
                                  {shipment.orderId?.customerPhone || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="shipments-td">
                              {shipment.courier}
                            </td>
                            <td className="shipments-td">
                              <div>
                                <span className="shipments-status-badge" style={{
                                  background: getStatusColor(shipment.status),
                                }}>
                                  {shipment.status?.replace(/_/g, " ")}
                                </span>
                                <div className="shipments-status-scan">
                                  {lastTrackingUpdate ? 
                                    new Date(lastTrackingUpdate).toLocaleString('en-IN', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    "No scan"
                                  }
                                </div>
                              </div>
                            </td>
                            <td className="shipments-td">
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span className="shipments-last-scan-date">
                                  {lastTrackingUpdate ? 
                                    new Date(lastTrackingUpdate).toLocaleDateString('en-IN', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric' 
                                    }) : 
                                    "---"
                                  }
                                </span>
                                <span className="shipments-last-scan-time">
                                  <FaClockIcon size={9} />
                                  {lastTrackingUpdate ? formatLastUpdated(lastTrackingUpdate) : "---"}
                                </span>
                              </div>
                            </td>
                            <td className="shipments-td" style={{ textAlign: "center" }}>
                              <button
                                onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                                className="shipments-view-btn"
                              >
                                <FaEye size={12} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="shipments-no-data">
                          {searchTerm || statusFilter !== "ALL" 
                            ? "No shipments match your filters" 
                            : "No shipments found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="shipments-mobile-cards">
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => {
                    const isExpanded = expandedRows[shipment._id] || false;
                    const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "N/A";
                    const lastTrackingUpdate = shipment.lastTrackingUpdate || shipment.tracking?.updatedAt || shipment.updatedAt;
                    
                    return (
                      <div key={shipment._id} className="shipments-mobile-card">
                        <div className="shipments-mobile-card-header">
                          <div className="shipments-mobile-card-body">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong className="shipments-mobile-awb">{shipment.awb}</strong>
                              <div>
                                <span className="shipments-status-badge" style={{
                                  background: getStatusColor(shipment.status),
                                }}>
                                  {shipment.status?.replace(/_/g, " ")}
                                </span>
                                <div className="shipments-status-scan">
                                  {lastTrackingUpdate ? 
                                    new Date(lastTrackingUpdate).toLocaleString('en-IN', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    "No scan"
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="shipments-mobile-order">
                              Order: {shipment.orderId?.orderNumber || "N/A"}
                            </div>
                            <div className="shipments-mobile-info-row">
                              <FaBuilding />
                              <span>{merchantName}</span>
                            </div>
                            <div className="shipments-mobile-info-row">
                              <FaUser />
                              <span>{shipment.orderId?.customerName || "N/A"}</span>
                            </div>
                            <div className="shipments-mobile-info-row-phone">
                              <FaPhone />
                              <span>{shipment.orderId?.customerPhone || "N/A"}</span>
                            </div>
                            <div className="shipments-mobile-time">
                              <FaClockIcon size={10} />
                              <span>{lastTrackingUpdate ? formatLastUpdated(lastTrackingUpdate) : "---"}</span>
                            </div>
                            <div className="shipments-mobile-courier">
                              Courier: {shipment.courier}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRow(shipment._id)}
                            className="shipments-mobile-expand-btn"
                          >
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div className="shipments-mobile-expanded">
                            <button
                              onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                              className="shipments-mobile-view-btn"
                            >
                              <FaEye /> View Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="shipments-no-data">
                    {searchTerm || statusFilter !== "ALL" 
                      ? "No shipments match your filters" 
                      : "No shipments found"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shipments;