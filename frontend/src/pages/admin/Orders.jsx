import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaBox,
  FaSearch,
  FaEye,
} from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure?");

      if (!confirmDelete) return;

      await api.delete(`/orders/${id}`);

      alert("Order Deleted Successfully");

      fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || "Delete Failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, {
        status,
      });

      fetchOrders();
    } catch (error) {
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
        .includes(searchTerm.toLowerCase())
  );

  const deliveredOrders = orders.filter(
    (o) => o.status === "DELIVERED"
  ).length;

  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING"
  ).length;

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
            marginBottom: "10px",
          }}
        >
          📦 Orders Management
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          View and manage all platform orders
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div className="card">
            <h4>Total Orders</h4>
            <h2>{orders.length}</h2>
          </div>

          <div className="card">
            <h4>Delivered</h4>
            <h2>{deliveredOrders}</h2>
          </div>

          <div className="card">
            <h4>Pending</h4>
            <h2>{pendingOrders}</h2>
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
          }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              marginLeft: "10px",
              width: "100%",
            }}
          />
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
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
              <tr>
                <th>Order No</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.customerPhone}</td>
                    <td>₹{order.amount}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
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

export default Orders;