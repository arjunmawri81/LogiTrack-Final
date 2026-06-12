import { useState, useEffect } from "react";
import WarehouseSidebar from "./WarehouseSidebar";
import api from "../../services/api";
import jsPDF from "jspdf";

const Manifest = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalShipments: 0 });

  useEffect(() => {
    fetchManifestData();
  }, []);

  const fetchManifestData = async () => {
    try {
      const ordersRes = await api.get("/admin/orders");
      const orders = ordersRes.data.orders || [];

      setStats({
        totalOrders: orders.length,
        totalShipments: orders.filter((o) => o.status === "SHIPPED").length,
      });
    } catch (error) {
      console.log("Error fetching manifest data:", error);
    }
  };

  const downloadManifest = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("LOGITRACK MANIFEST", 20, 20);

    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 40);

    // Filtered dynamic data
    doc.text(`Total Orders: ${stats.totalOrders}`, 20, 50);
    doc.text(`Total Shipments: ${stats.totalShipments}`, 20, 60);

    doc.save("Manifest.pdf");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <WarehouseSidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1>Manifest Management</h1>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <p>Click below to generate and download the daily manifest report.</p>
          <button
            onClick={downloadManifest}
            style={{
              padding: "12px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Download Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manifest;