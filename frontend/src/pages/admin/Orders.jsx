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

    const orderStatus = order.status || "NEW";
    const matchesStatus =
      activeTab === "ALL" ? true : orderStatus === activeTab;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === "NEW").length;
  const readyForPickup = orders.filter(o => o.status === "READY_FOR_PICKUP").length;
  const shipped = orders.filter(o => o.status === "SHIPPED").length;
  const cancelledOrders = orders.filter(o => o.status === "CANCELLED").length;

  const getStatusBadge = (order) => {
    const status = order.status || "NEW";
    switch (status) {
      case "DELIVERED":
        return { label: "DELIVERED", color: "#dcfce7", textColor: "#166534" };
      case "CANCELLED":
        return { label: "CANCELLED", color: "#fee2e2", textColor: "#991b1b" };
      case "NEW":
        return { label: "NEW", color: "#fef3c7", textColor: "#d97706" };
      case "READY_FOR_PICKUP":
        return { label: "READY FOR PICKUP", color: "#fef3c7", textColor: "#92400e" };
      case "SHIPPED":
        return { label: "SHIPPED", color: "#e0e7ff", textColor: "#3730a3" };
      case "OUT_FOR_DELIVERY":
        return { label: "OUT FOR DELIVERY", color: "#dbeafe", textColor: "#1e40af" };
      case "NDR":
        return { label: "NDR", color: "#fce4ec", textColor: "#c62828" };
      case "RTO":
        return { label: "RTO", color: "#ffebee", textColor: "#b71c1c" };
      default:
        return { label: status, color: "#f1f5f9", textColor: "#475569" };
    }
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

        {/* Stats Cards */}
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
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Shipped</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#2563eb" }}>{shipped}</h2>
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

        {/* Status Tabs */}
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
            "READY_FOR_PICKUP",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "NDR",
            "RTO",
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
            position: "relative",
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
                minWidth: "1200px",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #eef2f6" }}>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "40px" }}>
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
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "120px" }}>Order No</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Customer</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Merchant</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "110px" }}>Phone</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "90px" }}>City</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "90px" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "100px" }}>Payment</th>
                  <th style={{ textAlign: "left", padding: "16px 12px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Status</th>
                  <th
                    style={{
                      position: "sticky",
                      right: 0,
                      background: "#f8fafc",
                      zIndex: 10,
                      padding: "16px 12px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: "600",
                      width: "70px",
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
                        <td style={{ padding: "12px 12px", textAlign: "center" }}>
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
                        <td style={{ padding: "12px 12px" }}>
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
                              fontSize: "13px",
                              padding: "0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100px",
                              display: "block",
                            }}
                          >
                            {order.orderNumber}
                          </button>
                        </td>
                        <td style={{ 
                          padding: "12px 12px", 
                          fontSize: "13px", 
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "140px",
                        }}>
                          {order.customerName}
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            fontSize: "13px",
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "140px",
                          }}
                        >
                          {order.merchantId?.companyName || order.merchantId?.name || "-"}
                        </td>
                        <td style={{ padding: "12px 12px", fontSize: "13px", color: "#1e293b" }}>{order.customerPhone}</td>
                        <td style={{ padding: "12px 12px", fontSize: "13px", color: "#1e293b" }}>{order.city || "-"}</td>
                        <td style={{ padding: "12px 12px", fontSize: "13px", fontWeight: "600", color: "#059669" }}>₹{order.amount}</td>
                        <td style={{ padding: "12px 12px", fontSize: "13px", color: "#1e293b" }}>{order.paymentMode || "-"}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "8px",
                              background: statusBadge.color,
                              color: statusBadge.textColor,
                              fontSize: "11px",
                              fontWeight: "600",
                              display: "inline-block",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {statusBadge.label}
                          </span>
                          {hasShipment(order) && order.courierPartner && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "#64748b",
                                marginTop: "2px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "120px",
                              }}
                            >
                              {order.courierPartner}
                              {order.awbNumber && ` • ${order.awbNumber}`}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 12px",
                            position: "sticky",
                            right: 0,
                            background: "#fff",
                            zIndex: 5,
                            textAlign: "center",
                            width: "70px",
                          }}
                        >
                          <div style={{ position: "relative", display: "inline-block" }}>
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
                                padding: "6px",
                                borderRadius: "8px",
                                display: "inline-flex",
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
                              <FaEllipsisV size={16} color="#64748b" />
                            </button>

                            {openMenu === order._id && (
                              <div
                                style={{
                                  position: "absolute",
                                  right: "0",
                                  top: "100%",
                                  marginTop: "5px",
                                  background: "#fff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "12px",
                                  padding: "6px 0",
                                  zIndex: 1000,
                                  minWidth: "180px",
                                  width: "180px",
                                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                }}
                              >
                                {/* View Order */}
                                <div
                                  onClick={() => {
                                    navigate(`/admin/orders/${order._id}`);
                                    setOpenMenu(null);
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    color: "#1e293b",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f8fafc";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <FaEye size={14} color="#3b82f6" />
                                  <span>View Order</span>
                                </div>

                                {/* Open Shipment */}
                                {hasShipment(order) && (
                                  <div
                                    onClick={() => {
                                      navigate(`/admin/shipments/${order.shipmentId || order._id}`);
                                      setOpenMenu(null);
                                    }}
                                    style={{
                                      padding: "10px 14px",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "#1e293b",
                                      transition: "all 0.2s",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#f8fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <FaTruck size={14} color="#059669" />
                                    <span>Open Shipment</span>
                                  </div>
                                )}

                                {/* Cancel Order */}
                                {!hasShipment(order) && order.status !== "CANCELLED" && (
                                  <div
                                    onClick={() => {
                                      cancelOrder(order._id);
                                      setOpenMenu(null);
                                    }}
                                    style={{
                                      padding: "10px 14px",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "#dc2626",
                                      transition: "all 0.2s",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      borderTop: "1px solid #f1f5f9",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#fef2f2";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <FaTimesCircle size={14} color="#dc2626" />
                                    <span>Cancel Order</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
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