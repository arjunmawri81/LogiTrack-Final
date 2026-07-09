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

import "./Admin.css";

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
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ 
          background: "#fff",
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <h1 style={{ 
              fontSize: "clamp(20px, 4vw, 28px)",
              margin: 0,
              fontWeight: "600",
              color: "#0f172a",
            }}>
              🚚 Shipments
            </h1>
            <p style={{ 
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: "4px 0 0",
              color: "#64748b",
            }}>
              Monitor and manage all shipments
            </p>
          </div>
          <button
            onClick={fetchShipments}
            style={{
              padding: "8px 20px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.background = "#2563eb"}
            onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
          >
            <FaSync /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          padding: "20px 24px",
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#eff6ff", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#3b82f6",
              }}>
                <FaTruck size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Total Shipments</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{totalCount}</h3>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#fef3c7", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#f59e0b",
              }}>
                <FaClock size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Pickup Pending</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{pickupPendingCount}</h3>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#dbeafe", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#2563eb",
              }}>
                <FaTruck size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>In Transit</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{inTransitCount}</h3>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#ecfdf5", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#10b981",
              }}>
                <FaCheckCircle size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Delivered</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{deliveredCount}</h3>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#fef3c7", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#f97316",
              }}>
                <FaClockIcon size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>NDR</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{ndrCount}</h3>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "#fef2f2", 
                padding: "10px", 
                borderRadius: "10px",
                color: "#ef4444",
              }}>
                <FaTimesCircle size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>RTO</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>{rtoCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          flexWrap: "wrap",
          padding: "0 24px",
          marginBottom: "20px",
        }}>
          <div style={{ 
            position: "relative", 
            flex: "1 1 300px",
          }}>
            <FaSearch style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }} />
            <input
              type="text"
              placeholder="Search by AWB, Order, Merchant, Customer, Phone, or Courier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%",
                padding: "10px 40px 10px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                background: "#fff",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
            {searchTerm && (
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: "16px",
                }}
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
              style={{
                padding: "10px 40px 10px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                minWidth: "150px",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
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
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 20px",
            borderRadius: "10px",
            margin: "0 24px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}>
            <span>❌ {error}</span>
            <button
              onClick={fetchShipments}
              style={{
                background: "#991b1b",
                color: "#fff",
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Shipment List */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <h2 style={{
              fontSize: "clamp(16px, 3vw, 20px)",
              margin: 0,
              color: "#0f172a",
              fontWeight: "600",
            }}>
              Shipment List
              <span style={{ 
                fontSize: "14px", 
                fontWeight: "normal", 
                color: "#94a3b8",
                marginLeft: "8px",
              }}>
                ({filteredShipments.length} shipments)
              </span>
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: "6px 12px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaFilter size={12} /> Filters
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}>
              <div style={{ fontSize: "16px", color: "#64748b" }}>
                Loading shipments...
              </div>
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="desktop-table" style={{
                overflowX: "auto",
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1200px",
                  tableLayout: "fixed",
                }}>
                  <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>AWB</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Merchant</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Courier</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                      <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Last Scan</th>
                      <th style={{ padding: "14px 12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment, index) => {
                        const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "N/A";
                        const lastTrackingUpdate = shipment.lastTrackingUpdate || shipment.tracking?.updatedAt || shipment.updatedAt;
                        
                        return (
                          <tr key={shipment._id} style={{ 
                            borderBottom: index === filteredShipments.length - 1 ? "none" : "1px solid #f1f5f9",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "12px 12px", fontSize: "12px", fontWeight: "500", color: "#0f172a", wordBreak: "break-all" }}>
                              {shipment.awb}
                            </td>
                            <td style={{ padding: "12px 12px", fontSize: "12px", color: "#0f172a", wordBreak: "break-all" }}>
                              {shipment.orderId?.orderNumber || "N/A"}
                            </td>
                            <td style={{ padding: "12px 12px", fontSize: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <FaBuilding size={11} style={{ color: "#94a3b8" }} />
                                <span style={{ color: "#0f172a" }}>{merchantName}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 12px", fontSize: "12px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "500", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                                  <FaUser size={11} style={{ color: "#94a3b8" }} />
                                  {shipment.orderId?.customerName || "N/A"}
                                </span>
                                <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <FaPhone size={9} />
                                  {shipment.orderId?.customerPhone || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 12px", fontSize: "12px", color: "#0f172a" }}>
                              {shipment.courier}
                            </td>
                            <td style={{ padding: "12px 12px" }}>
                              <div>
                                <span style={{
                                  display: "inline-block",
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  background: getStatusColor(shipment.status),
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  letterSpacing: "0.3px",
                                }}>
                                  {shipment.status?.replace(/_/g, " ")}
                                </span>
                                <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "3px" }}>
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
                            <td style={{ padding: "12px 12px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f172a" }}>
                                  {lastTrackingUpdate ? 
                                    new Date(lastTrackingUpdate).toLocaleDateString('en-IN', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric' 
                                    }) : 
                                    "---"
                                  }
                                </span>
                                <span style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <FaClockIcon size={9} />
                                  {lastTrackingUpdate ? formatLastUpdated(lastTrackingUpdate) : "---"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <button
                                onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                                style={{
                                  padding: "6px 16px",
                                  background: "#3b82f6",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  transition: "all 0.15s",
                                  fontWeight: "500",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                              >
                                <FaEye size={12} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
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
              <div className="mobile-cards" style={{
                display: "none",
                gap: "12px",
                flexDirection: "column",
              }}>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => {
                    const isExpanded = expandedRows[shipment._id] || false;
                    const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "N/A";
                    const lastTrackingUpdate = shipment.lastTrackingUpdate || shipment.tracking?.updatedAt || shipment.updatedAt;
                    
                    return (
                      <div key={shipment._id} style={{
                        background: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "15px", color: "#0f172a" }}>{shipment.awb}</strong>
                              <div>
                                <span style={{
                                  display: "inline-block",
                                  padding: "2px 10px",
                                  borderRadius: "20px",
                                  background: getStatusColor(shipment.status),
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                }}>
                                  {shipment.status?.replace(/_/g, " ")}
                                </span>
                                <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>
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
                            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                              Order: {shipment.orderId?.orderNumber || "N/A"}
                            </div>
                            <div style={{ fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", color: "#0f172a" }}>
                              <FaBuilding size={12} style={{ color: "#94a3b8" }} />
                              <span>{merchantName}</span>
                            </div>
                            <div style={{ fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", color: "#0f172a" }}>
                              <FaUser size={12} style={{ color: "#94a3b8" }} />
                              <span>{shipment.orderId?.customerName || "N/A"}</span>
                            </div>
                            <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: "#0f172a" }}>
                              <FaPhone size={11} style={{ color: "#94a3b8" }} />
                              <span>{shipment.orderId?.customerPhone || "N/A"}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <FaClockIcon size={10} />
                              <span>{lastTrackingUpdate ? formatLastUpdated(lastTrackingUpdate) : "---"}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                              Courier: {shipment.courier}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRow(shipment._id)}
                            style={{
                              background: "#f1f5f9",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              color: "#64748b",
                              padding: "8px",
                              fontSize: "16px",
                              minWidth: "36px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                            <button
                              onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                fontWeight: "500",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                            >
                              <FaEye /> View Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "60px 20px",
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    color: "#94a3b8",
                  }}>
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

      {/* Responsive Styles */}
      <style>{`
        @media screen and (max-width: 1024px) {
          .desktop-table {
            overflow-x: auto !important;
          }
          .desktop-table table {
            min-width: 1100px !important;
          }
        }
        
        @media screen and (max-width: 768px) {
          .desktop-table {
            display: none !important;
          }
          .mobile-cards {
            display: flex !important;
          }
        }
        
        @media screen and (max-width: 480px) {
          .admin-content > div:first-child {
            padding: 12px 16px !important;
          }
          .admin-content > div:nth-child(2) {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding: 12px 16px !important;
          }
          .admin-content > div:nth-child(2) > div {
            padding: 16px !important;
          }
          .admin-content > div:nth-child(2) > div h3 {
            font-size: 18px !important;
          }
          .admin-content > div:nth-child(3) {
            padding: 0 16px !important;
          }
          .admin-content > div:nth-child(3) input {
            font-size: 13px !important;
            padding: 8px 32px 8px 36px !important;
          }
          .admin-content > div:nth-child(5) {
            padding: 0 16px 16px !important;
          }
          .mobile-cards > div {
            padding: 12px !important;
          }
          .admin-content > div:nth-child(3) select {
            font-size: 13px !important;
            padding: 8px 32px 8px 12px !important;
            min-width: 100px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Shipments;