import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaSearch, FaEye } from "react-icons/fa";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      console.log("ORDERS =>", res.data.orders);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, padding: "20px", overflowX: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ fontSize: "24px", margin: 0 }}>Orders Management</h1>
          </div>
          <button
            style={{ background: "#f97316", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
            onClick={() => navigate("/merchant/create-order")}
          >
            + Create Order
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "10px 15px",
            marginBottom: "20px",
            maxWidth: "400px",
          }}
        >
          <FaSearch color="#64748b" />
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", marginLeft: "10px", width: "100%" }}
          />
        </div>

        <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ background: "#0f172a" }}>
                {["ORDER ID", "CUSTOMER", "PHONE", "AMOUNT", "STATUS", "DATE", "ACTION"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "15px", color: "#fff", fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "15px", fontSize: "14px" }}>{order.orderNumber || order._id.slice(-6)}</td>
                    <td style={{ padding: "15px", fontSize: "14px" }}>{order.customerName}</td>
                    <td style={{ padding: "15px", fontSize: "14px" }}>{order.customerPhone}</td>
                    <td style={{ padding: "15px", fontSize: "14px" }}>₹{order.amount}</td>
                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          background: order.status === "DELIVERED" ? "#dcfce7" : order.status === "CANCELLED" ? "#fee2e2" : "#fef3c7",
                          color: order.status === "DELIVERED" ? "#166534" : order.status === "CANCELLED" ? "#991b1b" : "#92400e",
                          padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "600"
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px", fontSize: "14px" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "15px" }}>
                      <button
                        onClick={() => {
                          console.log("CLICKED ORDER ID =>", order._id);
                          console.log("FULL ORDER =>", order);
                          navigate(`/merchant/orders/${order._id}`);
                        }}
                        style={{ background: "#f1f5f9", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: "30px", textAlign: "center" }}>No Orders Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders; 