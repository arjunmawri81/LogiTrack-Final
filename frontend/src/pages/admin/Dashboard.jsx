import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import { 
  FaUsers, 
  FaTruck, 
  FaRupeeSign, 
  FaBox, 
  FaStore, 
  FaClock, 
  FaCheckCircle, 
  FaChartLine,
  FaBell
} from "react-icons/fa";
import "./Dashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    pendingMerchants: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalShipments: 0,
    deliveredShipments: 0,
    totalRevenue: 0,
  });

  // Recent orders state only
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      if (response.data.success !== undefined) {
        setStats(response.data);
      } else if (response.data.data) {
        setStats(response.data.data);
      } else {
        setStats(response.data);
      }

      // Fetch recent orders - latest first
      const ordersRes = await api.get("/admin/orders");
      setRecentOrders(
        ordersRes.data.orders
          ?.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 5) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />
      <div className="dashboard-main">
        <AdminTopbar />

        <div className="dashboard-header-block">
          <h1 className="dashboard-header-title">Admin Dashboard</h1>
          <p className="dashboard-header-subtitle">
            Complete platform monitoring, operational logs, and business analytics
          </p>
        </div>

        {/* 4 Main Cards */}
        <div className="dashboard-cards-grid">
          <div className="dashboard-card dashboard-card-blue">
            <div className="dashboard-card-top">
              <span className="dashboard-card-label">Total Users</span>
              <FaUsers size={22} />
            </div>
            <p className="dashboard-card-value">{formatNumber(stats.totalUsers)}</p>
          </div>

          <div className="dashboard-card dashboard-card-green">
            <div className="dashboard-card-top">
              <span className="dashboard-card-label">Total Orders</span>
              <FaBox size={22} />
            </div>
            <p className="dashboard-card-value">{formatNumber(stats.totalOrders)}</p>
          </div>

          <div className="dashboard-card dashboard-card-orange">
            <div className="dashboard-card-top">
              <span className="dashboard-card-label">Total Shipments</span>
              <FaTruck size={22} />
            </div>
            <p className="dashboard-card-value">{formatNumber(stats.totalShipments)}</p>
          </div>

          <div className="dashboard-card dashboard-card-purple">
            <div className="dashboard-card-top">
              <span className="dashboard-card-label">Total Revenue</span>
              <FaRupeeSign size={22} />
            </div>
            <p className="dashboard-card-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Platform Overview with Additional Stats */}
        <div className="dashboard-overview-box">
          <h2 className="dashboard-overview-title">
            <FaChartLine size={20} color="#3b82f6" />
            Platform Overview
          </h2>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card dashboard-stat-blue">
              <div className="dashboard-stat-label">Total Users</div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.totalUsers)}</h2>
            </div>
            
            <div className="dashboard-stat-card dashboard-stat-green">
              <div className="dashboard-stat-label">Total Orders</div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.totalOrders)}</h2>
            </div>
            
            <div className="dashboard-stat-card dashboard-stat-orange">
              <div className="dashboard-stat-label">Total Shipments</div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.totalShipments)}</h2>
            </div>
            
            <div className="dashboard-stat-card dashboard-stat-purple">
              <div className="dashboard-stat-label">Total Revenue</div>
              <h2 className="dashboard-stat-value">{formatCurrency(stats.totalRevenue)}</h2>
            </div>

            {/* 4 Additional Overview Cards */}
            <div className="dashboard-stat-card dashboard-stat-teal">
              <div className="dashboard-stat-label">
                <FaStore size={12} />
                Total Merchants
              </div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.totalMerchants)}</h2>
            </div>

            <div className="dashboard-stat-card dashboard-stat-red">
              <div className="dashboard-stat-label">
                <FaClock size={12} />
                Pending Merchants
              </div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.pendingMerchants)}</h2>
            </div>

            <div className="dashboard-stat-card dashboard-stat-yellow">
              <div className="dashboard-stat-label">
                <FaClock size={12} />
                New Orders
              </div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.pendingOrders)}</h2>
            </div>

            <div className="dashboard-stat-card dashboard-stat-emerald">
              <div className="dashboard-stat-label">
                <FaCheckCircle size={12} />
                Delivered Shipments
              </div>
              <h2 className="dashboard-stat-value">{formatNumber(stats.deliveredShipments)}</h2>
            </div>
          </div>
        </div>

        {/* Recent Activity Log - Premium Style with Bell Icon */}
        <div className="dashboard-activity-box">
          <div className="dashboard-activity-header">
            <div className="dashboard-activity-header-left">
              <div className="dashboard-activity-icon-wrapper">
                <FaBell size={20} color="#fff" />
              </div>
              <div>
                <h2 className="dashboard-activity-title">
                  Recent Activity Log
                </h2>
                <p className="dashboard-activity-subtitle">
                  Latest platform transactions and order activities
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/orders")}
              className="dashboard-view-all-btn"
            >
              View All
            </button>
          </div>

          {/* Compact Activity Rows */}
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div
                key={order._id}
                className="dashboard-activity-row"
                onClick={() => navigate(`/admin/orders/${order._id}`)}
              >
                <div>
                  <div className="dashboard-activity-order-name">
                    Order Created
                  </div>
                  <div className="dashboard-activity-order-number">
                    {order.orderNumber}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="dashboard-activity-order-amount">
                    ₹{order.amount}
                  </div>
                  <div className="dashboard-activity-order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="dashboard-activity-empty">
              No recent activity
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;