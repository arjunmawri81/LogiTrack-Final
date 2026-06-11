import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalShipments: 0,
    totalRevenue: 0,
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
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  };

  // Professional Typography Styling Object
  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  return (
    <SuperAdminLayout>
      <div style={{ ...fontStyle, maxWidth: "1400px", margin: "0 auto", padding: "10px" }}>
        
        {/* HEADER SECTION */}
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 6px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Super Admin Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Complete platform monitoring and business analytics
          </p>
        </div>

        {/* PRIMARY KPI METRIC CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* USERS CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
              color: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.15), 0 8px 10px -6px rgba(29, 78, 216, 0.15)",
              transition: "transform 0.2s ease",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#93c5fd", margin: "0 0 12px 0" }}>
              Total Users
            </h3>
            <h1 style={{ fontSize: "38px", fontWeight: "800", margin: 0, letterSpacing: "-0.03em" }}>
              {stats.totalUsers.toLocaleString()}
            </h1>
          </div>

          {/* ORDERS CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #065f46, #10b981)",
              color: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.15)",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", margin: "0 0 12px 0" }}>
              Total Orders
            </h3>
            <h1 style={{ fontSize: "38px", fontWeight: "800", margin: 0, letterSpacing: "-0.03em" }}>
              {stats.totalOrders.toLocaleString()}
            </h1>
          </div>

          {/* SHIPMENTS CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #c2410c, #ea580c)",
              color: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.15), 0 8px 10px -6px rgba(234, 88, 12, 0.15)",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffedd5", margin: "0 0 12px 0" }}>
              Total Shipments
            </h3>
            <h1 style={{ fontSize: "38px", fontWeight: "800", margin: 0, letterSpacing: "-0.03em" }}>
              {stats.totalShipments.toLocaleString()}
            </h1>
          </div>

          {/* REVENUE CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #5b21b6, #7c3aed)",
              color: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.15)",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#ddd6fe", margin: "0 0 12px 0" }}>
              Total Revenue
            </h3>
            <h1 style={{ fontSize: "38px", fontWeight: "800", margin: 0, letterSpacing: "-0.03em" }}>
              ₹{stats.totalRevenue.toLocaleString()}
            </h1>
          </div>
        </div>

        {/* PLATFORM OVERVIEW SECTION */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Platform Overview
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* SUB-ITEM USERS */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Users
              </div>
              <h2 style={{ marginTop: "10px", color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "8px 0 0 0" }}>
                {stats.totalUsers}
              </h2>
            </div>

            {/* SUB-ITEM ORDERS */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #10b981" }}>
              <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Orders
              </div>
              <h2 style={{ marginTop: "10px", color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "8px 0 0 0" }}>
                {stats.totalOrders}
              </h2>
            </div>

            {/* SUB-ITEM SHIPMENTS */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #f97316" }}>
              <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Shipments
              </div>
              <h2 style={{ marginTop: "10px", color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "8px 0 0 0" }}>
                {stats.totalShipments}
              </h2>
            </div>

            {/* SUB-ITEM REVENUE */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderLeft: "4px solid #8b5cf6" }}>
              <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Revenue
              </div>
              <h2 style={{ marginTop: "10px", color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "8px 0 0 0" }}>
                ₹{stats.totalRevenue}
              </h2>
            </div>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;