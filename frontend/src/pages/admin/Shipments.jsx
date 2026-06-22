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
} from "react-icons/fa";

import "./Admin.css";

const Shipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchShipments();
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

  const updateShipmentStatus = async (id, status) => {
    const confirmUpdate = window.confirm(
      `Update shipment status to ${status}?`
    );

    if (!confirmUpdate) return;

    try {
      setUpdatingId(id);
      await api.patch(`/shipments/${id}/status`, { status });
      await fetchShipments();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update shipment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#f59e0b",
      READY_FOR_PICKUP: "#06b6d4",
      IN_TRANSIT: "#3b82f6",
      OUT_FOR_DELIVERY: "#8b5cf6",
      DELIVERED: "#10b981",
      RTO: "#ef4444",
      NDR: "#f97316",
      CANCELLED: "#6b7280",
      SHIPPED: "#3b82f6",
      DTD: "#8b5cf6",
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
    const searchMatch = 
      shipment.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.courier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.customerPhone?.includes(searchTerm);

    const statusMatch = statusFilter === "ALL" || shipment.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const transitCount = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY" || s.status === "SHIPPED").length;
  const failedCount = shipments.filter((s) => s.status === "RTO" || s.status === "NDR").length;

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "READY_FOR_PICKUP", label: "Ready" },
    { value: "SHIPPED", label: "Shipped" },
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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Total Shipments</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{shipments.length}</h3>
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
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Delivered</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{deliveredCount}</h3>
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
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>In Transit</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{transitCount}</h3>
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
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Failed/RTO</p>
                <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{failedCount}</h3>
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
              placeholder="Search by AWB, Order, Customer, or Phone..."
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
                  minWidth: "900px",
                }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>AWB</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order No</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Courier</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Last Updated</th>
                      <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment, index) => {
                        const isDelivered = shipment.status === "DELIVERED";
                        
                        return (
                          <tr key={shipment._id} style={{ 
                            borderBottom: index === filteredShipments.length - 1 ? "none" : "1px solid #f1f5f9",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500", color: "#0f172a" }}>
                              {shipment.awb}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: "#0f172a" }}>
                              {shipment.orderId?.orderNumber || "N/A"}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "500", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <FaUser size={12} style={{ color: "#94a3b8" }} />
                                  {shipment.orderId?.customerName || "N/A"}
                                </span>
                                <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <FaPhone size={10} />
                                  {shipment.orderId?.customerPhone || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: "#0f172a" }}>
                              {shipment.courier}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                background: getStatusColor(shipment.status),
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: "600",
                                letterSpacing: "0.3px",
                              }}>
                                {shipment.status?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#0f172a" }}>
                                  {shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "---"}
                                </span>
                                <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <FaClockIcon size={10} />
                                  {shipment.updatedAt ? formatLastUpdated(shipment.updatedAt) : "---"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "8px 16px" }}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                                <button
                                  onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                                  style={{
                                    padding: "4px 8px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.15s",
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                                >
                                  <FaEye size={11} /> View
                                </button>
                                
                                {/* IN_TRANSIT Button */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "IN_TRANSIT")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "4px 8px",
                                    background: isDelivered ? "#94a3b8" : "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "11px",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "Transit"}
                                </button>
                                
                                {/* OUT_FOR_DELIVERY Button */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "OUT_FOR_DELIVERY")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "4px 8px",
                                    background: isDelivered ? "#94a3b8" : "#8b5cf6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "11px",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "OFD"}
                                </button>
                                
                                {/* DELIVERED Button */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "DELIVERED")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "4px 8px",
                                    background: isDelivered ? "#94a3b8" : "#22c55e",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "11px",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "Delivered"}
                                </button>
                                
                                {/* NDR Button */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "NDR")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "4px 8px",
                                    background: isDelivered ? "#94a3b8" : "#f97316",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "11px",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "NDR"}
                                </button>
                                
                                {/* RTO Button */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "RTO")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "4px 8px",
                                    background: isDelivered ? "#94a3b8" : "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "11px",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "RTO"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
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
                    const isDelivered = shipment.status === "DELIVERED";
                    const isExpanded = expandedRows[shipment._id] || false;
                    
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
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                              Order: {shipment.orderId?.orderNumber || "N/A"}
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
                              <span>{shipment.updatedAt ? formatLastUpdated(shipment.updatedAt) : "---"}</span>
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
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => navigate(`/admin/shipments/${shipment._id}`)}
                                  style={{
                                    padding: "8px 12px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  <FaEye /> View
                                </button>
                                
                                {/* IN_TRANSIT Button - Mobile */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "IN_TRANSIT")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "8px 12px",
                                    background: isDelivered ? "#94a3b8" : "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "Transit"}
                                </button>
                              </div>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {/* OUT_FOR_DELIVERY Button - Mobile */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "OUT_FOR_DELIVERY")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "8px 12px",
                                    background: isDelivered ? "#94a3b8" : "#8b5cf6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "OFD"}
                                </button>
                                
                                {/* DELIVERED Button - Mobile */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "DELIVERED")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "8px 12px",
                                    background: isDelivered ? "#94a3b8" : "#22c55e",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "Delivered"}
                                </button>
                              </div>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {/* NDR Button - Mobile */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "NDR")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "8px 12px",
                                    background: isDelivered ? "#94a3b8" : "#f97316",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "NDR"}
                                </button>
                                
                                {/* RTO Button - Mobile */}
                                <button
                                  onClick={() => updateShipmentStatus(shipment._id, "RTO")}
                                  disabled={isDelivered || updatingId === shipment._id}
                                  style={{
                                    padding: "8px 12px",
                                    background: isDelivered ? "#94a3b8" : "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: (isDelivered || updatingId === shipment._id) ? "not-allowed" : "pointer",
                                    opacity: (isDelivered || updatingId === shipment._id) ? 0.5 : 1,
                                    fontSize: "13px",
                                    flex: "1",
                                    minWidth: "70px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {updatingId === shipment._id ? "..." : "RTO"}
                                </button>
                              </div>
                            </div>
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
            font-size: 20px !important;
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