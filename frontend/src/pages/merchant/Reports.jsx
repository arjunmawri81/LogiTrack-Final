import Sidebar from "../../components/Sidebar";
import { FaBox, FaRupeeSign, FaTruck, FaDownload } from "react-icons/fa";

const Reports = () => {
  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "30px", overflowX: "hidden" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" },
    statsCard: { background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" },
    reportGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" },
    reportCard: { background: "#ffffff", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" },
    btn: { background: "#f97316", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }
  };

  const kpis = [
    { title: "Total Orders", val: "1,250", icon: FaBox, color: "#2563eb" },
    { title: "Total Revenue", val: "₹4.8L", icon: FaRupeeSign, color: "#16a34a" },
    { title: "Total Shipments", val: "1,120", icon: FaTruck, color: "#d97706" },
    { title: "Failed Deliveries", val: "24", icon: FaTruck, color: "#dc2626" }
  ];

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>

      <main style={s.main}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "28px", color: "#0f172a", margin: 0 }}>Reports & Analytics</h1>
            <p style={{ color: "#64748b" }}>Monitor shipments, revenue and courier performance</p>
          </div>
          <button style={{ ...s.btn, display: "flex", alignItems: "center", gap: "8px" }}><FaDownload /> Export</button>
        </div>

        {/* KPI Stats */}
        <div style={s.statsGrid}>
          {kpis.map((k, i) => (
            <div key={i} style={s.statsCard}>
              <k.icon style={{ fontSize: "24px", color: k.color }} />
              <h4 style={{ margin: 0, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>{k.title}</h4>
              <h2 style={{ margin: 0, fontSize: "24px" }}>{k.val}</h2>
            </div>
          ))}
        </div>

        {/* Report Cards */}
        <div style={s.reportGrid}>
          {["Shipment Report", "Revenue Report", "Courier Report", "COD Report"].map((title, i) => (
            <div key={i} style={s.reportCard}>
              <h3 style={{ margin: "0 0 10px 0" }}>{title}</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>Detailed performance insights for {title.toLowerCase()}.</p>
              <button style={{ ...s.btn, background: "#f1f5f9", color: "#1e293b", width: "100%" }}>Download PDF</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reports;