import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaRupeeSign,
  FaChartLine,
  FaMoneyBillWave,
  FaWallet,
  FaSync,
  FaCalculator,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Revenue.css"; // ← Import external CSS

const Revenue = () => {
  const [range, setRange] = useState("month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRevenue();
  }, [range]);

  const fetchRevenue = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError("");
      
      const response = await api.get(`/admin/revenue?range=${range}`);
      
      if (response.data.success) {
        setStats({
          totalRevenue: response.data.totalRevenue || 0,
          totalOrders: response.data.totalOrders || 0,
          totalShipments: response.data.totalShipments || 0,
          totalInvoices: response.data.totalInvoices || 0,
        });

        const revenueData = Object.entries(
          response.data.monthlyRevenue || {}
        ).map(([month, revenue]) => ({
          month,
          revenue,
        }));
        setMonthlyData(revenueData);

        setRecentInvoices(response.data.recentInvoices || []);

        if (response.data.invoices) {
          const merchantMap = {};
          response.data.invoices.forEach(invoice => {
            const merchantId = invoice.merchantId?._id || invoice.merchantId;
            if (merchantId) {
              if (!merchantMap[merchantId]) {
                merchantMap[merchantId] = {
                  id: merchantId,
                  name: invoice.merchantId?.name || "Unknown Merchant",
                  companyName: invoice.merchantId?.companyName || "-",
                  totalRevenue: 0
                };
              }
              merchantMap[merchantId].totalRevenue += (invoice.totalAmount || 0);
            }
          });
          
          const sortedMerchants = Object.values(merchantMap)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
          
          setTopMerchants(sortedMerchants);
        }
      }
      setLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.log("Error fetching revenue:", error);
      setError("Failed to load revenue data. Please try again.");
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate averages
  const avgOrderRevenue = stats.totalOrders > 0
    ? stats.totalRevenue / stats.totalOrders
    : 0;

  const avgShipmentRevenue = stats.totalShipments > 0
    ? stats.totalRevenue / stats.totalShipments
    : 0;

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      PAID: "revenue-status-paid",
      PENDING: "revenue-status-pending",
      FAILED: "revenue-status-failed",
    };
    return statusMap[status] || "revenue-status-default";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      PAID: "Paid",
      PENDING: "Pending",
      FAILED: "Failed",
    };
    return statusMap[status] || status || "Unknown";
  };

  if (loading) {
    return (
      <div className="revenue-container">
        <AdminSidebar />
        <div className="revenue-content">
          <AdminTopbar />
          <div className="revenue-loading">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-container">
      <AdminSidebar />
      <div className="revenue-content">
        <AdminTopbar />

        {/* Header */}
        <div className="revenue-header">
          <div className="revenue-header-left">
            <h1 className="revenue-header-title">Revenue Analytics</h1>
            <p className="revenue-header-subtitle">Monitor revenue, commissions and financial performance</p>
          </div>
          <div className="revenue-header-actions">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="revenue-select"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
            <button 
              onClick={() => fetchRevenue(true)} 
              className="revenue-refresh-btn"
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? "revenue-refresh-btn-spin" : ""} size={14} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="revenue-error">
            <span className="revenue-error-icon">⚠️</span>
            <span className="revenue-error-text">{error}</span>
            <button onClick={() => fetchRevenue()} className="revenue-error-btn">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards - 4 Cards */}
        <div className="revenue-stats-grid">
          <div className="revenue-stat-card">
            <div className="revenue-stat-info">
              <div className="revenue-stat-label">Total Revenue</div>
              <h2 className="revenue-stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</h2>
            </div>
            <div className="revenue-stat-icon revenue-stat-icon-green">
              <FaRupeeSign color="#10b981" size={20} />
            </div>
          </div>

          <div className="revenue-stat-card">
            <div className="revenue-stat-info">
              <div className="revenue-stat-label">Total Orders</div>
              <h2 className="revenue-stat-value">{(stats.totalOrders || 0).toLocaleString()}</h2>
            </div>
            <div className="revenue-stat-icon revenue-stat-icon-blue">
              <FaChartLine color="#3b82f6" size={20} />
            </div>
          </div>

          <div className="revenue-stat-card">
            <div className="revenue-stat-info">
              <div className="revenue-stat-label">Total Shipments</div>
              <h2 className="revenue-stat-value">{(stats.totalShipments || 0).toLocaleString()}</h2>
            </div>
            <div className="revenue-stat-icon revenue-stat-icon-yellow">
              <FaMoneyBillWave color="#f59e0b" size={20} />
            </div>
          </div>

          <div className="revenue-stat-card">
            <div className="revenue-stat-info">
              <div className="revenue-stat-label">Total Invoices</div>
              <h2 className="revenue-stat-value">{(stats.totalInvoices || 0).toLocaleString()}</h2>
            </div>
            <div className="revenue-stat-icon revenue-stat-icon-indigo">
              <FaWallet color="#6366f1" size={20} />
            </div>
          </div>
        </div>

        {/* Average Revenue Metrics */}
        <div className="revenue-avg-row">
          <div className="revenue-avg-card">
            <div className="revenue-avg-info">
              <div className="revenue-avg-label">Average Revenue / Order</div>
              <h3 className="revenue-avg-value">₹{avgOrderRevenue.toFixed(2)}</h3>
            </div>
            <div className="revenue-avg-icon">
              <FaCalculator color="#64748b" size={18} />
            </div>
          </div>
          <div className="revenue-avg-card">
            <div className="revenue-avg-info">
              <div className="revenue-avg-label">Average Revenue / Shipment</div>
              <h3 className="revenue-avg-value">₹{avgShipmentRevenue.toFixed(2)}</h3>
            </div>
            <div className="revenue-avg-icon">
              <FaCalculator color="#64748b" size={18} />
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="revenue-chart-container">
          <h3 className="revenue-chart-title">Revenue Trend</h3>
          {monthlyData.length > 1 ? (
            <div className="revenue-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="revenue-chart-empty">
              <div className="revenue-chart-empty-icon">📊</div>
              <div className="revenue-chart-empty-text">
                {monthlyData.length === 0 
                  ? "No revenue data available yet" 
                  : "Not enough data for trend analysis"}
              </div>
              <div className="revenue-chart-empty-sub">
                {monthlyData.length === 0 
                  ? "Revenue data will appear here as transactions are processed"
                  : "Need at least 2 months of data to show trend"}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout: Recent Activity & Top Merchants */}
        <div className="revenue-two-col">
          {/* Recent Revenue Activity with Status */}
          <div className="revenue-table-container">
            <div className="revenue-table-header">
              <h3 className="revenue-table-title">Recent Revenue Activity</h3>
              <span className="revenue-table-count">
                Latest transactions
              </span>
            </div>
            <div className="revenue-table-wrapper">
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th className="revenue-th">Invoice</th>
                    <th className="revenue-th">Merchant</th>
                    <th className="revenue-th">Amount</th>
                    <th className="revenue-th">Status</th>
                    <th className="revenue-th">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice, index) => {
                      return (
                        <tr key={index} className="revenue-tr">
                          <td className="revenue-td">
                            <span className="revenue-td-invoice">
                              {invoice.invoiceNumber || `INV-${index + 1}`}
                            </span>
                          </td>
                          <td className="revenue-td">
                            <span className="revenue-td-merchant">
                              {invoice.merchantId?.name || "Unknown Merchant"}
                            </span>
                          </td>
                          <td className="revenue-td">
                            <span className="revenue-td-amount">
                              ₹{(invoice.totalAmount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="revenue-td">
                            <span className={`revenue-status-badge ${getStatusClass(invoice.status)}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="revenue-td">
                            {invoice.createdAt 
                              ? new Date(invoice.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="revenue-empty">
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Revenue Merchants */}
          <div className="revenue-table-container">
            <div className="revenue-table-header">
              <h3 className="revenue-table-title">Top Revenue Merchants</h3>
              <span className="revenue-table-count">
                {topMerchants.length} merchants
              </span>
            </div>
            <div className="revenue-table-wrapper">
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th className="revenue-th">Merchant</th>
                    <th className="revenue-th">Company</th>
                    <th className="revenue-th">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topMerchants.length > 0 ? (
                    topMerchants.map((merchant, index) => (
                      <tr key={index} className="revenue-tr">
                        <td className="revenue-td">
                          <span className="revenue-td-merchant">{merchant.name}</span>
                        </td>
                        <td className="revenue-td">{merchant.companyName || "-"}</td>
                        <td className="revenue-td">
                          <span className="revenue-td-amount">
                            ₹{merchant.totalRevenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="revenue-empty">
                        No merchant data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Revenue;