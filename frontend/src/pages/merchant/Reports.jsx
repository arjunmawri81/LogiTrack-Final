import Sidebar from "../../components/Sidebar";
import {
  FaBox,
  FaRupeeSign,
  FaTruck,
  FaDownload,
} from "react-icons/fa";

import "./Reports.css";

const Reports = () => {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="reports-content">

        {/* Header */}

        <div className="page-header">

          <div>
            <h1>Reports & Analytics</h1>
            <p>
              Monitor shipments, revenue and courier performance
            </p>
          </div>

          <button className="export-btn">
            <FaDownload />
            Export Report
          </button>

        </div>

        {/* KPI */}

        <div className="stats-grid">

          <div className="stats-card">
            <FaBox className="stats-icon blue" />
            <h4>Total Orders</h4>
            <h2>1250</h2>
          </div>

          <div className="stats-card">
            <FaRupeeSign className="stats-icon green" />
            <h4>Total Revenue</h4>
            <h2>₹4.8L</h2>
          </div>

          <div className="stats-card">
            <FaTruck className="stats-icon orange" />
            <h4>Total Shipments</h4>
            <h2>1120</h2>
          </div>

          <div className="stats-card">
            <FaTruck className="stats-icon red" />
            <h4>Failed Deliveries</h4>
            <h2>24</h2>
          </div>

        </div>

        {/* Reports */}

        <div className="reports-grid">

          <div className="report-card">
            <h3>Shipment Report</h3>
            <p>
              Detailed shipment performance report.
            </p>

            <button>
              Download
            </button>
          </div>

          <div className="report-card">
            <h3>Revenue Report</h3>
            <p>
              Revenue and billing summary report.
            </p>

            <button>
              Download
            </button>
          </div>

          <div className="report-card">
            <h3>Courier Report</h3>
            <p>
              Courier partner performance report.
            </p>

            <button>
              Download
            </button>
          </div>

          <div className="report-card">
            <h3>COD Report</h3>
            <p>
              COD collection and settlement report.
            </p>

            <button>
              Download
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Reports;