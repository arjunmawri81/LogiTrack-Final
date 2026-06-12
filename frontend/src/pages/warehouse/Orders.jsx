import { useEffect, useState } from "react";
import WarehouseSidebar from "./WarehouseSidebar";
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

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, {
        status,
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
        <h1>Warehouse Orders</h1>

        <div
          style={{
            background: "#fff",
            marginTop: "20px",
            borderRadius: "16px",
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
                      {order.status}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "READY_FOR_PICKUP"
                          )
                        }
                        style={btn}
                      >
                        Ready For Pickup
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "SHIPPED"
                          )
                        }
                        style={{
                          ...btn,
                          background: "#16a34a",
                        }}
                      >
                        Dispatch
                      </button>
                    </td>
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

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

const btn = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "8px",
  background: "#f59e0b",
  color: "#fff",
  cursor: "pointer",
  marginRight: "10px",
};

export default Orders;