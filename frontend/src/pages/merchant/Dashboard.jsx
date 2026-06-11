import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalShipments: 0,
    walletBalance: 0,
    totalRevenue: 0,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/reports/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ISME SIDEBAR AUR CONTENT KA WIDTH FIX KAR DIYA HAI
  const s = {
    page: { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "280px", flexShrink: 0 }, // Sidebar ki width fix
    main: { flex: 1, padding: "30px", overflowX: "hidden" }, // Content bachi hui jagah lega
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
      {/* SIDEBAR WRAPPER */}
      <div style={s.sidebar}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Welcome Back, {user?.name || "Merchant"}</h1>
            <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Manage shipments and activity.</p>
          </div>
          <button style={s.btn}>+ Create Shipment</button>
        </div>

        <div style={s.grid}>
          <div style={s.card("linear-gradient(135deg, #1e40af, #1d4ed8)")}>
            <h4 style={{ opacity: 0.9, fontSize: "13px", margin: "0 0 10px 0" }}>TOTAL ORDERS</h4>
            <h1 style={{ margin: 0 }}>{stats.totalOrders?.toLocaleString() || 0}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg, #065f46, #10b981)")}>
            <h4 style={{ opacity: 0.9, fontSize: "13px", margin: "0 0 10px 0" }}>TOTAL SHIPMENTS</h4>
            <h1 style={{ margin: 0 }}>{stats.totalShipments?.toLocaleString() || 0}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg, #c2410c, #ea580c)")}>
            <h4 style={{ opacity: 0.9, fontSize: "13px", margin: "0 0 10px 0" }}>WALLET BALANCE</h4>
            <h1 style={{ margin: 0 }}>₹{stats.walletBalance?.toLocaleString() || 0}</h1>
          </div>
          <div style={s.card("linear-gradient(135deg, #5b21b6, #7c3aed)")}>
            <h4 style={{ opacity: 0.9, fontSize: "13px", margin: "0 0 10px 0" }}>TOTAL REVENUE</h4>
            <h1 style={{ margin: 0 }}>₹{stats.totalRevenue?.toLocaleString() || 0}</h1>
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
                { label: "Total Shipments", val: stats.totalShipments },
                { label: "Wallet Balance", val: `₹${stats.walletBalance}` },
                { label: "Total Revenue", val: `₹${stats.totalRevenue}` },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={s.td}>{row.label}</td>
                  <td style={{...s.td, color: "#0f172a"}}>{row.val?.toLocaleString()}</td>
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