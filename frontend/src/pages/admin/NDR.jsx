import { useEffect, useState, useCallback } from "react";
import { FaExclamationTriangle, FaTruck, FaUndo } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const NDR = () => {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    RTO: {
      background: "#fee2e2",
      color: "#991b1b",
      icon: "↩️",
    },
    OUT_FOR_DELIVERY: {
      background: "#dbeafe",
      color: "#1e40af",
      icon: "🚚",
    },
  };

  // Fetch NDR shipments
  const fetchNDR = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/shipments");

      const ndrShipments = (res.data.shipments || []).filter(
        (s) => s.status === "OUT_FOR_DELIVERY" || s.status === "RTO"
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

    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchNDR, 30000);
    return () => clearInterval(interval);
  }, [fetchNDR]);

  // Filter shipments based on search
  const filteredShipments = shipments.filter((s) =>
    s.awb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalNDR = shipments.length;
  const ofdCount = shipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
  const rtoCount = shipments.filter((s) => s.status === "RTO").length;

  // Handlers
  const handleViewDetails = (shipment) => {
    console.log("View details for:", shipment.awb);
    // Navigate to shipment details or open modal
  };

  const handleContactCustomer = (shipment) => {
    console.log("Contact customer for:", shipment.awb);
    // Open contact modal or dialer
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: "280px", padding: "20px 30px" }}>
          <AdminTopbar />
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
        <AdminTopbar />

        {/* Header with Refresh Button */}
        <div style={{ marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
              📞 NDR Management
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Manage failed delivery attempts and customer follow-ups
            </p>
          </div>
          <button
            onClick={fetchNDR}
            style={{
              padding: "10px 20px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔄 Refresh
          </button>
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

        {/* Stats Cards with Icons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaExclamationTriangle size={28} color="#f59e0b" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Total NDR</h4>
                <h2 style={{ margin: 0, color: "#0f172a" }}>{totalNDR}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaTruck size={28} color="#3b82f6" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Out For Delivery</h4>
                <h2 style={{ margin: 0, color: "#2563eb" }}>{ofdCount}</h2>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUndo size={28} color="#ef4444" />
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>RTO Cases</h4>
                <h2 style={{ margin: 0, color: "#ef4444" }}>{rtoCount}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by AWB number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "14px",
              padding: "4px 0",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* White Table Container */}
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
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  AWB
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Courier
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "center",
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((s) => {
                  const status = s.status;
                  const statusInfo = statusStyles[status] || statusStyles.OUT_FOR_DELIVERY;
                  
                  return (
                    <tr
                      key={s._id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => handleViewDetails(s)}
                    >
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "#0f172a",
                          background: "#fff",
                          fontWeight: "500",
                        }}
                      >
                        {s.awb || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "#0f172a",
                          background: "#fff",
                        }}
                      >
                        {s.courier || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          background: "#fff",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: statusInfo.background,
                            color: statusInfo.color,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {statusInfo.icon} {status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          background: "#fff",
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactCustomer(s);
                          }}
                          style={{
                            padding: "6px 14px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
                        >
                          📞 Contact
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: 0 }}>
                    {/* Professional Empty State */}
                    <div
                      style={{
                        padding: "60px 20px",
                        textAlign: "center",
                        background: "#fff",
                      }}
                    >
                      <FaExclamationTriangle
                        size={48}
                        color="#cbd5e1"
                      />
                      <h3
                        style={{
                          marginTop: "15px",
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
    </div>
  );
};

export default NDR;