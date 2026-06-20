import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaEdit,
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaFlag,
  FaBox,
  FaTag,
  FaWeight,
  FaRuler,
  FaCreditCard,
  FaRupeeSign,
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.log("ORDER ERROR =>", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#fef3c7",
      PROCESSING: "#dbeafe",
      PACKED: "#ede9fe",
      READY_FOR_PICKUP: "#d1fae5",
      SHIPPED: "#e0e7ff",
      DELIVERED: "#dcfce7",
      RETURNED: "#fee2e2",
      CANCELLED: "#f1f5f9",
    };
    return colors[status] || "#ffffff";
  };

  const getStatusTextColor = (status) => {
    const colors = {
      PENDING: "#92400e",
      PROCESSING: "#1e40af",
      PACKED: "#5b21b6",
      READY_FOR_PICKUP: "#065f46",
      SHIPPED: "#1e3a8a",
      DELIVERED: "#065f46",
      RETURNED: "#991b1b",
      CANCELLED: "#475569",
    };
    return colors[status] || "#475569";
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <FaClock size={14} />,
      PROCESSING: <FaSpinner size={14} />,
      PACKED: <FaBox size={14} />,
      READY_FOR_PICKUP: <FaTruck size={14} />,
      SHIPPED: <FaTruck size={14} />,
      DELIVERED: <FaCheckCircle size={14} />,
      RETURNED: <FaTruck size={14} />,
      CANCELLED: <FaTimesCircle size={14} />,
    };
    return icons[status] || <FaClock size={14} />;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f1f5f9",
        }}
      >
        <AdminSidebar />
        <div
          style={{
            flex: 1,
            marginLeft: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <FaSpinner size={40} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "16px", color: "#64748b" }}>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f1f5f9",
        }}
      >
        <AdminSidebar />
        <div
          style={{
            flex: 1,
            marginLeft: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: "#64748b" }}>
            <h2>Order not found</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              style={{
                marginTop: "16px",
                padding: "10px 24px",
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "280px",
          padding: "25px 35px",
          overflowY: "auto",
        }}
      >
        <AdminTopbar />

        {/* Header with Actions - Clean Version */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/admin/orders")}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                fontSize: "14px",
                fontWeight: "500",
                color: "#475569",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#f97316";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <FaArrowLeft size={14} /> Back
            </button>

            <div>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Order Details
              </h1>
              <p style={{ color: "#64748b", marginTop: "2px", fontSize: "14px" }}>
                #{order.orderNumber}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/admin/orders/edit/${order._id}`)}
            style={{
              padding: "10px 20px",
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ea580c";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f97316";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FaEdit size={14} /> Edit Order
          </button>
        </div>

        {/* Top Summary Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
            border: "1px solid #fed7aa",
            borderRadius: "14px",
            padding: "20px 28px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Order ID
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#9a3412" }}>#{order.orderNumber}</div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Status
              </div>
              <span
                style={{
                  background: getStatusColor(order.status),
                  color: getStatusTextColor(order.status),
                  padding: "3px 14px",
                  borderRadius: "16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {getStatusIcon(order.status)} {order.status}
              </span>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Amount
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>₹{order.amount}</div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Courier
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: order.courierPartner ? "#9a3412" : "#94a3b8" }}>
                {order.courierPartner || "Not Assigned"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Payment
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#9a3412" }}>{order.paymentMode}</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Created
            </div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#9a3412" }}>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {" "}
              {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Grid Layout - 2 Column Cards (Mobile Responsive) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Customer Details */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "22px 24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <FaUser size={18} color="#f97316" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Customer Details</h3>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaUser size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Name:</span>
                <span style={{ color: "#0f172a" }}>{order.customerName}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaPhone size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Phone:</span>
                <span style={{ color: "#0f172a" }}>{order.customerPhone}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaEnvelope size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Email:</span>
                <span style={{ color: "#0f172a" }}>{order.customerEmail || "N/A"}</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                <FaMapMarkerAlt size={14} color="#94a3b8" style={{ marginTop: "2px" }} />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Address:</span>
                <span style={{ color: "#0f172a" }}>{order.customerAddress}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaCity size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>City:</span>
                <span style={{ color: "#0f172a" }}>{order.city || "N/A"}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaFlag size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>State:</span>
                <span style={{ color: "#0f172a" }}>{order.state || "N/A"}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaTag size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Pincode:</span>
                <span style={{ color: "#0f172a" }}>{order.pincode || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "22px 24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <FaBox size={18} color="#f97316" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Product Details</h3>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaBox size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Product:</span>
                <span style={{ color: "#0f172a" }}>{order.productName}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaTag size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>SKU:</span>
                <span style={{ color: "#0f172a" }}>{order.sku || "N/A"}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaTag size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Quantity:</span>
                <span style={{ color: "#0f172a" }}>{order.quantity}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaWeight size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Weight:</span>
                <span style={{ color: "#0f172a" }}>{order.weight || "N/A"} kg</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaRuler size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Dimensions:</span>
                <span style={{ color: "#0f172a" }}>
                  {order.length || "N/A"} × {order.breadth || "N/A"} × {order.height || "N/A"} cm
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "22px 24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <FaCreditCard size={18} color="#f97316" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Payment Details</h3>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaCreditCard size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Payment Mode:</span>
                <span style={{ color: "#0f172a" }}>{order.paymentMode}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaRupeeSign size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Amount:</span>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>₹{order.amount}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaRupeeSign size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Shipping Charge:</span>
                <span style={{ color: "#0f172a" }}>₹{order.shippingCharge || 0}</span>
              </div>
            </div>
          </div>

          {/* Courier Details */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "22px 24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <FaTruck size={18} color="#f97316" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Courier Details</h3>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaTruck size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Courier:</span>
                <span style={{ color: "#0f172a" }}>{order.courierPartner || "Not Assigned"}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaCheckCircle size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Status:</span>
                <span
                  style={{
                    background: getStatusColor(order.status),
                    color: getStatusTextColor(order.status),
                    padding: "2px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {order.status}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <FaClock size={14} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Created:</span>
                <span style={{ color: "#0f172a" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {" "}
                  {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {order.notes && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                  <span style={{ fontWeight: "600", color: "#475569", minWidth: "70px" }}>Notes:</span>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;