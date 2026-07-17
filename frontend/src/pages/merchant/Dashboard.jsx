import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
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

  // Format currency with Indian number formatting
  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("en-IN");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <Sidebar />
      </div>

      <main className="dashboard-main">
        {/*  Header with Wallet - No duplication */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome Back, {user?.name || "Merchant"}
          </h1>

          <div className="dashboard-wallet">
            <div className="dashboard-wallet-info">
              <FaWallet className="dashboard-wallet-icon" />
              <span className="dashboard-wallet-balance">
                ₹{formatCurrency(stats.walletBalance)}
              </span>
            </div>

            <button
              className="dashboard-wallet-btn"
              onClick={() => navigate("/merchant/wallet")}
            >
              Recharge Wallet
            </button>
          </div>
        </div>

       

        {/* Stats Cards - Removed Wallet Balance Card */}
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
            <h1>₹{formatCurrency(stats.codRevenue)}</h1>
          </div>
          {/* ✅ Removed Wallet Balance Card - Duplicate removed */}
          {/* Future: Add PICKUP PENDING / IN TRANSIT / OUT FOR DELIVERY here */}
        </div>

        {/* White Professional Summary Cards */}
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
            <h3 className="dashboard-summary-value">₹{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;