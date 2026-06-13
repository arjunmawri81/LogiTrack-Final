import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
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

  const updateShipmentStatus = async (id, status) => {
    try {
      await api.patch(`/shipments/${id}/status`, { status });
      fetchShipments();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.courier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const transitCount = shipments.filter((s) => s.status === "IN_TRANSIT").length;
  const failedCount = shipments.filter((s) => s.status === "RTO" || s.status === "NDR").length;

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
            <h4>Total</h4>
            <h2>{shipments.length}</h2>
          </div>
          <div className="courier-stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h4>Delivered</h4>
            <h2>{deliveredCount}</h2>
          </div>
          <div className="courier-stat-card">
            <FaClock className="stat-icon orange" />
            <h4>Transit</h4>
            <h2>{transitCount}</h2>
          </div>
          <div className="courier-stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h4>Failed/RTO</h4>
            <h2>{failedCount}</h2>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search AWB or Courier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-table-section">
          <h2>Shipment List</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>AWB</th>
                <th>Order No</th>
                <th>Courier</th>
                <th>Status</th>
                <th>Pickup Date</th>
                <th>Delivery Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <tr key={shipment._id}>
                    <td>{shipment.awb}</td>
                    <td>{shipment.orderId?.orderNumber || "N/A"}</td>
                    <td>{shipment.courier}</td>
                    <td>
                      <span className={`status-badge ${shipment.status?.toLowerCase()}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td>{shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString() : "---"}</td>
                    <td>{shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString() : "---"}</td>
                    <td className="action-buttons">
                      <button onClick={() => updateShipmentStatus(shipment._id, "IN_TRANSIT")}>Transit</button>
                      <button onClick={() => updateShipmentStatus(shipment._id, "OUT_FOR_DELIVERY")}>OFD</button>
                      <button onClick={() => updateShipmentStatus(shipment._id, "DELIVERED")}>Delivered</button>
                      <button onClick={() => updateShipmentStatus(shipment._id, "NDR")}>NDR</button>
                      <button onClick={() => updateShipmentStatus(shipment._id, "RTO")}>RTO</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No Shipments Found</td>
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