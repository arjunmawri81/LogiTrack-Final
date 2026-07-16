import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Dashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalShipments: 0,
    deliveredShipments: 0,
    totalNDR: 0,
    totalRTO: 0,
    walletBalance: 0,
    totalRevenue: 0,
    codRevenue: 0,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/reports/dashboard");

      setStats({
        totalOrders: data.orders?.totalOrders || 0,
        pendingOrders: data.orders?.pendingOrders || 0,
        deliveredOrders: data.orders?.deliveredOrders || 0,
        totalShipments: data.shipments?.totalShipments || 0,
        deliveredShipments: data.shipments?.deliveredShipments || 0,
        totalNDR: data.ndr?.totalNDR || 0,
        totalRTO: data.rto?.totalRTO || 0,
        walletBalance: data.wallet?.balance || 0,
        totalRevenue: data.revenue?.totalRevenue || 0,
        codRevenue: data.revenue?.codRevenue || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <Sidebar />
      </div>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome Back, {user?.name || "Merchant"}</h1>
            <p className="dashboard-subtitle">Manage shipments and activity.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card card-blue">
            <h4>TOTAL ORDERS</h4>
            <h1>{stats.totalOrders}</h1>
          </div>
          <div className="dashboard-card card-green">
            <h4>TOTAL SHIPMENTS</h4>
            <h1>{stats.totalShipments}</h1>
          </div>
          <div className="dashboard-card card-orange">
            <h4>TOTAL NDR</h4>
            <h1>{stats.totalNDR}</h1>
          </div>
          <div className="dashboard-card card-red">
            <h4>TOTAL RTO</h4>
            <h1>{stats.totalRTO}</h1>
          </div>
          <div className="dashboard-card card-purple">
            <h4>COD REVENUE</h4>
            <h1>₹{stats.codRevenue}</h1>
          </div>
          <div className="dashboard-card card-dark">
            <h4>WALLET BALANCE</h4>
            <h1>₹{stats.walletBalance}</h1>
          </div>
        </div>

        {/* New White Professional Summary Cards */}
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">📋</div>
            <p className="dashboard-summary-label">Pending Orders</p>
            <h3 className="dashboard-summary-value">{stats.pendingOrders}</h3>
          </div>
          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">✅</div>
            <p className="dashboard-summary-label">Delivered Orders</p>
            <h3 className="dashboard-summary-value">{stats.deliveredOrders}</h3>
          </div>
          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">🚚</div>
            <p className="dashboard-summary-label">Delivered Shipments</p>
            <h3 className="dashboard-summary-value">{stats.deliveredShipments}</h3>
          </div>
          <div className="dashboard-summary-card">
            <div className="dashboard-summary-icon">💰</div>
            <p className="dashboard-summary-label">Total Revenue</p>
            <h3 className="dashboard-summary-value">₹{stats.totalRevenue}</h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;