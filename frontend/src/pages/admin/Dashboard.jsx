import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

import {
  FaUsers,
  FaTruck,
  FaRupeeSign,
  FaBox,
} from "react-icons/fa";

import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get(
        "/admin/dashboard"
      );

      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">
        <AdminTopbar />

        <div className="admin-cards">

          <div className="admin-card merchants">
            <FaUsers className="card-icon" />
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>

          <div className="admin-card shipments">
            <FaTruck className="card-icon" />
            <h3>Total Shipments</h3>
            <p>{stats.totalShipments}</p>
          </div>

          <div className="admin-card revenue">
            <FaRupeeSign className="card-icon" />
            <h3>Total Revenue</h3>
            <p>₹{stats.totalRevenue}</p>
          </div>

          <div className="admin-card couriers">
            <FaBox className="card-icon" />
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>

        </div>

        <div className="admin-table-section">
          <h2>Platform Overview</h2>

          <div className="overview-cards">

            <div className="overview-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>

            <div className="overview-card">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>

            <div className="overview-card">
              <h3>Total Shipments</h3>
              <p>{stats.totalShipments}</p>
            </div>

            <div className="overview-card">
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;