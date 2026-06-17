import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaSearch, FaEye, FaSpinner } from "react-icons/fa";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/orders");
      console.log("ORDERS =>", res.data.orders);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) =>
    o.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const styles = {
      DELIVERED: { bg: "#dcfce7", color: "#166534" },
      CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
      PENDING: { bg: "#fef3c7", color: "#92400e" },
      PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
      SHIPPED: { bg: "#e0e7ff", color: "#3730a3" }
    };
    return styles[status] || { bg: "#f1f5f9", color: "#475569" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <div style={{ width: "280px", flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <FaSpinner className="animate-spin" size={40} color="#f97316" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      background: "#f1f5f9", 
      minHeight: "100vh", 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" 
    }}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, padding: "24px 32px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "6px",
              }}>
                Orders Management
              </h1>
              <p style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px"
              }}>
                Manage and track all customer orders
              </p>
            </div>
            <button
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(249,115,22,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(249,115,22,0.25)";
              }}
              onClick={() => navigate("/merchant/create-order")}
            >
              + Create Order
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#991b1b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{error}</span>
            <button
              onClick={fetchOrders}
              style={{
                background: "transparent",
                border: "1px solid #991b1b",
                padding: "4px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#991b1b",
                fontWeight: "500"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          maxWidth: "450px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <FaSearch color="#94a3b8" size={18} />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                marginLeft: "12px",
                width: "100%",
                fontSize: "14px",
                color: "#0f172a",
                background: "transparent"
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{
                  background: "#ffffff",
                  borderBottom: "1px solid #e2e8f0",
                }}>
                  {["ORDER ID", "CUSTOMER", "PHONE", "AMOUNT", "STATUS", "DATE", "ACTION"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "16px 20px",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.2s",
                          background: "#ffffff"
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#ffffff")
                        }
                      >
                        <td style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          color: "#0f172a",
                          fontWeight: "500"
                        }}>
                          {order.orderNumber || order._id.slice(-6)}
                        </td>
                        <td style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          color: "#0f172a",
                        }}>
                          {order.customerName || "N/A"}
                        </td>
                        <td style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          color: "#0f172a",
                        }}>
                          {order.customerPhone || "N/A"}
                        </td>
                        <td style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          color: "#0f172a",
                          fontWeight: "600"
                        }}>
                          ₹{order.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block",
                          }}>
                            {order.status || "PENDING"}
                          </span>
                        </td>
                        <td style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          color: "#64748b",
                        }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : "N/A"}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <button
                            onClick={() => {
                              console.log("CLICKED ORDER ID =>", order._id);
                              console.log("FULL ORDER =>", order);
                              navigate(`/merchant/orders/${order._id}`);
                            }}
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "background 0.2s, transform 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#dbeafe";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#eff6ff";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <FaEye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "14px"
                    }}>
                      {search ? "No orders found matching your search" : "No orders found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional: Orders count footer */}
        {filteredOrders.length > 0 && (
          <div style={{
            marginTop: "16px",
            color: "#64748b",
            fontSize: "14px",
            textAlign: "right"
          }}>
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;