import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
    grossBilling: 0,
    totalCourierPayout: 0,
    netMargin: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats({
        totalUsers: res.data.totalUsers || 0,
        totalOrders: res.data.totalOrders || 0,
        totalShipments: res.data.totalShipments || 0,
        totalRevenue: res.data.totalRevenue || 0,
        grossBilling: res.data.grossBilling || res.data.totalRevenue || 0,
        totalCourierPayout: res.data.totalCourierPayout || 0,
        netMargin: res.data.netMargin || 0,
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="superadmin-dashboard-container">
        
        {/* HEADER SECTION */}
        <div className="superadmin-dashboard-header">
          <h1 className="superadmin-dashboard-title">
            Super Admin Dashboard
          </h1>
          <p className="superadmin-dashboard-subtitle">
            Complete platform monitoring, financial margins, and business analytics
          </p>
        </div>

        {/* FINANCIAL REVENUE ENGINE MARGINS */}
        <div className="superadmin-revenue-engine-grid">
          {/* GROSS BILLING */}
          <div className="revenue-box revenue-box-billing">
            <span className="revenue-box-tag">Gross GMV</span>
            <h3 className="revenue-box-label">Gross Merchant Billing</h3>
            <h1 className="revenue-box-value">₹{stats.grossBilling.toLocaleString()}</h1>
            <p className="revenue-box-sub">Total freight billed to merchants</p>
          </div>

          {/* COURIER PAYOUT */}
          <div className="revenue-box revenue-box-payout">
            <span className="revenue-box-tag">Courier Cost</span>
            <h3 className="revenue-box-label">Total Courier Payout</h3>
            <h1 className="revenue-box-value">₹{stats.totalCourierPayout.toLocaleString()}</h1>
            <p className="revenue-box-sub">Actual cost paid to courier partners</p>
          </div>

          {/* NET MARGIN PROFIT (HIGHLIGHTED) */}
          <div className="revenue-box revenue-box-margin highlight-profit">
            <span className="revenue-box-tag profit-badge">✨ Net Profit</span>
            <h3 className="revenue-box-label">Net Profit Margin</h3>
            <h1 className="revenue-box-value profit-value">₹{stats.netMargin.toLocaleString()}</h1>
            <p className="revenue-box-sub profit-sub">Platform earned margin (Sell Rate - Buy Rate)</p>
          </div>
        </div>

        {/* PRIMARY KPI METRIC CARDS */}
        <div className="superadmin-kpi-cards-grid">
          {/* USERS CARD */}
          <div className="superadmin-kpi-card superadmin-kpi-card-users">
            <h3 className="superadmin-kpi-card-label">
              Total Users
            </h3>
            <h1 className="superadmin-kpi-card-value">
              {stats.totalUsers.toLocaleString()}
            </h1>
          </div>

          {/* ORDERS CARD */}
          <div className="superadmin-kpi-card superadmin-kpi-card-orders">
            <h3 className="superadmin-kpi-card-label">
              Total Orders
            </h3>
            <h1 className="superadmin-kpi-card-value">
              {stats.totalOrders.toLocaleString()}
            </h1>
          </div>

          {/* SHIPMENTS CARD */}
          <div className="superadmin-kpi-card superadmin-kpi-card-shipments">
            <h3 className="superadmin-kpi-card-label">
              Total Shipments
            </h3>
            <h1 className="superadmin-kpi-card-value">
              {stats.totalShipments.toLocaleString()}
            </h1>
          </div>

          {/* REVENUE CARD */}
          <div className="superadmin-kpi-card superadmin-kpi-card-revenue">
            <h3 className="superadmin-kpi-card-label">
              Total Revenue
            </h3>
            <h1 className="superadmin-kpi-card-value">
              ₹{stats.totalRevenue.toLocaleString()}
            </h1>
          </div>
        </div>

        {/* PLATFORM OVERVIEW SECTION */}
        <div className="superadmin-overview-card">
          <div className="superadmin-overview-header">
            <h2 className="superadmin-overview-title">
              Platform Overview
            </h2>
          </div>

          <div className="superadmin-overview-grid">
            {/* SUB-ITEM USERS */}
            <div className="superadmin-sub-item superadmin-sub-item-users">
              <div className="superadmin-sub-item-label">
                Total Users
              </div>
              <h2 className="superadmin-sub-item-value">
                {stats.totalUsers.toLocaleString()}
              </h2>
            </div>

            {/* SUB-ITEM ORDERS */}
            <div className="superadmin-sub-item superadmin-sub-item-orders">
              <div className="superadmin-sub-item-label">
                Total Orders
              </div>
              <h2 className="superadmin-sub-item-value">
                {stats.totalOrders.toLocaleString()}
              </h2>
            </div>

            {/* SUB-ITEM SHIPMENTS */}
            <div className="superadmin-sub-item superadmin-sub-item-shipments">
              <div className="superadmin-sub-item-label">
                Total Shipments
              </div>
              <h2 className="superadmin-sub-item-value">
                {stats.totalShipments.toLocaleString()}
              </h2>
            </div>

            {/* SUB-ITEM REVENUE */}
            <div className="superadmin-sub-item superadmin-sub-item-revenue">
              <div className="superadmin-sub-item-label">
                Total Revenue
              </div>
              <h2 className="superadmin-sub-item-value">
                ₹{stats.totalRevenue.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;