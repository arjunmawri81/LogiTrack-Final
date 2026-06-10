import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";

import "./Admin.css";

const Shipments = () => {
  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              🚚 Shipments Management
            </h1>

            <p className="page-subtitle">
              Monitor and manage all shipments
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaTruck className="stat-icon blue" />
            <h4>Total Shipments</h4>
            <h2>2</h2>
          </div>

          <div className="courier-stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h4>Delivered</h4>
            <h2>1</h2>
          </div>

          <div className="courier-stat-card">
            <FaClock className="stat-icon orange" />
            <h4>In Transit</h4>
            <h2>1</h2>
          </div>

          <div className="courier-stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h4>Failed</h4>
            <h2>0</h2>
          </div>

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

              <tr>
                <td>AWB60462817</td>
                <td>DTDC</td>

                <td>
                  <span className="active">
                    Delivered
                  </span>
                </td>

                <td>09-Jun-2026</td>

                <td>
                  <button className="admin-btn">
                    <FaEye />
                  </button>
                </td>
              </tr>

              <tr>
                <td>AWB60462818</td>
                <td>Delhivery</td>

                <td>
                  <span className="pending">
                    In Transit
                  </span>
                </td>

                <td>09-Jun-2026</td>

                <td>
                  <button className="admin-btn">
                    <FaEye />
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

export default Shipments;