import { useEffect, useState, useCallback } from "react";
import { 
  FaExclamationTriangle, 
  FaTruck, 
  FaUndo, 
  FaClock,
  FaEye,
  FaPhone,
  FaRedo,
  FaArrowLeft
} from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

const NDR = () => {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Styles
  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
    cursor: "default",
  };

  const statusStyles = {
    NDR: {
      background: "#fef3c7",
      color: "#92400e",
      icon: "⚠️",
    },
    REATTEMPT: {
      background: "#dbeafe",
      color: "#1e40af",
      icon: "🔄",
    },
    RESOLVED: {
      background: "#d1fae5",
      color: "#065f46",
      icon: "✅",
    },
    RTO: {
      background: "#fee2e2",
      color: "#991b1b",
      icon: "↩️",
    },
    PENDING: {
      background: "#f1f5f9",
      color: "#475569",
      icon: "⏳",
    },
  };

  // Fetch NDR shipments
  const fetchNDR = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/shipments");

      const ndrShipments = (res.data.shipments || []).filter(
        (s) => s.status === "NDR" || s.status === "REATTEMPT" || s.status === "RESOLVED" || s.status === "RTO"
      );

      setShipments(ndrShipments);
    } catch (error) {
      console.error("Error fetching NDR:", error);
      setError("Failed to load NDR shipments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNDR();

    const interval = setInterval(fetchNDR, 30000);
    return () => clearInterval(interval);
  }, [fetchNDR]);

  // Get unique couriers for filter
  const uniqueCouriers = [...new Set(shipments.map(s => s.courier).filter(Boolean))];

  // Filter shipments based on search, status, and courier
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = s.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.orderId?.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesCourier = courierFilter === "ALL" || s.courier === courierFilter;
    return matchesSearch && matchesStatus && matchesCourier;
  });

  // Statistics
  const totalNDR = shipments.length;
  const pendingCount = shipments.filter((s) => s.status === "NDR" || s.status === "PENDING").length;
  const reattemptCount = shipments.filter((s) => s.status === "REATTEMPT").length;
  const rtoCount = shipments.filter((s) => s.status === "RTO").length;

  // Handlers
  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setShowModal(true);
  };

  const handleContactCustomer = (shipment) => {
    console.log("Contact customer for:", shipment.awb);
    // Open contact modal or dialer
  };

  const handleReattempt = (shipment) => {
    console.log("Reattempt delivery for:", shipment.awb);
    // API call to reattempt
  };

  const handleMarkRTO = (shipment) => {
    console.log("Mark RTO for:", shipment.awb);
    // API call to mark RTO
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipment(null);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: "280px", padding: "20px 30px" }}>
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <p style={{ color: "#64748b" }}>Loading NDR shipments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <AdminSidebar />

      <div style={{ flex: 1, marginLeft: "280px", padding: "20px 30px" }}>
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
            📞 NDR Management
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Manage failed delivery attempts and customer follow-ups
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#991b1b", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "20px" 
          }}>
            ❌ {error}
          </div>
        )}

        {/* Stats Cards - 4 Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaExclamationTriangle size={28} color="#f59e0b" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>Total NDR</h4>
                <h2 style={{ margin: 0, color: "#0f172a" }}>{totalNDR}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaClock size={28} color="#f59e0b" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>Pending NDR</h4>
                <h2 style={{ margin: 0, color: "#d97706" }}>{pendingCount}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaRedo size={28} color="#3b82f6" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>Reattempt Cases</h4>
                <h2 style={{ margin: 0, color: "#2563eb" }}>{reattemptCount}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUndo size={28} color="#ef4444" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>RTO Cases</h4>
                <h2 style={{ margin: 0, color: "#ef4444" }}>{rtoCount}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search Row with Filters */}
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🔍</span>
            <input
              type="text"
              placeholder="Search AWB or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "14px",
                padding: "8px 0",
                background: "transparent",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "13px",
              background: "#f8fafc",
              cursor: "pointer",
              outline: "none",
              minWidth: "130px",
            }}
          >
            <option value="ALL">All Status</option>
            <option value="NDR">NDR</option>
            <option value="REATTEMPT">Reattempt</option>
            <option value="RESOLVED">Resolved</option>
            <option value="RTO">RTO</option>
            <option value="PENDING">Pending</option>
          </select>

          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "13px",
              background: "#f8fafc",
              cursor: "pointer",
              outline: "none",
              minWidth: "130px",
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
              padding: "8px 20px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  AWB
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Customer
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Courier
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Reason
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Status
                </th>
                <th style={{ padding: "14px 16px", textAlign: "center", color: "#475569", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((s) => {
                  const status = s.status || "PENDING";
                  const statusInfo = statusStyles[status] || statusStyles.PENDING;
                  
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
                      <td style={{ padding: "14px 16px", color: "#0f172a", fontWeight: "500", fontSize: "13px" }}>
                        {s.awb || "N/A"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#0f172a", fontSize: "13px" }}>
                        {s.orderId?.customerName || "N/A"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#0f172a", fontSize: "13px" }}>
                        {s.courier || "N/A"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                        {s.reason || "Delivery Failed"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
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
                          {statusInfo.icon} {status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleViewDetails(s)}
                            style={{
                              padding: "5px 10px",
                              background: "#f1f5f9",
                              color: "#475569",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          >
                            <FaEye size={12} /> View
                          </button>
                          <button
                            onClick={() => handleContactCustomer(s)}
                            style={{
                              padding: "5px 10px",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
                          >
                            <FaPhone size={11} /> Contact
                          </button>
                          {status !== "RESOLVED" && status !== "RTO" && (
                            <button
                              onClick={() => handleReattempt(s)}
                              style={{
                                padding: "5px 10px",
                                background: "#8b5cf6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#7c3aed")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#8b5cf6")}
                            >
                              <FaRedo size={11} /> Reattempt
                            </button>
                          )}
                          {status !== "RTO" && status !== "RESOLVED" && (
                            <button
                              onClick={() => handleMarkRTO(s)}
                              style={{
                                padding: "5px 10px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
                            >
                              <FaArrowLeft size={11} /> RTO
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <div
                      style={{
                        padding: "80px 20px",
                        textAlign: "center",
                        background: "#fff",
                      }}
                    >
                      <FaExclamationTriangle
                        size={64}
                        color="#cbd5e1"
                      />
                      <h3
                        style={{
                          marginTop: "20px",
                          color: "#334155",
                          fontSize: "20px",
                          fontWeight: "600",
                        }}
                      >
                        No NDR Cases Found
                      </h3>
                      <p
                        style={{
                          color: "#94a3b8",
                          marginTop: "8px",
                          fontSize: "14px",
                        }}
                      >
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

      {/* Modal */}
      {showModal && selectedShipment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.7)",
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
              background: "#fff",
              borderRadius: "20px",
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
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#94a3b8",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              ✕
            </button>

            <h2 style={{ margin: "0 0 24px 0", color: "#0f172a", fontSize: "24px", fontWeight: "700" }}>
              📦 Shipment Details
            </h2>

            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>AWB Number:</span>
                <span style={{ color: "#0f172a", fontWeight: "600" }}>{selectedShipment.awb || "N/A"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Order Number:</span>
                <span style={{ color: "#0f172a" }}>{selectedShipment.orderId?.orderNumber || "N/A"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Customer:</span>
                <span style={{ color: "#0f172a" }}>{selectedShipment.orderId?.customerName || "N/A"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Phone:</span>
                <span style={{ color: "#0f172a" }}>{selectedShipment.orderId?.customerPhone || "N/A"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Courier:</span>
                <span style={{ color: "#0f172a" }}>{selectedShipment.courier || "N/A"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Reason:</span>
                <span style={{ color: "#0f172a" }}>{selectedShipment.reason || "Delivery Failed"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Current Status:</span>
                <span style={{ color: "#0f172a", fontWeight: "600" }}>
                  {selectedShipment.status || "PENDING"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Created At:</span>
                <span style={{ color: "#0f172a" }}>
                  {selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "28px", display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleContactCustomer(selectedShipment);
                  closeModal();
                }}
                style={{
                  padding: "10px 24px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaPhone /> Contact Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NDR;