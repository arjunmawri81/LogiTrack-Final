import { useEffect, useState, useCallback } from "react";
import { FaSearch, FaUndo, FaTruck, FaExclamationTriangle } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const RTO = () => {
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

  // Fetch RTO shipments
  const fetchRTO = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/shipments");

      const rtoShipments = (res.data.shipments || []).filter(
        (s) => s.status === "RTO"
      );

      setShipments(rtoShipments);
    } catch (error) {
      console.error("Error fetching RTO:", error);
      setError("Failed to load RTO shipments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRTO();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRTO, 30000);
    return () => clearInterval(interval);
  }, [fetchRTO]);

  // Filter shipments based on search
  const filteredShipments = shipments.filter(
    (s) =>
      s.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalRTO = shipments.length;
  const successRate = totalRTO > 0 ? 100 : 0;

  // Handlers
  const handleViewDetails = (shipment) => {
    console.log("View details for:", shipment.awb);
    // Navigate to shipment details or open modal
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
            <p style={{ color: "#64748b" }}>Loading RTO shipments...</p>
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
              🔄 RTO Management
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Monitor and manage Return To Origin shipments
            </p>
          </div>
          <button
            onClick={fetchRTO}
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
          {/* Card 1 - Total RTO */}
          <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Total RTO</h4>
              <h2 style={{ margin: 0, color: "#ef4444" }}>{totalRTO}</h2>
            </div>
            <FaUndo size={28} color="#ef4444" />
          </div>

          {/* Card 2 - Returned Shipments */}
          <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Returned Shipments</h4>
              <h2 style={{ margin: 0, color: "#dc2626" }}>{totalRTO}</h2>
            </div>
            <FaTruck size={28} color="#dc2626" />
          </div>

          {/* Card 3 - Success Rate */}
          <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: "#64748b" }}>Success Rate</h4>
              <h2 style={{ margin: 0, color: "#22c55e" }}>{successRate}%</h2>
            </div>
            <FaExclamationTriangle size={28} color="#22c55e" />
          </div>
        </div>

        {/* Search Box with Icon */}
        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaSearch color="#94a3b8" />
          <input
            type="text"
            placeholder="Search AWB or Courier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "14px",
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

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
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
                filteredShipments.map((s) => (
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
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        🔄 {s.status}
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
                          console.log("Process return for:", s.awb);
                        }}
                        style={{
                          padding: "6px 14px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
                      >
                        📦 Process
                      </button>
                    </td>
                  </tr>
                ))
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
                      <FaUndo
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
                        No RTO Shipments Found
                      </h3>
                      <p
                        style={{
                          color: "#94a3b8",
                          marginTop: "8px",
                          fontSize: "14px",
                        }}
                      >
                        No return-to-origin cases available at the moment.
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

export default RTO;