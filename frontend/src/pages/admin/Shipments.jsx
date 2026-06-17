import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaSync,
} from "react-icons/fa";

import "./Admin.css";

const Shipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/shipments");
      console.log("SHIPMENTS DATA =>", response.data);
      setShipments(response.data.shipments || []);
    } catch (error) {
      console.log("SHIPMENTS ERROR =>", error);
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
      // ✅ FIX 1: Removed /admin/ from the URL
      await api.patch(`/shipments/${id}/status`, { status });
      await fetchShipments();
    } catch (error) {
      console.log("UPDATE ERROR =>", error);
      alert(error.response?.data?.message || "Failed to update shipment status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Status color mapping for badges
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
    };
    return colors[status] || "#6b7280";
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.courier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const transitCount = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length;
  const failedCount = shipments.filter((s) => s.status === "RTO" || s.status === "NDR").length;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <AdminTopbar />

        <div className="page-header">
          <div>
            <h1 className="page-title">🚚 Shipments Management</h1>
            <p className="page-subtitle">Monitor and manage all shipments</p>
          </div>
          <button
            onClick={fetchShipments}
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <FaSync /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="courier-stats">
          <div className="courier-stat-card">
            <FaTruck className="stat-icon blue" />
            <h4>Total</h4>
            <h2>{shipments.length}</h2>
          </div>
          <div className="courier-stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h4>Delivered</h4>
            <h2>{deliveredCount}</h2>
          </div>
          <div className="courier-stat-card">
            <FaClock className="stat-icon orange" />
            <h4>Transit</h4>
            <h2>{transitCount}</h2>
          </div>
          <div className="courier-stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h4>Failed/RTO</h4>
            <h2>{failedCount}</h2>
          </div>
        </div>

        <div className="search-box" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search AWB, Courier, or Order Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <span
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#94a3b8",
              }}
              onClick={() => setSearchTerm("")}
            >
              ✕
            </span>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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

        <div className="admin-table-section">
          <h2>Shipment List</h2>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              Loading shipments...
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>AWB</th>
                  <th>Order No</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment._id}>
                      <td>
                        <strong>{shipment.awb}</strong>
                      </td>
                      <td>{shipment.orderId?.orderNumber || "N/A"}</td>
                      <td>{shipment.courier}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            background: getStatusColor(shipment.status),
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {shipment.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        {shipment.pickupDate
                          ? new Date(shipment.pickupDate).toLocaleDateString()
                          : "---"}
                      </td>
                      <td>
                        {shipment.deliveryDate
                          ? new Date(shipment.deliveryDate).toLocaleDateString()
                          : "---"}
                      </td>
                      <td className="action-buttons">
                        {/* ✅ FIX 2: Added console.log for debugging */}
                        <button
                          className="view-btn"
                          onClick={() => {
                            console.log("Shipment ID =>", shipment._id);
                            navigate(`/admin/shipments/${shipment._id}`);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                          }}
                        >
                          <FaEye /> View
                        </button>
                        <button
                          onClick={() =>
                            updateShipmentStatus(shipment._id, "IN_TRANSIT")
                          }
                          disabled={updatingId === shipment._id}
                          style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updatingId === shipment._id ? "not-allowed" : "pointer",
                            opacity: updatingId === shipment._id ? 0.6 : 1,
                            fontSize: "12px",
                          }}
                        >
                          {updatingId === shipment._id ? "..." : "Transit"}
                        </button>
                        <button
                          onClick={() =>
                            updateShipmentStatus(shipment._id, "OUT_FOR_DELIVERY")
                          }
                          disabled={updatingId === shipment._id}
                          style={{
                            padding: "6px 12px",
                            background: "#8b5cf6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updatingId === shipment._id ? "not-allowed" : "pointer",
                            opacity: updatingId === shipment._id ? 0.6 : 1,
                            fontSize: "12px",
                          }}
                        >
                          {updatingId === shipment._id ? "..." : "OFD"}
                        </button>
                        <button
                          onClick={() =>
                            updateShipmentStatus(shipment._id, "DELIVERED")
                          }
                          disabled={updatingId === shipment._id}
                          style={{
                            padding: "6px 12px",
                            background: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updatingId === shipment._id ? "not-allowed" : "pointer",
                            opacity: updatingId === shipment._id ? 0.6 : 1,
                            fontSize: "12px",
                          }}
                        >
                          {updatingId === shipment._id ? "..." : "Delivered"}
                        </button>
                        <button
                          onClick={() =>
                            updateShipmentStatus(shipment._id, "NDR")
                          }
                          disabled={updatingId === shipment._id}
                          style={{
                            padding: "6px 12px",
                            background: "#f97316",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updatingId === shipment._id ? "not-allowed" : "pointer",
                            opacity: updatingId === shipment._id ? 0.6 : 1,
                            fontSize: "12px",
                          }}
                        >
                          {updatingId === shipment._id ? "..." : "NDR"}
                        </button>
                        <button
                          onClick={() =>
                            updateShipmentStatus(shipment._id, "RTO")
                          }
                          disabled={updatingId === shipment._id}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updatingId === shipment._id ? "not-allowed" : "pointer",
                            opacity: updatingId === shipment._id ? 0.6 : 1,
                            fontSize: "12px",
                          }}
                        >
                          {updatingId === shipment._id ? "..." : "RTO"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                      {searchTerm ? "No shipments match your search" : "No shipments found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shipments;