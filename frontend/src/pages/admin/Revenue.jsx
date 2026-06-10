import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

import {
  FaRupeeSign,
  FaChartLine,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";

import "./Admin.css";

const Revenue = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalShipments: 0,
  });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
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

        <div className="page-header">
          <div>
            <h1 className="page-title">
              💰 Revenue Dashboard
            </h1>

            <p className="page-subtitle">
              Monitor revenue, commissions and financial performance
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaRupeeSign className="stat-icon green" />
            <h4>Total Revenue</h4>
            <h2>₹{stats.totalRevenue}</h2>
          </div>

          <div className="courier-stat-card">
            <FaChartLine className="stat-icon blue" />
            <h4>Total Orders</h4>
            <h2>{stats.totalOrders}</h2>
          </div>

          <div className="courier-stat-card">
            <FaMoneyBillWave className="stat-icon orange" />
            <h4>Total Shipments</h4>
            <h2>{stats.totalShipments}</h2>
          </div>

          <div className="courier-stat-card">
            <FaWallet className="stat-icon red" />
            <h4>Pending Settlement</h4>
            <h2>₹0</h2>
          </div>

        </div>

        {/* Revenue Performance */}

        <div className="courier-performance">

          <h2>Revenue Performance</h2>

          <div className="progress-item">

            <div className="progress-header">
              <span>Revenue Growth</span>
              <span>100%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "100%" }}
              />
            </div>

          </div>

        </div>

        {/* Revenue Table */}

        <div className="admin-table-section">

          <h2>Platform Revenue Summary</h2>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Total Orders</th>
                <th>Total Shipments</th>
                <th>Total Revenue</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>{stats.totalOrders}</td>
                <td>{stats.totalShipments}</td>
                <td>₹{stats.totalRevenue}</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Revenue;