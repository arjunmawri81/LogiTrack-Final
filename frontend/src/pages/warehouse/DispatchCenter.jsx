import { useEffect, useState } from "react";
import WarehouseSidebar from "./WarehouseSidebar";
import api from "../../services/api";

const DispatchCenter = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");

      const readyOrders = (res.data.orders || []).filter(
        (o) =>
          o.status === "READY_FOR_PICKUP" ||
          o.status === "PACKED"
      );

      setOrders(readyOrders);
    } catch (error) {
      console.log(error);
    }
  };

  const dispatchOrder = async (id) => {
    try {
      await api.patch(`/orders/${id}/status`, {
        status: "SHIPPED",
      });

      fetchOrders();
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
      <WarehouseSidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1>Dispatch Center</h1>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <h3>
            Orders Ready For Dispatch : {orders.length}
          </h3>
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
                <th style={th}>Phone</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td style={td}>{order.orderNumber}</td>

                    <td style={td}>
                      {order.customerName}
                    </td>

                    <td style={td}>
                      {order.customerPhone}
                    </td>

                    <td style={td}>
                      {order.status}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          dispatchOrder(order._id)
                        }
                        style={btn}
                      >
                        Dispatch Now
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No Orders Ready For Dispatch
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

const btn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
};

export default DispatchCenter;