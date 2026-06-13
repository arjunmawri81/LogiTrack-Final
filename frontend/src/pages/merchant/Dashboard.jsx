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
    tableContainer: { background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "16px", color: "#64748b", fontSize: "13px", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", fontWeight: "600", color: "#334155" }
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

        <div style={s.tableContainer}>
          <h2 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "20px" }}>System Summary</h2>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Metric</th>
                <th style={s.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Total Orders", val: stats.totalOrders },
                { label: "Pending Orders", val: stats.pendingOrders },
                { label: "Delivered Orders", val: stats.deliveredOrders },
                { label: "Total Shipments", val: stats.totalShipments },
                { label: "Delivered Shipments", val: stats.deliveredShipments },
                { label: "Total NDR", val: stats.totalNDR },
                { label: "Total RTO", val: stats.totalRTO },
                { label: "Wallet Balance", val: `₹${stats.walletBalance}` },
                { label: "COD Revenue", val: `₹${stats.codRevenue}` },
                { label: "Total Revenue", val: `₹${stats.totalRevenue}` },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={s.td}>{row.label}</td>
                  <td style={{ ...s.td, color: "#0f172a" }}>{row.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;