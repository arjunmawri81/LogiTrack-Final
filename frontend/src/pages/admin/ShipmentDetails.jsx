import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import {
  FaArrowLeft,
  FaBuilding,
  FaUser,
  FaPhone,
  FaBox,
  FaTruck,
  FaFileInvoice,
  FaTag,
  FaHistory,
  FaMoneyBillWave,
  FaPrint,
  FaDownload,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";
import "./Admin.css";

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipmentDetail();
  }, [id]);

  const fetchShipmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/shipments/${id}`);
      setShipment(response.data.shipment);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch shipment details");
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content" style={{ 
          background: "#f8fafc", 
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div style={{ fontSize: "16px", color: "#64748b" }}>
            Loading shipment details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content" style={{ 
          background: "#f8fafc", 
          minHeight: "100vh",
          padding: "40px 24px",
        }}>
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            <h3 style={{ margin: "0 0 8px" }}>Error loading shipment</h3>
            <p style={{ margin: "0 0 16px" }}>{error || "Shipment not found"}</p>
            <button
              onClick={() => navigate("/admin/shipments")}
              style={{
                padding: "8px 20px",
                background: "#991b1b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Back to Shipments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const merchantName = shipment.merchantId?.companyName || shipment.merchantId?.name || "N/A";
  const lastTrackingUpdate = shipment.lastTrackingUpdate || shipment.tracking?.updatedAt || shipment.updatedAt;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Back Button */}
          <button
            onClick={() => navigate("/admin/shipments")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
              color: "#64748b",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#94a3b8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <FaArrowLeft /> Back to Shipments
          </button>

          {/* Header */}
          <div style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
                  Shipment {shipment.awb}
                </h1>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                  Order #{shipment.orderId?.orderNumber || "N/A"}
                </p>
                <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                  <FaClock style={{ marginRight: "4px" }} size={12} />
                  Last Scan: {formatDate(lastTrackingUpdate)}
                </p>
              </div>
              <div>
                <span style={{
                  display: "inline-block",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  background: getStatusColor(shipment.status),
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                }}>
                  {shipment.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}>
            {/* Left Column */}
            <div>
              {/* Merchant Info */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaBuilding style={{ color: "#64748b" }} />
                  Merchant
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Company Name</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>{merchantName}</span>
                  </div>
                  {shipment.merchantId?.email && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Email</span>
                      <span style={{ fontWeight: "500", color: "#0f172a" }}>
                        <FaEnvelope style={{ marginRight: "4px" }} size={12} />
                        {shipment.merchantId.email}
                      </span>
                    </div>
                  )}
                  {shipment.merchantId?.phone && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Phone</span>
                      <span style={{ fontWeight: "500", color: "#0f172a" }}>
                        <FaPhone style={{ marginRight: "4px" }} size={12} />
                        {shipment.merchantId.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaUser style={{ color: "#64748b" }} />
                  Customer
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Name</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.customerName || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Phone</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      <FaPhone style={{ marginRight: "4px" }} size={12} />
                      {shipment.orderId?.customerPhone || "N/A"}
                    </span>
                  </div>
                  {shipment.orderId?.customerEmail && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Email</span>
                      <span style={{ fontWeight: "500", color: "#0f172a" }}>
                        <FaEnvelope style={{ marginRight: "4px" }} size={12} />
                        {shipment.orderId.customerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaMapMarkerAlt style={{ color: "#64748b" }} />
                  Delivery Address
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "14px", display: "block" }}>Address</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.address?.line1 || "N/A"}
                      {shipment.orderId?.address?.line2 && `, ${shipment.orderId.address.line2}`}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>City</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.address?.city || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>State</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.address?.state || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Pincode</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.address?.pincode || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Country</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.address?.country || "India"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Shipment Details */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaBox style={{ color: "#64748b" }} />
                  Shipment Details
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>AWB Number</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>{shipment.awb}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Order Number</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.orderId?.orderNumber || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Courier</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      <FaTruck style={{ marginRight: "4px" }} size={12} />
                      {shipment.courier}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Service Type</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.serviceType || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Weight</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      {shipment.weight ? `${shipment.weight} kg` : "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Status</span>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 12px",
                      borderRadius: "12px",
                      background: getStatusColor(shipment.status),
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}>
                      {shipment.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaTag style={{ color: "#64748b" }} />
                  Actions
                </h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}>
                    <FaFileInvoice /> Generate Invoice
                  </button>
                  <button style={{
                    padding: "8px 16px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#10b981"}>
                    <FaPrint /> Print Label
                  </button>
                  <button style={{
                    padding: "8px 16px",
                    background: "#8b5cf6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#7c3aed"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#8b5cf6"}>
                    <FaDownload /> Download Label
                  </button>
                </div>
              </div>

              {/* Charges */}
              <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaMoneyBillWave style={{ color: "#64748b" }} />
                  Shipment Charges
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Shipping Cost</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      ₹{shipment.shippingCost || "0"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>COD Charges</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      ₹{shipment.codCharges || "0"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Insurance</span>
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>
                      ₹{shipment.insurance || "0"}
                    </span>
                  </div>
                  {shipment.totalAmount && (
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Total</span>
                      <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "16px" }}>
                        ₹{shipment.totalAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginTop: "20px",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaHistory style={{ color: "#64748b" }} />
              Tracking Timeline
            </h3>
            <div style={{ position: "relative", paddingLeft: "24px" }}>
              <div style={{
                position: "absolute",
                left: "8px",
                top: "0",
                bottom: "0",
                width: "2px",
                background: "#e2e8f0",
              }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {shipment.tracking?.history?.length > 0 ? (
                  shipment.tracking.history.map((event, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <div style={{
                        position: "absolute",
                        left: "-20px",
                        top: "4px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: index === 0 ? "#10b981" : "#94a3b8",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 2px #e2e8f0",
                      }} />
                      <div>
                        <p style={{ margin: "0", fontWeight: "500", color: "#0f172a" }}>
                          {event.status || event.event || "Status Update"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                          {event.location && `${event.location} • `}
                          {event.timestamp ? formatDate(event.timestamp) : "N/A"}
                        </p>
                        {event.remarks && (
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                            {event.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                    <p style={{ margin: 0 }}>No tracking events available</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                      Last scan: {formatDate(lastTrackingUpdate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Webhook History */}
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginTop: "20px",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaHistory style={{ color: "#64748b" }} />
              Webhook History
            </h3>
            <div style={{
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
            }}>
              {shipment.webhookHistory?.length > 0 ? (
                shipment.webhookHistory.map((webhook, index) => (
                  <div key={index} style={{
                    padding: "12px 0",
                    borderBottom: index < shipment.webhookHistory.length - 1 ? "1px solid #e2e8f0" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: "500", color: "#0f172a" }}>
                          {webhook.event || "Status Update"}
                        </span>
                        {webhook.status && (
                          <span style={{
                            display: "inline-block",
                            marginLeft: "8px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: webhook.status === "success" ? "#d1fae5" : "#fee2e2",
                            color: webhook.status === "success" ? "#065f46" : "#991b1b",
                            fontSize: "10px",
                            fontWeight: "600",
                          }}>
                            {webhook.status}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {webhook.timestamp ? formatDate(webhook.timestamp) : "N/A"}
                      </span>
                    </div>
                    {webhook.message && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                        {webhook.message}
                      </p>
                    )}
                    {webhook.data && (
                      <details style={{ marginTop: "4px" }}>
                        <summary style={{ fontSize: "11px", color: "#94a3b8", cursor: "pointer" }}>
                          View payload
                        </summary>
                        <pre style={{
                          background: "#1e293b",
                          color: "#e2e8f0",
                          padding: "8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          marginTop: "4px",
                          overflowX: "auto",
                          maxHeight: "200px",
                        }}>
                          {JSON.stringify(webhook.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: "#94a3b8", textAlign: "center", padding: "10px" }}>
                  No webhook events recorded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;