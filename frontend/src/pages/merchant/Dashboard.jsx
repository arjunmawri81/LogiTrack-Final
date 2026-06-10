import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalShipments: 0,
    walletBalance: 0,
    totalRevenue: 0,
  });

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get(
        "/reports/dashboard"
      );

      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>
              Welcome Back, {user?.name}
            </h1>

            <p>
              Manage shipments, orders and wallet activity.
            </p>
          </div>

          <button className="create-btn">
            + Create Shipment
          </button>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <h4>Total Orders</h4>
            <h2>{stats.totalOrders}</h2>
          </div>

          <div className="stats-card">
            <h4>Total Shipments</h4>
            <h2>{stats.totalShipments}</h2>
          </div>

          <div className="stats-card">
            <h4>Wallet Balance</h4>
            <h2>₹{stats.walletBalance}</h2>
          </div>

          <div className="stats-card">
            <h4>Total Revenue</h4>
            <h2>₹{stats.totalRevenue}</h2>
          </div>
        </div>

        <div className="table-section">
          <h2>System Summary</h2>

          <table className="shipment-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Total Orders</td>
                <td>{stats.totalOrders}</td>
              </tr>

              <tr>
                <td>Total Shipments</td>
                <td>{stats.totalShipments}</td>
              </tr>

              <tr>
                <td>Wallet Balance</td>
                <td>₹{stats.walletBalance}</td>
              </tr>

              <tr>
                <td>Total Revenue</td>
                <td>₹{stats.totalRevenue}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;