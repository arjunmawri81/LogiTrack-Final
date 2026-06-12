import { useEffect, useState } from "react";
import StaffSidebar from "./StaffSidebar";
import api from "../../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <StaffSidebar />

      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          📝 Staff Orders
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          View all platform orders
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f5f9",
                }}
              >
                <th style={thStyle}>Order No</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td style={tdStyle}>
                      {order.orderNumber}
                    </td>

                    <td style={tdStyle}>
                      {order.customerName}
                    </td>

                    <td style={tdStyle}>
                      {order.customerPhone}
                    </td>

                    <td style={tdStyle}>
                      ₹{order.amount}
                    </td>

                    <td style={tdStyle}>
                      {order.status}
                    </td>

                    <td style={tdStyle}>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No Orders Found
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

const thStyle = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default Orders;