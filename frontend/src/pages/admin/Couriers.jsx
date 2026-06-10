import AdminSidebar from "../../components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  FaTruck,
  FaLink,
  FaTimesCircle,
  FaChartLine,
  FaEye,
} from "react-icons/fa";

import "./Admin.css";

const Couriers = () => {
  const [stats, setStats] = useState({
    totalShipments: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const couriers = [
    {
      name: "DTDC",
      apiStatus: "Connected",
      priority: "#1",
      status: "Active",
      performance: 98,
    },
    {
      name: "Delhivery",
      apiStatus: "Connected",
      priority: "#2",
      status: "Active",
      performance: 96,
    },
    {
      name: "Blue Dart",
      apiStatus: "Disconnected",
      priority: "#3",
      status: "Inactive",
      performance: 91,
    },
    {
      name: "XpressBees",
      apiStatus: "Connected",
      priority: "#4",
      status: "Active",
      performance: 95,
    },
  ];

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">

        <div className="page-header">
          <div>
            <h1 className="page-title">
              🚚 Courier Partners
            </h1>

            <p className="page-subtitle">
              Manage courier integrations and monitor API performance
            </p>
          </div>
        </div>

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaTruck className="stat-icon orange" />
            <h4>Total Couriers</h4>
            <h2>{couriers.length}</h2>
          </div>

          <div className="courier-stat-card">
            <FaLink className="stat-icon green" />
            <h4>Connected APIs</h4>
            <h2>
              {
                couriers.filter(
                  c => c.apiStatus === "Connected"
                ).length
              }
            </h2>
          </div>

          <div className="courier-stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h4>Failed APIs</h4>
            <h2>
              {
                couriers.filter(
                  c => c.apiStatus === "Disconnected"
                ).length
              }
            </h2>
          </div>

          <div className="courier-stat-card">
            <FaChartLine className="stat-icon blue" />
            <h4>Total Shipments</h4>
            <h2>{stats.totalShipments}</h2>
          </div>

        </div>

        <div className="courier-performance">

          <h2>Courier Performance</h2>

          {couriers.map((courier) => (
            <div
              className="progress-item"
              key={courier.name}
            >
              <div className="progress-header">
                <span>{courier.name}</span>
                <span>{courier.performance}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${courier.performance}%`,
                  }}
                />
              </div>
            </div>
          ))}

        </div>

        <div className="admin-table-section">

          <h2>Courier Partner List</h2>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Courier</th>
                <th>API Status</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {couriers.map((courier) => (
                <tr key={courier.name}>

                  <td>
                    <div className="courier-info">
                      <div className="courier-avatar">
                        {courier.name.substring(0, 2)}
                      </div>
                      {courier.name}
                    </div>
                  </td>

                  <td>{courier.apiStatus}</td>

                  <td>{courier.priority}</td>

                  <td>
                    <span
                      className={
                        courier.status === "Active"
                          ? "active"
                          : "blocked"
                      }
                    >
                      {courier.status}
                    </span>
                  </td>

                  <td>
                    <button className="admin-btn">
                      <FaEye />
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
};

export default Couriers;