import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const COD = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCODOrders();
  }, []);

  const fetchCODOrders = async () => {
    try {
      const res = await api.get("/admin/orders");

      const codOrders = (res.data.orders || []).filter(
        (order) => order.paymentMode === "COD"
      );

      setOrders(codOrders);
    } catch (error) {
      console.log(error);
    }
  };

  const totalCODAmount = orders.reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status !== "DELIVERED"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            COD Management
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Manage COD collections and settlement tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Total COD Orders
            </p>
            <h2 style={{ margin: "8px 0 0 0", color: "#0f172a" }}>
              {orders.length}
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Total COD Amount
            </p>
            <h2 style={{ margin: "8px 0 0 0", color: "#0f172a" }}>
              ₹{totalCODAmount}
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Pending Orders
            </p>
            <h2 style={{ margin: "8px 0 0 0", color: "#0f172a" }}>
              {pendingOrders}
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Delivered Orders
            </p>
            <h2 style={{ margin: "8px 0 0 0", color: "#0f172a" }}>
              {deliveredOrders}
            </h2>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
          />
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
              background: "#fff",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <th style={th}>Order No</th>
                <th style={th}>Customer</th>
                <th style={th}>COD Amount</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    style={{
                      background: "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <td style={td}>{order.orderNumber}</td>
                    <td style={td}>{order.customerName}</td>
                    <td style={td}>₹{order.amount}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          background:
                            order.status === "DELIVERED"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            order.status === "DELIVERED"
                              ? "#166534"
                              : "#92400e",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={td}>
                      <button
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#dbeafe";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#eff6ff";
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div
                      style={{
                        padding: "60px 20px",
                        textAlign: "center",
                      }}
                    >
                      <h3>No COD Orders Found</h3>
                      <p style={{ color: "#64748b" }}>
                        COD orders will appear here once available.
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

const th = {
  padding: "16px 20px",
  textAlign: "left",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const td = {
  padding: "16px 20px",
  borderBottom: "1px solid #f1f5f9",
  background: "#fff",
  color: "#0f172a",
  fontSize: "14px",
};

export default COD;