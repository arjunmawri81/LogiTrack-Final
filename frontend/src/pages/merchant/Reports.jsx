import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import {
  FaBox,
  FaRupeeSign,
  FaTruck,
} from "react-icons/fa";

const Reports = () => {
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

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
    },

    main: {
      flex: 1,
      marginLeft: "280px",
      padding: "30px",
      width: "calc(100% - 280px)",
      boxSizing: "border-box",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "30px",
    },

    statsCard: {
      background: "#fff",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },

    section: {
      background: "#fff",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      marginBottom: "20px",
    },

    reportGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
      gap: "16px",
      marginTop: "20px",
    },

    reportCard: {
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "18px",
      background: "#f8fafc",
    },

    reportTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "8px",
    },
  };

  const kpis = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: FaBox,
      color: "#2563eb",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue}`,
      icon: FaRupeeSign,
      color: "#16a34a",
    },
    {
      title: "Total Shipments",
      value: stats.totalShipments,
      icon: FaTruck,
      color: "#d97706",
    },
    {
      title: "COD Revenue",
      value: `₹${stats.codRevenue}`,
      icon: FaRupeeSign,
      color: "#f97316",
    },
  ];

  return (
    <div style={s.container}>
      <Sidebar />

      <main style={s.main}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Reports & Analytics
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Monitor orders, shipments, revenue and business performance
          </p>
        </div>

        {/* KPI Cards */}
        <div style={s.statsGrid}>
          {kpis.map((item, index) => (
            <div key={index} style={s.statsCard}>
              <item.icon
                size={28}
                color={item.color}
                style={{ marginBottom: "10px" }}
              />

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                {item.title}
              </div>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "#0f172a",
                  fontSize: "36px",
                  fontWeight: "700",
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Shipment Performance Section */}
        <div style={s.section}>
          <h2 style={{ color: "#0f172a", marginTop: 0, fontSize: "20px" }}>
            Shipment Performance
          </h2>

          <div style={s.reportGrid}>
            <div style={s.reportCard}>
              <div style={s.reportTitle}>Pending Orders</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {stats.pendingOrders}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>Delivered Orders</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {stats.deliveredOrders}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>Delivered Shipments</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {stats.deliveredShipments}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>NDR Cases</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {stats.totalNDR}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>RTO Cases</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {stats.totalRTO}
              </h2>
            </div>
          </div>
        </div>

        {/* Financial Summary Section */}
        <div style={s.section}>
          <h2 style={{ color: "#0f172a", marginTop: 0, fontSize: "20px" }}>
            Financial Summary
          </h2>

          <div style={s.reportGrid}>
            <div style={s.reportCard}>
              <div style={s.reportTitle}>Wallet Balance</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                ₹{stats.walletBalance}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>Total Revenue</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                ₹{stats.totalRevenue}
              </h2>
            </div>

            <div style={s.reportCard}>
              <div style={s.reportTitle}>COD Revenue</div>
              <h2
                style={{
                  color: "#0f172a",
                  margin: "6px 0 0",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                ₹{stats.codRevenue}
              </h2>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;