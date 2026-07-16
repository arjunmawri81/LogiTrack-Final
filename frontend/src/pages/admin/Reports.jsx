import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaFileInvoice,
  FaTruck,
  FaRupeeSign,
  FaStore,
  FaCalendarAlt,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaPrint,
  FaPlus,
} from "react-icons/fa";
import "./Reports.css"; // ← Import external CSS

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
  });
  const [selectedReport, setSelectedReport] = useState("all");
  const [dateRange, setDateRange] = useState("monthly");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Detailed reports
  const detailedReports = [
    { id: 1, name: "Monthly Revenue Report", date: "June 2026", type: "Financial", size: "1.2 MB", status: "Ready" },
    { id: 2, name: "Quarterly Shipment Analysis", date: "Q2 2026", type: "Operations", size: "2.1 MB", status: "Ready" },
    { id: 3, name: "User Growth Report", date: "Jan-Jun 2026", type: "Analytics", size: "856 KB", status: "Ready" },
    { id: 4, name: "Courier Performance", date: "June 2026", type: "Performance", size: "1.5 MB", status: "Processing" },
    { id: 5, name: "Merchant Settlement", date: "May 2026", type: "Financial", size: "943 KB", status: "Ready" },
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case "Ready": return "reports-status-ready";
      case "Processing": return "reports-status-processing";
      case "Failed": return "reports-status-failed";
      default: return "reports-status-default";
    }
  };

  const getReportIconColor = (type) => {
    switch(type) {
      case "Financial": return "#10b981";
      case "Operations": return "#f59e0b";
      case "Analytics": return "#3b82f6";
      default: return "#64748b";
    }
  };

  return (
    <div className="reports-container">
      <AdminSidebar />
      <div className="reports-content">
        <AdminTopbar />

        {/* Header */}
        <div className="reports-header">
          <div className="reports-header-left">
            <h1 className="reports-header-title">Reports & Analytics</h1>
            <p className="reports-header-subtitle">Generate and download business reports</p>
          </div>
          <div className="reports-header-filters">
            <select 
              className="reports-select" 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="financial">Financial Reports</option>
              <option value="operations">Operations Reports</option>
              <option value="analytics">Analytics Reports</option>
            </select>
            <select 
              className="reports-select" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="reports-stats-grid">
          <div className="reports-stat-card">
            <div className="reports-stat-info">
              <div className="reports-stat-label">Total Users</div>
              <h2 className="reports-stat-value">{stats.totalUsers || 0}</h2>
            </div>
            <div className="reports-stat-icon reports-stat-icon-blue">
              <FaFileInvoice color="#3b82f6" size={20} />
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-info">
              <div className="reports-stat-label">Total Shipments</div>
              <h2 className="reports-stat-value">{stats.totalShipments || 0}</h2>
            </div>
            <div className="reports-stat-icon reports-stat-icon-yellow">
              <FaTruck color="#f59e0b" size={20} />
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-info">
              <div className="reports-stat-label">Total Revenue</div>
              <h2 className="reports-stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</h2>
            </div>
            <div className="reports-stat-icon reports-stat-icon-green">
              <FaRupeeSign color="#10b981" size={20} />
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-info">
              <div className="reports-stat-label">Total Orders</div>
              <h2 className="reports-stat-value">{stats.totalOrders || 0}</h2>
            </div>
            <div className="reports-stat-icon reports-stat-icon-red">
              <FaStore color="#ef4444" size={20} />
            </div>
          </div>
        </div>

        {/* Generated Reports Table - Main Section */}
        <div className="reports-table-container">
          <div className="reports-table-header">
            <h3 className="reports-table-title">Generated Reports</h3>
            <button className="reports-generate-btn">
              <FaPlus size={12} /> Generate New
            </button>
          </div>
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th className="reports-th">REPORT NAME</th>
                  <th className="reports-th">DATE</th>
                  <th className="reports-th">TYPE</th>
                  <th className="reports-th">SIZE</th>
                  <th className="reports-th">STATUS</th>
                  <th className="reports-th">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {detailedReports.map((report) => (
                  <tr key={report.id} className="reports-tr">
                    <td className="reports-td">
                      <div className="reports-report-name">
                        <FaFileInvoice 
                          className="reports-report-icon"
                          color={getReportIconColor(report.type)} 
                          size={14} 
                        />
                        <span>{report.name}</span>
                      </div>
                    </td>
                    <td className="reports-td">
                      <div className="reports-report-date">
                        <FaCalendarAlt size={11} color="#94a3b8" />
                        {report.date}
                      </div>
                    </td>
                    <td className="reports-td">
                      <span className="reports-report-type">
                        {report.type}
                      </span>
                    </td>
                    <td className="reports-td reports-report-size">{report.size}</td>
                    <td className="reports-td">
                      <span className={`reports-status-badge ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="reports-td">
                      <div className="reports-actions">
                        <button className="reports-action-btn" title="View Report">
                          <FaEye size={12} />
                        </button>
                        <button className="reports-action-btn reports-action-btn-pdf" title="Download PDF">
                          <FaFilePdf size={12} color="#ef4444" />
                        </button>
                        <button className="reports-action-btn reports-action-btn-excel" title="Download Excel">
                          <FaFileExcel size={12} color="#10b981" />
                        </button>
                        <button className="reports-action-btn" title="Print">
                          <FaPrint size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;