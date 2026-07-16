import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import "./COD.css"; // ← Import external CSS

const COD = () => {
  const navigate = useNavigate();
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

  const getStatusClass = (status) => {
    if (status === "DELIVERED") return "cod-status-delivered";
    if (status === "PENDING" || status === "NEW") return "cod-status-pending";
    return "cod-status-default";
  };

  return (
    <div className="cod-container">
      <AdminSidebar />

      <div className="cod-content">
        <AdminTopbar />

        <div className="cod-header">
          <h1 className="cod-header-title">
            COD Management
          </h1>
          <p className="cod-header-subtitle">
            Manage COD collections and settlement tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="cod-stats-grid">
          <div className="cod-stat-card">
            <p className="cod-stat-label">Total COD Orders</p>
            <h2 className="cod-stat-value">{orders.length}</h2>
          </div>

          <div className="cod-stat-card">
            <p className="cod-stat-label">Total COD Amount</p>
            <h2 className="cod-stat-value">₹{totalCODAmount}</h2>
          </div>

          <div className="cod-stat-card">
            <p className="cod-stat-label">Pending Orders</p>
            <h2 className="cod-stat-value">{pendingOrders}</h2>
          </div>

          <div className="cod-stat-card">
            <p className="cod-stat-label">Delivered Orders</p>
            <h2 className="cod-stat-value">{deliveredOrders}</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="cod-search-box">
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cod-search-input"
          />
        </div>

        {/* Table */}
        <div className="cod-table-container">
          <div className="cod-table-wrapper">
            <table className="cod-table">
              <thead className="cod-thead">
                <tr>
                  <th className="cod-th">Order No</th>
                  <th className="cod-th">Customer</th>
                  <th className="cod-th">COD Amount</th>
                  <th className="cod-th">Status</th>
                  <th className="cod-th">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="cod-tr">
                      <td className="cod-td">{order.orderNumber}</td>
                      <td className="cod-td">{order.customerName}</td>
                      <td className="cod-td">₹{order.amount}</td>
                      <td className="cod-td">
                        <span className={`cod-status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="cod-td">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="cod-view-btn"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="cod-no-data">
                        <h3 className="cod-no-data-title">No COD Orders Found</h3>
                        <p className="cod-no-data-text">
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
    </div>
  );
};

export default COD;