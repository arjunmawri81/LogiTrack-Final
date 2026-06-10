import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  FaRupeeSign,
  FaPercentage,
  FaTruck,
  FaWeightHanging,
} from "react-icons/fa";

import "./Admin.css";

const Pricing = () => {
  return (
    <div className="admin-dashboard">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              💲 Pricing Management
            </h1>

            <p className="page-subtitle">
              Manage courier rates, margins and shipping slabs
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaTruck className="stat-icon blue" />
            <h4>Courier Partners</h4>
            <h2>8</h2>
          </div>

          <div className="courier-stat-card">
            <FaWeightHanging className="stat-icon orange" />
            <h4>Weight Slabs</h4>
            <h2>24</h2>
          </div>

          <div className="courier-stat-card">
            <FaRupeeSign className="stat-icon green" />
            <h4>Avg Shipping Rate</h4>
            <h2>₹58</h2>
          </div>

          <div className="courier-stat-card">
            <FaPercentage className="stat-icon red" />
            <h4>Avg Margin</h4>
            <h2>12%</h2>
          </div>

        </div>

        {/* Pricing Summary */}

        <div className="courier-performance">

          <h2>Pricing Overview</h2>

          <div className="progress-item">
            <div className="progress-header">
              <span>DTDC Margin Usage</span>
              <span>78%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "78%" }}
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Delhivery Margin Usage</span>
              <span>91%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "91%" }}
              />
            </div>
          </div>

        </div>

        {/* Pricing Table */}

        <div className="admin-table-section">

          <h2>Courier Pricing Matrix</h2>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Courier</th>
                <th>Weight Slab</th>
                <th>Base Price</th>
                <th>Margin</th>
                <th>Final Price</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  <div className="courier-info">
                    <div className="courier-avatar">
                      DT
                    </div>
                    DTDC
                  </div>
                </td>

                <td>500 gm</td>
                <td>₹40</td>
                <td>₹5</td>
                <td>₹45</td>
              </tr>

              <tr>
                <td>
                  <div className="courier-info">
                    <div className="courier-avatar">
                      DL
                    </div>
                    Delhivery
                  </div>
                </td>

                <td>1 Kg</td>
                <td>₹57</td>
                <td>₹8</td>
                <td>₹65</td>
              </tr>

              <tr>
                <td>
                  <div className="courier-info">
                    <div className="courier-avatar">
                      BD
                    </div>
                    Blue Dart
                  </div>
                </td>

                <td>2 Kg</td>
                <td>₹95</td>
                <td>₹10</td>
                <td>₹105</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Pricing;