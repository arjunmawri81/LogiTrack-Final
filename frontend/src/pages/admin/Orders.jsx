import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

import * as XLSX from "xlsx";
import {
  FaBox,
  FaSearch,
  FaEllipsisV,
  FaEye,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.log("ORDERS ERROR =>", error);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // CANCEL ORDER
  // ================================
  const cancelOrder = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!ok) return;

    try {
      await api.patch(`/admin/orders/${id}/cancel`);
      fetchOrders();
      alert("Order Cancelled Successfully");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        "Cancel Failed"
      );
    }
  };

  // ================================
  // CHECK IF SHIPMENT EXISTS
  // ================================
  const hasShipment = (order) => {
    return order.shipmentId || order.awbNumber || order.courierPartner;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerPhone
        ?.toString()
        .includes(searchTerm);

    // Status mapping for Shipmojo
    const getOrderStatus = (order) => {
      if (order.status === "CANCELLED") return "CANCELLED";
      if (hasShipment(order)) return "SHIPMENT_CREATED";
      return "NEW";
    };

    const orderStatus = getOrderStatus(order);
    const matchesStatus =
      activeTab === "ALL" ? true : orderStatus === activeTab;

    return matchesSearch && matchesStatus;
  });

  // Stats for Shipmojo
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => !hasShipment(o) && o.status !== "CANCELLED").length;
  const shipmentCreated = orders.filter(o => hasShipment(o) && o.status !== "CANCELLED").length;
  const cancelledOrders = orders.filter(o => o.status === "CANCELLED").length;

  const getStatusBadge = (order) => {
    if (order.status === "CANCELLED") {
      return {
        label: "CANCELLED",
        color: "#f1f5f9",
        textColor: "#64748b"
      };
    }
    if (hasShipment(order)) {
      return {
        label: "SHIPMENT CREATED",
        color: "#dbeafe",
        textColor: "#2563eb"
      };
    }
    return {
      label: "NEW",
      color: "#fef3c7",
      textColor: "#d97706"
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "#fef3c7",
      SHIPMENT_CREATED: "#dbeafe",
      CANCELLED: "#f1f5f9",
    };
    return colors[status] || "#ffffff";
  };

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
          padding: "20px 30px",
        }}
      >
        <AdminTopbar />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            color: "#0f172a",
          }}
        >
          📦 Orders Management
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          View and manage all platform orders
        </p>

        {/* Stats Cards - Shipmojo Style */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Total Orders</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>{totalOrders}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>New Orders</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#d97706" }}>{newOrders}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Shipment Created</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#2563eb" }}>{shipmentCreated}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Cancelled</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#94a3b8" }}>{cancelledOrders}</h2>
          </div>
        </div>

        {/* Search */}
        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            position: "relative",
          }}
        >
          <FaSearch color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by Order Number, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              marginLeft: "10px",
              width: "100%",
              fontSize: "14px",
              background: "transparent",
            }}
          />
          {searchTerm && (
            <span
              onClick={() => setSearchTerm("")}
              style={{
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "18px",
              }}
            >
              ✕
            </span>
          )}
        </div>

        {/* Status Tabs - Shipmojo Style */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          {[
            "ALL",
            "NEW",
            "SHIPMENT_CREATED",
            "CANCELLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              style={{
                padding: "10px 15px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                background:
                  activeTab === status
                    ? "#2563eb"
                    : "#e2e8f0",
                color:
                  activeTab === status
                    ? "#fff"
                    : "#1e293b",
              }}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            overflowX: "auto",
            overflowY: "visible",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading orders...
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                minWidth: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #eef2f6" }}>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "40px" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(
                            filteredOrders.map(
                              (o) => o._id
                            )
                          );
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Order No</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "180px" }}>Customer</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Phone</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "120px" }}>City</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "100px" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "120px" }}>Payment</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "150px" }}>Status</th>
                  <th
                    style={{
                      position: "sticky",
                      right: 0,
                      background: "#f8fafc",
                      zIndex: 10,
                      padding: "16px 20px",
                      textAlign: "left",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: "600",
                      width: "80px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order);
                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: "#ffffff",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                          const tds = e.currentTarget.querySelectorAll('td');
                          tds.forEach(td => {
                            td.style.background = "#f8fafc";
                          });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ffffff";
                          const tds = e.currentTarget.querySelectorAll('td');
                          tds.forEach(td => {
                            td.style.background = "#ffffff";
                          });
                        }}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([
                                  ...selectedOrders,
                                  order._id,
                                ]);
                              } else {
                                setSelectedOrders(
                                  selectedOrders.filter(
                                    (id) => id !== order._id
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order._id}`)
                            }
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#2563eb",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                          >
                            {order.orderNumber}
                          </button>
                        </td>
                        <td style={{ 
                          padding: "16px 20px", 
                          fontSize: "14px", 
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {order.customerName}
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b" }}>{order.customerPhone}</td>
                        <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b" }}>{order.city || "-"}</td>
                        <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600", color: "#059669" }}>₹{order.amount}</td>
                        <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b" }}>{order.paymentMode || "-"}</td>
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: statusBadge.color,
                              color: statusBadge.textColor,
                              fontSize: "12px",
                              fontWeight: "600",
                              display: "inline-block",
                            }}
                          >
                            {statusBadge.label}
                          </span>
                          {hasShipment(order) && order.courierPartner && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "4px",
                              }}
                            >
                              {order.courierPartner}
                              {order.awbNumber && ` • ${order.awbNumber}`}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            position: "sticky",
                            right: 0,
                            background: "#fff",
                            zIndex: 5,
                          }}
                        >
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === order._id
                                  ? null
                                  : order._id
                              )
                            }
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <FaEllipsisV size={18} color="#64748b" />
                          </button>

                          {openMenu === order._id && (
                            <div
                              style={{
                                position: "absolute",
                                right: "50px",
                                top: "35px",
                                background: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                padding: "8px 0",
                                zIndex: 100,
                                minWidth: "220px",
                                width: "220px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                              }}
                            >
                              {/* View Order - Always visible */}
                              <div
                                onClick={() => {
                                  navigate(`/admin/orders/${order._id}`);
                                  setOpenMenu(null);
                                }}
                                style={{
                                  padding: "12px 16px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  color: "#1e293b",
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f8fafc";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <FaEye size={16} color="#3b82f6" />
                                <span>View Order</span>
                              </div>

                              {/* Open Shipment - Only if shipment exists */}
                              {hasShipment(order) && (
                                <div
                                  onClick={() => {
                                    navigate(`/admin/shipments/${order.shipmentId || order._id}`);
                                    setOpenMenu(null);
                                  }}
                                  style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#1e293b",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f8fafc";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <FaTruck size={16} color="#059669" />
                                  <span>Open Shipment</span>
                                </div>
                              )}

                              {/* Cancel Order - Only if not cancelled and no shipment */}
                              {!hasShipment(order) && order.status !== "CANCELLED" && (
                                <div
                                  onClick={() => {
                                    cancelOrder(order._id);
                                    setOpenMenu(null);
                                  }}
                                  style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#dc2626",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    borderTop: "1px solid #f1f5f9",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#fef2f2";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <FaTimesCircle size={16} color="#dc2626" />
                                  <span>Cancel Order</span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      {searchTerm ? "No orders match your search" : "No Orders Found"}
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

export default Orders;