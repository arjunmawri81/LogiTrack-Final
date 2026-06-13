import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaTruck, FaSearch, FaDownload, FaTimes } from "react-icons/fa";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState([]);
  
  // New States for QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shipments");
      setShipments(res.data.shipments || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED": return { background: "#dcfce7", color: "#166534" };
      case "RTO": return { background: "#fee2e2", color: "#991b1b" };
      case "NDR": return { background: "#fef3c7", color: "#92400e" };
      default: return { background: "#dbeafe", color: "#1d4ed8" };
    }
  };

  const downloadLabel = async (shipmentId, awb) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/label`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Label-${awb}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Label download failed");
    }
  };

  const handleOpenQR = async (shipmentId) => {
    try {
      const res = await api.get(`/shipments/${shipmentId}/qr`);
      // Updated Logic
      if (res.data?.qrCode) {
        setQrImage(res.data.qrCode);
        setShowQRModal(true);
      } else {
        alert("QR Code not found");
      }
    } catch (err) {
      alert("Failed to fetch QR Code");
    }
  };

  const filtered = shipments.filter(
    (s) =>
      s.awb?.toLowerCase().includes(search.toLowerCase()) ||
      (s.orderId?.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "20px", overflowX: "hidden" },
    card: { background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" },
    tableHead: { background: "#0f172a", color: "#ffffff", fontSize: "12px", textTransform: "uppercase" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" },
    btn: (bg) => ({ background: bg, color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "5px", fontSize: "12px", fontWeight: "600" })
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>

      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "20px" }}>Shipments Management</h1>

        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaTruck style={{ fontSize: "24px", color: "#2563eb" }} />
            <div>
              <h4 style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>TOTAL SHIPMENTS</h4>
              <h2 style={{ margin: 0 }}>{shipments.length}</h2>
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaSearch style={{ color: "#94a3b8" }} />
          <input type="text" placeholder="Search by AWB or Customer Name..." style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div style={{ ...s.card, overflowX: "auto", padding: 0 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>Loading Shipments...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={s.tableHead}>
                  {["AWB", "CUSTOMER", "COURIER", "STATUS", "DATE", "QR", "LABEL", "TIMELINE"].map((h) => (
                    <th key={h} style={{ padding: "16px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((shipment) => (
                    <tr key={shipment._id}>
                      <td style={s.td}><b>{shipment.awb}</b></td>
                      <td style={s.td}>{shipment.orderId?.customerName || "N/A"}</td>
                      <td style={s.td}>{shipment.courier}</td>
                      <td style={s.td}>
                        <span style={{ ...getStatusStyle(shipment.status), padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                          {shipment.status}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(shipment.createdAt).toLocaleDateString('en-GB')}</td>
                      <td style={s.td}>
                        <button onClick={() => handleOpenQR(shipment._id)} style={s.btn("#16a34a")}>QR</button>
                      </td>
                      <td style={s.td}>
                        <button onClick={() => downloadLabel(shipment._id, shipment.awb)} style={s.btn("#2563eb")}><FaDownload /></button>
                      </td>
                      <td style={s.td}>
                        <button onClick={async () => { try { const res = await api.get(`/shipments/${shipment._id}/timeline`); setSelectedTimeline(res.data.timeline); setShowModal(true); } catch (err) { alert("Timeline not available"); } }} style={s.btn("#f97316")}>View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center" }}>No Shipments Found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Timeline Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", width: "500px", maxHeight: "80vh", borderRadius: "16px", padding: "25px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Shipment Timeline</h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><FaTimes /></button>
            </div>
            <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
              {selectedTimeline?.length > 0 ? selectedTimeline.map((item, index) => (
                <div key={index} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{item.status}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", margin: "4px 0" }}>{item.remark}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.location} • {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</div>
                </div>
              )) : <p style={{ textAlign: "center", color: "#94a3b8" }}>No updates yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "16px", textAlign: "center" }}>
            <h3>Shipment QR Code</h3>
            <img src={qrImage} alt="Shipment QR" style={{ width: "250px", height: "250px" }} />
            <br />
            <button onClick={() => setShowQRModal(false)} style={{ marginTop: "15px", padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;