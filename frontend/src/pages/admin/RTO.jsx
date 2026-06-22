import { useEffect, useState, useCallback } from "react";
import { 
  FaUndo, 
  FaTruck, 
  FaExclamationTriangle,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaSync,
  FaChevronDown,
  FaUser,
  FaBox,
  FaPhone,
  FaCalendarAlt,
  FaSearch,
  FaSpinner
} from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

const RTO = () => {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Colors
  const colors = {
    primary: "#0f172a",
    accent: "#6366f1",
    success: "#10b981",
    danger: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
    gray: "#64748b",
    grayLight: "#94a3b8",
    grayLighter: "#cbd5e1",
    bg: "#f0f4f8",
    white: "#ffffff",
    orange: "#f97316",
  };

  // Status Styles
  const statusStyles = {
    RTO: {
      background: "#fee2e2",
      color: "#991b1b",
      icon: "↩️",
    },
    RETURN_IN_TRANSIT: {
      background: "#ffedd5",
      color: "#9a3412",
      icon: "🚚",
    },
    RECEIVED: {
      background: "#dbeafe",
      color: "#1e40af",
      icon: "📦",
    },
    CLOSED: {
      background: "#d1fae5",
      color: "#065f46",
      icon: "✅",
    },
  };

  // Fetch RTO shipments
  const fetchRTO = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await api.get("/admin/shipments");

      const rtoShipments = (res.data.shipments || []).filter(
        (s) => s.status === "RTO" || s.status === "RETURN_IN_TRANSIT" || s.status === "RECEIVED" || s.status === "CLOSED"
      );

      setShipments(rtoShipments);
    } catch (error) {
      console.error("Error fetching RTO:", error);
      setError("Failed to load RTO shipments. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRTO();
    const interval = setInterval(() => fetchRTO(false), 30000);
    return () => clearInterval(interval);
  }, [fetchRTO]);

  const uniqueCouriers = [...new Set(shipments.map(s => s.courier).filter(Boolean))];

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = s.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.orderId?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.orderId?.customerPhone?.includes(searchTerm) ||
                          s.orderId?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesCourier = courierFilter === "ALL" || s.courier === courierFilter;
    return matchesSearch && matchesStatus && matchesCourier;
  });

  // Statistics
  const totalRTO = shipments.filter((s) => s.status === "RTO").length;
  const inTransitCount = shipments.filter((s) => s.status === "RETURN_IN_TRANSIT").length;
  const receivedCount = shipments.filter((s) => s.status === "RECEIVED").length;
  const closedCount = shipments.filter((s) => s.status === "CLOSED").length;

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setShowModal(true);
  };

  const handleReceived = (shipment) => {
    console.log("Mark as received for:", shipment.awb);
  };

  const handleClose = (shipment) => {
    console.log("Close case for:", shipment.awb);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipment(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: "280px", padding: "20px 30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <FaSpinner size={40} color={colors.danger} style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h3 style={{ color: colors.primary, margin: "0 0 8px 0", fontSize: "20px" }}>Loading RTO Cases</h3>
            <p style={{ color: colors.gray, margin: 0, fontSize: "14px" }}>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
      <AdminSidebar />

      <div style={{ flex: 1, marginLeft: "280px", padding: "24px 32px" }}>
        {/* Header */}
        <div style={{ 
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px 28px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: colors.primary, margin: "0 0 4px 0" }}>
              RTO Management
            </h1>
            <p style={{ color: colors.grayLight, margin: 0, fontSize: "14px" }}>
              Monitor and manage Return To Origin shipments
            </p>
          </div>
          <button
            onClick={() => fetchRTO(true)}
            disabled={isRefreshing}
            style={{
              padding: "10px 20px",
              background: colors.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isRefreshing ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            <FaSync style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#991b1b", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            borderLeft: "4px solid #ef4444",
          }}>
            <FaExclamationTriangle style={{ marginRight: "8px" }} />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", color: colors.gray, fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total RTO
                </p>
                <h2 style={{ margin: 0, color: "#991b1b", fontSize: "28px", fontWeight: "700" }}>{totalRTO}</h2>
              </div>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                ↩️
              </div>
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", color: colors.gray, fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  In Transit
                </p>
                <h2 style={{ margin: 0, color: "#9a3412", fontSize: "28px", fontWeight: "700" }}>{inTransitCount}</h2>
              </div>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "#ffedd5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                🚚
              </div>
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", color: colors.gray, fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Received
                </p>
                <h2 style={{ margin: 0, color: "#1e40af", fontSize: "28px", fontWeight: "700" }}>{receivedCount}</h2>
              </div>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                📦
              </div>
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", color: colors.gray, fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Closed
                </p>
                <h2 style={{ margin: 0, color: "#065f46", fontSize: "28px", fontWeight: "700" }}>{closedCount}</h2>
              </div>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}>
          <div style={{ 
            flex: 1, 
            minWidth: "200px", 
            display: "flex", 
            alignItems: "center", 
            gap: "12px",
            background: "#f8fafc",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}>
            <FaSearch color={colors.grayLight} size={16} />
            <input
              type="text"
              placeholder="Search AWB, Order, Customer or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "14px",
                padding: "10px 0",
                background: "transparent",
                color: colors.primary,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.grayLight,
                  fontSize: "16px",
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "10px 36px 10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "#f8fafc",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "140px",
                  appearance: "none",
                  color: colors.primary,
                }}
              >
                <option value="ALL">All Status</option>
                <option value="RTO">RTO</option>
                <option value="RETURN_IN_TRANSIT">In Transit</option>
                <option value="RECEIVED">Received</option>
                <option value="CLOSED">Closed</option>
              </select>
              <FaChevronDown size={12} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: colors.grayLight, pointerEvents: "none" }} />
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                style={{
                  padding: "10px 36px 10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "#f8fafc",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "140px",
                  appearance: "none",
                  color: colors.primary,
                }}
              >
                <option value="ALL">All Couriers</option>
                {uniqueCouriers.map((courier) => (
                  <option key={courier} value={courier}>{courier}</option>
                ))}
              </select>
              <FaChevronDown size={12} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: colors.grayLight, pointerEvents: "none" }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AWB
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Order No
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Customer
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Courier
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Reason
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Status
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "center", color: colors.gray, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((s) => {
                    const status = s.status || "RTO";
                    const statusInfo = statusStyles[status] || statusStyles.RTO;
                    
                    return (
                      <tr
                        key={s._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 20px", color: colors.primary, fontWeight: "600", fontSize: "13px" }}>
                          <span style={{ 
                            background: "#f1f5f9", 
                            padding: "4px 10px", 
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                          }}>
                            {s.awb || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", color: colors.primary, fontSize: "13px", fontWeight: "500" }}>
                          {s.orderId?.orderNumber || "N/A"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <div>
                            <div style={{ color: colors.primary, fontSize: "13px", fontWeight: "500" }}>
                              {s.orderId?.customerName || "N/A"}
                            </div>
                            <div style={{ fontSize: "12px", color: colors.grayLight }}>
                              {s.orderId?.customerPhone || "No phone"}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ 
                            background: "#f1f5f9", 
                            padding: "4px 10px", 
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: colors.gray,
                          }}>
                            {s.courier || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", color: colors.gray, fontSize: "13px" }}>
                          {s.reason || "Return to Origin"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span
                            style={{
                              padding: "4px 14px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: statusInfo.background,
                              color: statusInfo.color,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {statusInfo.icon} 
                            {status === "RETURN_IN_TRANSIT" ? "In Transit" : 
                             status === "RECEIVED" ? "Received" : 
                             status === "CLOSED" ? "Closed" : "RTO"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleViewDetails(s)}
                              style={{
                                padding: "5px 12px",
                                background: "#f1f5f9",
                                color: colors.gray,
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            >
                              <FaEye size={11} /> View
                            </button>
                            {status !== "RECEIVED" && status !== "CLOSED" && (
                              <button
                                onClick={() => handleReceived(s)}
                                style={{
                                  padding: "5px 12px",
                                  background: colors.info,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = colors.info)}
                              >
                                <FaBox size={10} /> Received
                              </button>
                            )}
                            {status !== "CLOSED" && (
                              <button
                                onClick={() => handleClose(s)}
                                style={{
                                  padding: "5px 12px",
                                  background: colors.success,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = colors.success)}
                              >
                                <FaCheckCircle size={10} /> Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: 0 }}>
                      <div style={{
                        padding: "60px 20px",
                        textAlign: "center",
                      }}>
                        <div style={{ 
                          width: "64px", 
                          height: "64px", 
                          borderRadius: "50%", 
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px"
                        }}>
                          <FaUndo size={32} color="#cbd5e1" />
                        </div>
                        <h3 style={{ margin: "0 0 4px 0", color: "#334155", fontSize: "18px", fontWeight: "600" }}>
                          No RTO Shipments Found
                        </h3>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
                          {searchTerm || statusFilter !== "ALL" || courierFilter !== "ALL" 
                            ? "Try adjusting your filters to see more results." 
                            : "No return-to-origin cases available at the moment."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: "16px", 
          padding: "12px 20px", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: colors.grayLight,
          fontSize: "13px",
        }}>
          <span>
            Showing <strong style={{ color: colors.primary }}>{filteredShipments.length}</strong> of <strong style={{ color: colors.primary }}>{shipments.length}</strong> RTO cases
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Total: {shipments.length}</span>
            <span>•</span>
            <span>In Transit: {inTransitCount}</span>
            <span>•</span>
            <span>Received: {receivedCount}</span>
            <span>•</span>
            <span>Closed: {closedCount}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedShipment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#f1f5f9",
                border: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                fontSize: "16px",
                cursor: "pointer",
                color: colors.gray,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            >
              <FaTimes />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                ↩️
              </div>
              <div>
                <h2 style={{ margin: 0, color: colors.primary, fontSize: "20px", fontWeight: "700" }}>
                  RTO Details
                </h2>
                <p style={{ margin: "2px 0 0 0", color: colors.grayLight, fontSize: "13px" }}>
                  AWB: <strong style={{ color: colors.primary }}>{selectedShipment.awb || "N/A"}</strong>
                </p>
              </div>
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "12px",
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Order Number
                </p>
                <p style={{ margin: 0, color: colors.primary, fontWeight: "500", fontSize: "14px" }}>
                  {selectedShipment.orderId?.orderNumber || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Status
                </p>
                <span style={{
                  padding: "2px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: statusStyles[selectedShipment.status]?.background || "#f1f5f9",
                  color: statusStyles[selectedShipment.status]?.color || "#475569",
                  display: "inline-block",
                }}>
                  {statusStyles[selectedShipment.status]?.icon || "📌"} 
                  {selectedShipment.status === "RETURN_IN_TRANSIT" ? "In Transit" : 
                   selectedShipment.status === "RECEIVED" ? "Received" : 
                   selectedShipment.status === "CLOSED" ? "Closed" : 
                   selectedShipment.status || "RTO"}
                </span>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Customer Name
                </p>
                <p style={{ margin: 0, color: colors.primary, fontWeight: "500", fontSize: "14px" }}>
                  <FaUser size={12} style={{ display: "inline", marginRight: "4px", color: colors.grayLight }} />
                  {selectedShipment.orderId?.customerName || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Phone
                </p>
                <p style={{ margin: 0, color: colors.primary, fontWeight: "500", fontSize: "14px" }}>
                  <FaPhone size={12} style={{ display: "inline", marginRight: "4px", color: colors.grayLight }} />
                  {selectedShipment.orderId?.customerPhone || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Courier
                </p>
                <p style={{ margin: 0, color: colors.primary, fontWeight: "500", fontSize: "14px" }}>
                  <FaTruck size={12} style={{ display: "inline", marginRight: "4px", color: colors.grayLight }} />
                  {selectedShipment.courier || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", color: colors.grayLight, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Created Date
                </p>
                <p style={{ margin: 0, color: colors.primary, fontWeight: "500", fontSize: "14px" }}>
                  <FaCalendarAlt size={12} style={{ display: "inline", marginRight: "4px", color: colors.grayLight }} />
                  {selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div style={{ 
              padding: "12px 16px",
              background: "#ffedd5",
              borderRadius: "8px",
              borderLeft: "4px solid #f97316",
              marginBottom: "16px",
            }}>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px" }}>
                <strong>Reason:</strong> {selectedShipment.reason || "Return to Origin"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={closeModal}
                style={{
                  padding: "8px 20px",
                  background: "#f1f5f9",
                  color: colors.gray,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              >
                Close
              </button>
              {selectedShipment.status !== "RECEIVED" && selectedShipment.status !== "CLOSED" && (
                <button
                  onClick={() => {
                    handleReceived(selectedShipment);
                    closeModal();
                  }}
                  style={{
                    padding: "8px 20px",
                    background: colors.info,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = colors.info)}
                >
                  <FaBox size={14} /> Mark Received
                </button>
              )}
              {selectedShipment.status !== "CLOSED" && (
                <button
                  onClick={() => {
                    handleClose(selectedShipment);
                    closeModal();
                  }}
                  style={{
                    padding: "8px 20px",
                    background: colors.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = colors.success)}
                >
                  <FaCheckCircle size={14} /> Close Case
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RTO;