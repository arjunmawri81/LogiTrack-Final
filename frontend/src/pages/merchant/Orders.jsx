import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

import {
  FaBox,
  FaSearch,
  FaEye,
} from "react-icons/fa";

import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");

      setOrders(response.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        {/* Header */}

        <div className="page-header">
          <div>
            <h1>Orders Management</h1>

            <p>
              Manage and track all customer orders
            </p>
          </div>

          <button
            className="create-btn"
            onClick={() =>
              navigate("/merchant/create-order")
            }
          >
            Create Order
          </button>
        </div>

        {/* Stats */}

        <div className="stats-grid">
          <div className="stats-card">
            <FaBox className="stats-icon" />

            <h4>Total Orders</h4>

            <h2>{orders.length}</h2>
          </div>
        </div>

        {/* Search */}

        <div className="filter-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search Orders..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {/* Table */}

        <div className="table-section">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
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
                    <td>
                      {order._id.slice(-6)}
                    </td>

                    <td>
                      {order.customerName}
                    </td>

                    <td>
                      {order.customerPhone}
                    </td>

                    <td>
                      ₹{order.amount}
                    </td>

                    <td>
                      <span
                        style={{
                          background:
                            order.status ===
                            "DELIVERED"
                              ? "#dcfce7"
                              : order.status ===
                                "SHIPPED"
                              ? "#dbeafe"
                              : "#fef3c7",

                          color:
                            order.status ===
                            "DELIVERED"
                              ? "#15803d"
                              : order.status ===
                                "SHIPPED"
                              ? "#2563eb"
                              : "#d97706",

                          padding:
                            "6px 12px",

                          borderRadius:
                            "999px",

                          fontSize: "13px",

                          fontWeight:
                            "600",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        style={{
                          background:
                            "#f97316",
                          color: "#fff",
                          border: "none",
                          padding:
                            "8px 12px",
                          borderRadius:
                            "8px",
                          cursor:
                            "pointer",
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "20px",
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

export default Orders;