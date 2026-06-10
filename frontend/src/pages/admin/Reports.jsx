import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

import {
  FaFileInvoice,
  FaTruck,
  FaRupeeSign,
  FaStore,
  FaDownload,
} from "react-icons/fa";

import "./Admin.css";

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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
              📊 Reports Center
            </h1>

            <p className="page-subtitle">
              Generate and download business reports
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaFileInvoice className="stat-icon blue" />
            <h4>Total Users</h4>
            <h2>{stats.totalUsers}</h2>
          </div>

          <div className="courier-stat-card">
            <FaTruck className="stat-icon green" />
            <h4>Total Shipments</h4>
            <h2>{stats.totalShipments}</h2>
          </div>

          <div className="courier-stat-card">
            <FaRupeeSign className="stat-icon orange" />
            <h4>Total Revenue</h4>
            <h2>₹{stats.totalRevenue}</h2>
          </div>

          <div className="courier-stat-card">
            <FaStore className="stat-icon red" />
            <h4>Total Orders</h4>
            <h2>{stats.totalOrders}</h2>
          </div>

        </div>

        {/* Reports */}

        <div className="courier-performance">

          <h2>Available Reports</h2>

          <div className="progress-item">
            <div className="progress-header">
              <span>User Report</span>
              <span>Available</span>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Shipment Report</span>
              <span>Available</span>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Revenue Report</span>
              <span>Available</span>
            </div>
          </div>

        </div>

        {/* Report Table */}

        <div className="admin-table-section">

          <h2>Generated Reports</h2>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Report Name</th>
                <th>Value</th>
                <th>Download</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Total Users Report</td>
                <td>{stats.totalUsers}</td>
                <td>
                  <button className="admin-btn">
                    <FaDownload />
                  </button>
                </td>
              </tr>

              <tr>
                <td>Total Shipments Report</td>
                <td>{stats.totalShipments}</td>
                <td>
                  <button className="admin-btn">
                    <FaDownload />
                  </button>
                </td>
              </tr>

              <tr>
                <td>Total Revenue Report</td>
                <td>₹{stats.totalRevenue}</td>
                <td>
                  <button className="admin-btn">
                    <FaDownload />
                  </button>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Reports;