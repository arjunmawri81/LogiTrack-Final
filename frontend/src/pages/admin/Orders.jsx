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
  FaEdit,
  FaFileInvoice,
  FaTruck,
  FaTimesCircle,
} from "react-icons/fa";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [courierModal, setCourierModal] = useState(null);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkCourierModal, setBulkCourierModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PROCESSING");
  const [selectedCourier, setSelectedCourier] = useState("");

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

  const exportExcel = () => {
    const selectedData = orders.filter((o) =>
      selectedOrders.includes(o._id)
    );

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Orders"
    );

    XLSX.writeFile(
      wb,
      "orders.xlsx"
    );
  };

  // ================================
  // PRINT LABELS
  // ================================
  const handlePrintLabels = () => {
    const selectedData = orders.filter((o) =>
      selectedOrders.includes(o._id)
    );

    if (selectedData.length === 0) {
      alert("Please select at least one order");
      return;
    }

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Labels</title>
          <style>
            body{
              font-family: Arial, sans-serif;
              padding:20px;
            }
            .label{
              border:2px solid #000;
              padding:15px;
              margin-bottom:20px;
              border-radius:8px;
            }
            h3{
              margin:0 0 10px 0;
            }
          </style>
        </head>
        <body>
          ${selectedData
            .map(
              (order) => `
              <div class="label">
                <h3>${order.orderNumber}</h3>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Phone:</strong> ${order.customerPhone}</p>
                <p><strong>Address:</strong> ${order.customerAddress}</p>
                <p><strong>City:</strong> ${order.city}</p>
                <p><strong>Pincode:</strong> ${order.pincode}</p>
              </div>
            `
            )
            .join("")}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, {
        status,
      });

      fetchOrders();
    } catch (error) {
      console.log("UPDATE ERROR =>", error);
      alert(error?.response?.data?.message || "Status Update Failed");
    }
  };

  // ================================
  // 1. CANCEL ORDER
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
  // 2. ASSIGN COURIER (Single)
  // ================================
  const assignCourier = async (id, courierPartner) => {
    try {
      await api.patch(
        `/admin/orders/${id}/courier`,
        { courierPartner }
      );

      setCourierModal(null);
      fetchOrders();
      alert(`Courier ${courierPartner} assigned successfully`);
    } catch (error) {
      console.log(error);
      alert(
        error?.response?.data?.message ||
        "Courier assignment failed"
      );
    }
  };

  // ================================
  // 3. BULK STATUS UPDATE
  // ================================
  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus) {
      alert("Please select a status");
      return;
    }

    try {
      await api.patch("/admin/orders/bulk-status", {
        orderIds: selectedOrders,
        status: selectedStatus,
      });

      setBulkStatusModal(false);
      setSelectedOrders([]);
      fetchOrders();
      alert(`✅ ${selectedOrders.length} orders updated to ${selectedStatus} successfully`);
    } catch (error) {
      console.log("BULK STATUS ERROR =>", error);
      alert(error?.response?.data?.message || "Bulk status update failed");
    }
  };

  // ================================
  // 4. BULK COURIER ASSIGN
  // ================================
  const handleBulkCourierAssign = async () => {
    if (!selectedCourier) {
      alert("Please select a courier partner");
      return;
    }

    try {
      await api.patch("/admin/orders/bulk-courier", {
        orderIds: selectedOrders,
        courierPartner: selectedCourier,
      });

      setBulkCourierModal(false);
      setSelectedOrders([]);
      fetchOrders();
      alert(`✅ ${selectedOrders.length} orders assigned to ${selectedCourier} successfully`);
    } catch (error) {
      console.log("BULK COURIER ERROR =>", error);
      alert(error?.response?.data?.message || "Bulk courier assignment failed");
    }
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

    const matchesStatus =
      activeTab === "ALL"
        ? true
        : order.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const deliveredOrders = orders.filter(
    (o) => o.status === "DELIVERED"
  ).length;

  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING"
  ).length;

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#fef3c7",
      PROCESSING: "#dbeafe",
      PACKED: "#ede9fe",
      READY_FOR_PICKUP: "#d1fae5",
      SHIPPED: "#ede9fe",
      DELIVERED: "#dcfce7",
      RETURNED: "#fee2e2",
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

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
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
            <h2 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>{orders.length}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Delivered</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#10b981" }}>{deliveredOrders}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>Pending</h4>
            <h2 style={{ margin: 0, fontSize: "32px", color: "#f59e0b" }}>{pendingOrders}</h2>
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
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "RETURNED",
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
              {status}
            </button>
          ))}
        </div>

        {/* Bulk Action Bar */}
        {selectedOrders.length > 0 && (
          <div
            style={{
              background: "#dbeafe",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <strong>
              {selectedOrders.length}
              {" "}Orders Selected
            </strong>

            <button
              onClick={exportExcel}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Export Excel
            </button>

            <button
              onClick={handlePrintLabels}
              style={{
                background: "#8b5cf6",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Print Labels
            </button>

            <button
              onClick={() => setBulkStatusModal(true)}
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Bulk Status
            </button>

            <button
              onClick={() => setBulkCourierModal(true)}
              style={{
                background: "#d97706",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Assign Courier
            </button>
          </div>
        )}

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
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc", width: "140px" }}>Status</th>
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
                  filteredOrders.map((order) => (
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
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            background:
                              order.status === "DELIVERED"
                                ? "#dcfce7"
                                : order.status === "SHIPPED"
                                ? "#ede9fe"
                                : order.status === "RETURNED"
                                ? "#fee2e2"
                                : "#fef3c7",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            width: "130px",
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="PACKED">PACKED</option>
                          <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="RETURNED">RETURNED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
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
                            {[
                              { label: "View Order", icon: <FaEye size={16} color="#3b82f6" />, action: () => navigate(`/admin/orders/${order._id}`) },
                              { label: "Edit Order", icon: <FaEdit size={16} color="#8b5cf6" />, action: () => navigate(`/admin/orders/edit/${order._id}`) },
                              { 
                                label: "Invoice", 
                                icon: <FaFileInvoice size={16} color="#059669" />, 
                                action: () =>
                                  alert(
                                    "Invoice generation module will be available in next update."
                                  )
                              },
                              { label: "Assign Courier", icon: <FaTruck size={16} color="#d97706" />, action: () => setCourierModal(order) },
                              { label: "Cancel Order", icon: <FaTimesCircle size={16} color="#dc2626" />, action: () => cancelOrder(order._id) },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  item.action();
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
                                {item.icon}
                                <span>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
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

        {/* ================================ */}
        {/* SINGLE COURIER ASSIGNMENT MODAL */}
        {/* ================================ */}
        {courierModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setCourierModal(null)}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                🚚 Assign Courier
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                Select courier partner for order:{" "}
                <strong>{courierModal.orderNumber}</strong>
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { name: "Delhivery", color: "#2563eb" },
                  { name: "DTDC", color: "#d97706" },
                  { name: "Xpressbees", color: "#059669" },
                  { name: "Ecom Express", color: "#8b5cf6" },
                  { name: "Blue Dart", color: "#dc2626" },
                ].map((courier) => (
                  <button
                    key={courier.name}
                    onClick={() =>
                      assignCourier(
                        courierModal._id,
                        courier.name
                      )
                    }
                    style={{
                      padding: "12px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#1e293b",
                      transition: "all 0.2s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.borderColor = courier.color;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {courier.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCourierModal(null)}
                style={{
                  marginTop: "16px",
                  padding: "10px",
                  width: "100%",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#64748b",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================================ */}
        {/* BULK STATUS UPDATE MODAL */}
        {/* ================================ */}
        {bulkStatusModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setBulkStatusModal(false)}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                📊 Bulk Status Update
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                Update status for <strong>{selectedOrders.length}</strong> selected orders
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#1e293b" }}>
                  Select Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleBulkStatusUpdate}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#10b981";
                  }}
                >
                  Update Status
                </button>
                <button
                  onClick={() => setBulkStatusModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================ */}
        {/* BULK COURIER ASSIGNMENT MODAL */}
        {/* ================================ */}
        {bulkCourierModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setBulkCourierModal(false)}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                🚚 Bulk Courier Assignment
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                Assign courier to <strong>{selectedOrders.length}</strong> selected orders
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#1e293b" }}>
                  Select Courier Partner
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a courier...</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Xpressbees">Xpressbees</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Blue Dart">Blue Dart</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleBulkCourierAssign}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#d97706",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#b45309";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#d97706";
                  }}
                >
                  Assign Courier
                </button>
                <button
                  onClick={() => setBulkCourierModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;