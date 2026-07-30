import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const res = await api.get(`/shipments/${id}`);
      setShipment(
        res.data.shipment ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadLabel = async () => {
    if (!shipment?._id) return;
    try {
      const response = await api.get(`/shipments/${shipment._id}/label`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Label-${shipment.awb || shipment._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Label download error:", error);
      alert("Label download failed. Please try again.");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#16a34a";
      case "RTO":
        return "#dc2626";
      case "NDR":
        return "#f59e0b";
      case "PICKUP_PENDING":
      case "PICKUP_SCHEDULED":
        return "#f97316";
      case "IN_TRANSIT":
        return "#2563eb";
      default:
        return "#64748b";
    }
  };

  const statusBackground = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#dcfce7";
      case "RTO":
        return "#fee2e2";
      case "NDR":
        return "#fef3c7";
      case "PICKUP_PENDING":
      case "PICKUP_SCHEDULED":
        return "#ffedd5";
      case "IN_TRANSIT":
        return "#dbeafe";
      default:
        return "#f1f5f9";
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <div style={{ width: "280px", flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1, padding: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid #f97316",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }} />
            <h2 style={{ color: "#0f172a" }}>Loading Shipment...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <div style={{ width: "280px", flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1, padding: "40px" }}>
          <div style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid #e2e8f0"
          }}>
            <h2 style={{ color: "#0f172a" }}>Shipment Not Found</h2>
            <button
              onClick={() => navigate("/merchant/shipments")}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                marginTop: "15px",
                fontWeight: "600"
              }}
            >
              Back to Shipments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order = shipment.orderId || {};

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: "280px",
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Shipment Details
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <p
              style={{
                color: "#64748b",
                margin: 0,
              }}
            >
              AWB: <strong style={{ color: "#0f172a" }}>{shipment.awb}</strong>
            </p>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                background: statusBackground(shipment.status),
                color: statusColor(shipment.status),
              }}
            >
              {shipment.status}
            </span>
            {shipment.pickupStatus === "AUTO_SCHEDULED" ? (
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: "#dcfce7",
                  color: "#15803d",
                }}
              >
                ✓ Pickup: Auto-scheduled by courier
              </span>
            ) : shipment.pickupStatus === "SCHEDULED" ? (
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: "#e0f2fe",
                  color: "#0369a1",
                }}
              >
                ✓ Pickup: Scheduled {shipment.lrNumber ? `(LR: ${shipment.lrNumber})` : ""}
              </span>
            ) : (
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: "#fef3c7",
                  color: "#b45309",
                }}
              >
                ⏳ Pickup: Pending
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
              <button
                onClick={downloadLabel}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "13px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                onMouseLeave={(e) => e.target.style.background = "#2563eb"}
              >
                📄 Download Label
              </button>
              <button
                onClick={() => navigate("/merchant/shipments")}
                style={{
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "13px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => e.target.style.background = "#ea580c"}
                onMouseLeave={(e) => e.target.style.background = "#f97316"}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - ORANGE THEME */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={statCardOrange}>
            <p style={statLabelOrange}>Courier</p>
            <p style={statValueOrange}>{shipment.courier || "-"}</p>
          </div>
          <div style={statCardOrange}>
            <p style={statLabelOrange}>Pickup Status</p>
            <p style={statValueOrange}>
              {shipment.pickupStatus === "AUTO_SCHEDULED"
                ? "Auto-Scheduled"
                : shipment.pickupStatus === "SCHEDULED"
                  ? "Scheduled"
                  : "Pending"}
            </p>
          </div>
          <div style={statCardOrange}>
            <p style={statLabelOrange}>LR Number</p>
            <p style={statValueOrange}>{shipment.lrNumber || shipment.pickupRequestId || "-"}</p>
          </div>
          <div style={statCardOrange}>
            <p style={statLabelOrange}>Pickup Date</p>
            <p style={statValueOrange}>
              {shipment.pickupDate
                ? new Date(shipment.pickupDate).toLocaleDateString()
                : "Pending"}
            </p>
          </div>
          <div style={statCardOrange}>
            <p style={statLabelOrange}>Delivery Date</p>
            <p style={statValueOrange}>
              {shipment.deliveryDate
                ? new Date(shipment.deliveryDate).toLocaleDateString()
                : "Pending"}
            </p>
          </div>
          <div style={statCardOrange}>
            <p style={statLabelOrange}>Created</p>
            <p style={statValueOrange}>
              {shipment.createdAt
                ? new Date(shipment.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Customer Details */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={cardIcon}>👤</span>
              <h2 style={cardTitle}>Customer Details</h2>
            </div>
            <div style={cardContent}>
              <div style={detailRow}>
                <span style={detailLabel}>Name</span>
                <span style={detailValue}>{order.customerName || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Phone</span>
                <span style={detailValue}>{order.customerPhone || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Email</span>
                <span style={detailValue}>{order.customerEmail || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Address</span>
                <span style={detailValue}>
                  {order.customerAddress || "-"}
                  {order.city && `, ${order.city}`}
                  {order.state && `, ${order.state}`}
                  {order.pincode && ` - ${order.pincode}`}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={cardIcon}>📦</span>
              <h2 style={cardTitle}>Product Details</h2>
            </div>
            <div style={cardContent}>
              <div style={detailRow}>
                <span style={detailLabel}>Product</span>
                <span style={detailValue}>{order.productName || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>SKU</span>
                <span style={detailValue}>{order.sku || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Quantity</span>
                <span style={detailValue}>{order.quantity || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Weight</span>
                <span style={detailValue}>{order.weight || "-"} KG</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Amount</span>
                <span style={detailValue}>₹{order.amount || "0"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Payment</span>
                <span style={detailValue}>{order.paymentMode || "-"}</span>
              </div>
            </div>
          </div>

          {/* Insurance Details */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={cardIcon}>🛡️</span>
              <h2 style={cardTitle}>Insurance Details</h2>
            </div>
            <div style={cardContent}>
              <div style={detailRow}>
                <span style={detailLabel}>Insurance</span>
                <span style={detailValue}>
                  {shipment.insuranceEnabled ? (
                    <span style={{ color: "#16a34a", fontWeight: "600" }}>✓ Enabled</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>Not Enabled</span>
                  )}
                </span>
              </div>
              {shipment.insuranceEnabled && (
                <>
                  <div style={detailRow}>
                    <span style={detailLabel}>Amount</span>
                    <span style={detailValue}>₹{shipment.insuranceAmount || "0"}</span>
                  </div>
                  <div style={detailRow}>
                    <span style={detailLabel}>Premium</span>
                    <span style={detailValue}>₹{shipment.insurancePremium || "0"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shipping Details */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={cardIcon}>🚚</span>
              <h2 style={cardTitle}>Shipping Details</h2>
            </div>
            <div style={cardContent}>
              <div style={detailRow}>
                <span style={detailLabel}>Courier Partner</span>
                <span style={detailValue}>{shipment.courierPartner || shipment.courier || "-"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Shipping Charge</span>
                <span style={detailValue}>₹{shipment.shippingCharge || "0"}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>COD</span>
                <span style={detailValue}>
                  {shipment.isCOD ? (
                    <span style={{ color: "#f97316", fontWeight: "600" }}>Yes</span>
                  ) : (
                    "No"
                  )}
                </span>
              </div>
              {shipment.isCOD && (
                <div style={detailRow}>
                  <span style={detailLabel}>COD Amount</span>
                  <span style={detailValue}>₹{shipment.codAmount || "0"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div style={{ ...card, marginTop: "20px" }}>
          <div style={cardHeader}>
            <span style={cardIcon}>📋</span>
            <h2 style={cardTitle}>Tracking Timeline</h2>
          </div>
          <div style={cardContent}>
            {shipment.trackingEvents?.length > 0 ? (
              <div style={{ position: "relative" }}>
                {shipment.trackingEvents.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: index === shipment.trackingEvents.length - 1 ? "0" : "20px",
                      position: "relative",
                    }}
                  >
                    {/* Timeline Line */}
                    {index !== shipment.trackingEvents.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "30px",
                          bottom: "-20px",
                          width: "2px",
                          background: "#e2e8f0",
                        }}
                      />
                    )}

                    {/* Timeline Dot */}
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: index === shipment.trackingEvents.length - 1 ? "#f97316" : "#94a3b8",
                        flexShrink: 0,
                        marginTop: "5px",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 2px #e2e8f0",
                      }}
                    />

                    {/* Timeline Content */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            color: "#0f172a",
                            fontSize: "15px",
                          }}
                        >
                          {event.status}
                        </h4>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        {event.remark}
                      </p>
                      {event.location && (
                        <small
                          style={{
                            color: "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          📍 {event.location}
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
                No tracking events available
              </p>
            )}
          </div>
        </div>

        {/* Add spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

// Styles matching the create shipment theme
const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "16px 20px",
  borderBottom: "1px solid #f1f5f9",
  background: "#fafbfc",
};

const cardIcon = {
  fontSize: "18px",
};

const cardTitle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
};

const cardContent = {
  padding: "16px 20px",
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #f8fafc",
};

const detailLabel = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "500",
};

const detailValue = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: "500",
  textAlign: "right",
  maxWidth: "60%",
  wordBreak: "break-word",
};

// ORANGE STAT CARDS - Matching button style
const statCardOrange = {
  background: "#f97316",
  borderRadius: "12px",
  padding: "16px 20px",
  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
  transition: "all 0.3s ease",
  cursor: "default",
};

const statLabelOrange = {
  margin: "0 0 4px 0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.8)",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const statValueOrange = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "700",
  color: "#ffffff",
};

export default ShipmentDetails;