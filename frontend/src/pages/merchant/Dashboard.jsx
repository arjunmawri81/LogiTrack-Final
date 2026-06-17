import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

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

  const s = {
    page: { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "280px", flexShrink: 0 },
    main: { flex: 1, padding: "30px", overflowX: "hidden" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 },
    btn: { background: "#f97316", color: "white", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "600", cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "35px" },
    card: (bg) => ({ background: bg, padding: "24px", borderRadius: "16px", color: "white", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }),
    
    // New summary cards grid
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginTop: "25px"
    },
    summaryCard: {
      background: "#ffffff",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    },
    summaryLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#64748b",
      margin: "0 0 8px 0"
    },
    summaryValue: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    summaryIcon: {
      fontSize: "24px",
      marginBottom: "12px"
    }
  };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <Sidebar />
      </div>

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Welcome Back, {user?.name || "Merchant"}</h1>
            <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Manage shipments and activity.</p>
          </div>
          <button
            style={s.btn}
            onClick={() => navigate("/merchant/create-shipment")}
          >
            + Create Shipment
          </button>
        </div>

        <div style={s.grid}>
          <div style={s.card("linear-gradient(135deg,#1e40af,#2563eb)")}>
            <h4>TOTAL ORDERS</h4>
            <h1>{stats.totalOrders}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg,#065f46,#10b981)")}>
            <h4>TOTAL SHIPMENTS</h4>
            <h1>{stats.totalShipments}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg,#b45309,#f59e0b)")}>
            <h4>TOTAL NDR</h4>
            <h1>{stats.totalNDR}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg,#991b1b,#ef4444)")}>
            <h4>TOTAL RTO</h4>
            <h1>{stats.totalRTO}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg,#7c3aed,#8b5cf6)")}>
            <h4>COD REVENUE</h4>
            <h1>₹{stats.codRevenue}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg,#0f172a,#334155)")}>
            <h4>WALLET BALANCE</h4>
            <h1>₹{stats.walletBalance}</h1>
          </div>
        </div>

        {/* New White Professional Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>📋</div>
            <p style={s.summaryLabel}>Pending Orders</p>
            <h3 style={s.summaryValue}>{stats.pendingOrders}</h3>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>✅</div>
            <p style={s.summaryLabel}>Delivered Orders</p>
            <h3 style={s.summaryValue}>{stats.deliveredOrders}</h3>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>🚚</div>
            <p style={s.summaryLabel}>Delivered Shipments</p>
            <h3 style={s.summaryValue}>{stats.deliveredShipments}</h3>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>💰</div>
            <p style={s.summaryLabel}>Total Revenue</p>
            <h3 style={s.summaryValue}>₹{stats.totalRevenue}</h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;