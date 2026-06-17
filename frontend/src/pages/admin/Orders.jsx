import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaBox,
  FaSearch,
  FaEye,
} from "react-icons/fa";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const updateStatus = async (id, status) => {
    try {
      // ✅ Change 3: Verify route - keeping as is for admin route
      await api.patch(`/admin/orders/${id}/status`, {
        status,
      });

      fetchOrders();
    } catch (error) {
      console.log("UPDATE ERROR =>", error);
      alert(error?.response?.data?.message || "Status Update Failed");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // ✅ Change 1: Fixed phone search with toString()
      order.customerPhone
        ?.toString()
        .includes(searchTerm)
  );

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
      SHIPPED: "#e0e7ff",
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

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
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
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #eef2f6" }}>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Order No</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Customer</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Phone</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: "#475569", fontSize: "12px", fontWeight: "600", background: "#f8fafc" }}>Action</th>
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
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}>{order.orderNumber}</td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b" }}>{order.customerName}</td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#1e293b" }}>{order.customerPhone}</td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600", color: "#059669" }}>₹{order.amount}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            background: getStatusColor(order.status),
                            fontSize: "12px",
                            fontWeight: "500",
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
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#64748b" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <button
                          onClick={() => {
                            console.log("Order ID =>", order._id);
                            navigate(`/admin/orders/${order._id}`);
                          }}
                          style={{
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all 0.2s",
                          }}
                          // ✅ Change 2: Fixed hover with currentTarget
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#3b82f6";
                          }}
                        >
                          <FaEye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
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