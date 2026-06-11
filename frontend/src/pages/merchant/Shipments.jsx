import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import jsPDF from "jspdf";
import { FaTruck, FaSearch, FaDownload } from "react-icons/fa";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchShipments(); }, []);

  const fetchShipments = async () => {
    try {
      const res = await api.get("/shipments");
      setShipments(res.data.shipments || []);
    } catch (error) { console.log(error); }
  };

  const downloadLabel = (shipment) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("LOGITRACK SHIPPING LABEL", 20, 20);
    doc.setFontSize(12);
    doc.text(`AWB: ${shipment.awb}`, 20, 40);
    doc.text(`Customer: ${shipment.orderId?.customerName || "N/A"}`, 20, 50);
    doc.text(`Courier: ${shipment.courier || "N/A"}`, 20, 60);
    doc.save(`Label-${shipment.awb}.pdf`);
  };

  const filtered = shipments.filter(s => s.awb?.includes(search));

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "20px", overflowX: "hidden" },
    card: { background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" },
    tableHead: { background: "#0f172a", color: "#ffffff", fontSize: "12px", textTransform: "uppercase" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>
      
      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "20px" }}>Shipments Management</h1>
        
        {/* Stats */}
        <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaTruck style={{ fontSize: "24px", color: "#2563eb" }} />
                <div>
                    <h4 style={{ margin: 0, color: "#64748b" }}>TOTAL SHIPMENTS</h4>
                    <h2 style={{ margin: 0 }}>{shipments.length}</h2>
                </div>
            </div>
        </div>

        {/* Search */}
        <div style={{ background: "#ffffff", padding: "12px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaSearch style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="Search AWB..." style={{ border: "none", outline: "none", width: "100%" }} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Table - Responsive Wrapper */}
        <div style={{ ...s.card, overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={s.tableHead}>
                {["AWB", "CUSTOMER", "COURIER", "STATUS", "DATE", "LABEL"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((shipment) => (
                <tr key={shipment._id}>
                  <td style={s.td}>{shipment.awb}</td>
                  <td style={s.td}>{shipment.orderId?.customerName}</td>
                  <td style={s.td}>{shipment.courier}</td>
                  <td style={s.td}>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{shipment.status}</span>
                  </td>
                  <td style={s.td}>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button onClick={() => downloadLabel(shipment)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}><FaDownload /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Shipments;