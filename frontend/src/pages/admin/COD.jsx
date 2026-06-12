import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

const COD = () => {
  const [orders, setOrders] = useState([]);

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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1>COD Reconciliation</h1>

        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            padding: "20px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3>Total COD Orders: {orders.length}</h3>
          <h3>Total COD Amount: ₹{totalCODAmount}</h3>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
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
                  background: "#0f172a",
                  color: "#fff",
                }}
              >
                <th style={th}>Order No</th>
                <th style={th}>Customer</th>
                <th style={th}>COD Amount</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td style={td}>{order.orderNumber}</td>
                    <td style={td}>{order.customerName}</td>
                    <td style={td}>₹{order.amount}</td>
                    <td style={td}>{order.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No COD Orders Found
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
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

export default COD;