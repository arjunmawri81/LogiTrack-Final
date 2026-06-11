import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";

import "./Admin.css";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await api.get("/admin/shipments");
      setShipments(response.data.shipments || []);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.courier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deliveredCount = shipments.filter(
    (shipment) => shipment.status === "DELIVERED"
  ).length;

  const transitCount = shipments.filter(
    (shipment) => shipment.status === "IN_TRANSIT"
  ).length;

  const failedCount = shipments.filter(
    (shipment) => shipment.status === "RTO"
  ).length;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">
        <AdminTopbar />

        <div className="page-header">
          <div>
            <h1 className="page-title">🚚 Shipments Management</h1>
            <p className="page-subtitle">Monitor and manage all shipments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="courier-stats">
          <div className="courier-stat-card">
            <FaTruck className="stat-icon blue" />
            <h4>Total Shipments</h4>
            <h2>{shipments.length}</h2>
          </div>

          <div className="courier-stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h4>Delivered</h4>
            <h2>{deliveredCount}</h2>
          </div>

          <div className="courier-stat-card">
            <FaClock className="stat-icon orange" />
            <h4>In Transit</h4>
            <h2>{transitCount}</h2>
          </div>

          <div className="courier-stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h4>Failed / RTO</h4>
            <h2>{failedCount}</h2>
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search AWB or Courier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="admin-table-section">
          <h2>Shipment List</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>AWB</th>
                <th>Courier</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <tr key={shipment._id}>
                    <td>{shipment.awb}</td>
                    <td>{shipment.courier}</td>
                    <td>
                      <span
                        className={
                          shipment.status === "DELIVERED"
                            ? "active"
                            : shipment.status === "IN_TRANSIT"
                            ? "processing"
                            : "pending"
                        }
                      >
                        {shipment.status}
                      </span>
                    </td>
                    <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-btn"
                        onClick={() =>
                          alert(
                            `AWB: ${shipment.awb}\nCourier: ${shipment.courier}\nStatus: ${shipment.status}`
                          )
                        }
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No Shipments Found
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

export default Shipments;