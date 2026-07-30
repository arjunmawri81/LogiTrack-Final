import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaWallet, 
  FaPlusCircle, 
  FaPlus, 
  FaTruck, 
  FaBoxOpen, 
  FaCalculator, 
  FaTags, 
  FaEye, 
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUndo
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Dashboard.css";

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

  const [recentShipments, setRecentShipments] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
    fetchRecentShipments();
  }, []);

  const fetchDashboardData = async () => {
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
      console.log("Error loading dashboard metrics:", error);
    }
  };

  const fetchRecentShipments = async () => {
    try {
      setLoadingRecent(true);
      const res = await api.get("/shipments");
      const list = res.data.shipments || [];
      setRecentShipments(list.slice(0, 5));
    } catch (error) {
      console.log("Error loading recent shipments:", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED": return { bg: "#dcfce7", color: "#15803d" };
      case "IN_TRANSIT": return { bg: "#dbeafe", color: "#1d4ed8" };
      case "OUT_FOR_DELIVERY": return { bg: "#eff6ff", color: "#2563eb" };
      case "NDR": return { bg: "#fef3c7", color: "#b45309" };
      case "RTO": return { bg: "#fee2e2", color: "#b91c1c" };
      case "PICKUP_PENDING": return { bg: "#fff7ed", color: "#c2410c" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <Sidebar />
      </div>

      <main className="dashboard-main">
        {/* HEADER & WALLET */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1 className="dashboard-title">
              Welcome Back, {user?.name || "Merchant"} 👋
            </h1>
            <p className="dashboard-subtitle">
              Here is your real-time shipping & order performance summary
            </p>
          </div>

          <div className="dashboard-wallet">
            <div className="dashboard-wallet-badge">
              <div className="dashboard-wallet-icon-box">
                <FaWallet className="dashboard-wallet-icon" />
              </div>
              <div className="dashboard-wallet-details">
                <span className="dashboard-wallet-label">Available Balance</span>
                <span className="dashboard-wallet-balance">
                  ₹{formatCurrency(stats.walletBalance)}
                </span>
              </div>
            </div>

            <button
              className="dashboard-wallet-btn"
              onClick={() => navigate("/merchant/wallet")}
            >
              <FaPlusCircle className="btn-plus-icon" /> Recharge Wallet
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS BAR */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <button
            onClick={() => navigate("/merchant/create-order")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
          >
            <FaPlus size={12} /> Create Order
          </button>

          <button
            onClick={() => navigate("/merchant/create-shipment")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#ea580c",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#c2410c"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#ea580c"}
          >
            <FaTruck size={13} /> Create Shipment
          </button>

          <button
            onClick={() => navigate("/merchant/bulk-shipment")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#ffffff",
              color: "#334155",
              border: "1.5px solid #cbd5e1",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#94a3b8"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <FaBoxOpen size={14} color="#64748b" /> Bulk Upload
          </button>

          <button
            onClick={() => navigate("/merchant/rate-calculator")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#ffffff",
              color: "#334155",
              border: "1.5px solid #cbd5e1",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#94a3b8"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <FaCalculator size={13} color="#64748b" /> Rate Calculator
          </button>

          <button
            onClick={() => navigate("/merchant/rate-card")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "#ffffff",
              color: "#334155",
              border: "1.5px solid #cbd5e1",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#94a3b8"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <FaTags size={13} color="#64748b" /> My Rate Cards
          </button>
        </div>

        {/* CORE METRICS GRID (4 CARDS) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          {/* Total Orders Card */}
          <div style={{
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(37, 99, 235, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Total Orders</span>
              <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(255,255,255,0.2)", color: "#ffffff", borderRadius: "10px", fontWeight: "700" }}>
                {stats.pendingOrders} Pending
              </span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", margin: "4px 0" }}>{stats.totalOrders}</h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: "500" }}>
              ✓ {stats.deliveredOrders} Orders Delivered
            </p>
          </div>

          {/* Total Shipments Card */}
          <div style={{
            background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(16, 185, 129, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Shipments</span>
              <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(255,255,255,0.2)", color: "#ffffff", borderRadius: "10px", fontWeight: "700" }}>
                {stats.deliveredShipments} Delivered
              </span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", margin: "4px 0" }}>{stats.totalShipments}</h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", margin: 0 }}>
              Active shipping dispatches
            </p>
          </div>

          {/* Exceptions (NDR & RTO) */}
          <div style={{
            background: "linear-gradient(135deg, #9a3412 0%, #ea580c 100%)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(234, 88, 12, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Exceptions</span>
              <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(255,255,255,0.2)", color: "#ffffff", borderRadius: "10px", fontWeight: "700" }}>
                NDR & RTO
              </span>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "baseline", marginTop: "4px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "700", display: "block" }}>NDR</span>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", margin: 0 }}>{stats.totalNDR}</h2>
              </div>
              <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "16px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "700", display: "block" }}>RTO</span>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", margin: 0 }}>{stats.totalRTO}</h2>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div style={{
            background: "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(168, 85, 247, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Total Revenue</span>
              <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(255,255,255,0.2)", color: "#ffffff", borderRadius: "10px", fontWeight: "700" }}>
                COD + Prepaid
              </span>
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", margin: "4px 0 2px" }}>
              ₹{formatCurrency(stats.totalRevenue)}
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", margin: 0 }}>
              COD Revenue: <strong style={{ color: "#ffffff" }}>₹{formatCurrency(stats.codRevenue)}</strong>
            </p>
          </div>
        </div>

        {/* RECENT SHIPMENTS TABLE */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Recent Shipments
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>
                Latest dispatched packages and live delivery status
              </p>
            </div>

            <button
              onClick={() => navigate("/merchant/shipments")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#2563eb",
                cursor: "pointer"
              }}
            >
              View All Shipments <FaArrowRight size={11} />
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            {loadingRecent ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Loading recent shipments...
              </div>
            ) : recentShipments.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "600" }}>
                    <th style={{ padding: "14px 24px" }}>AWB Number</th>
                    <th style={{ padding: "14px 20px" }}>Customer</th>
                    <th style={{ padding: "14px 20px" }}>Courier</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                    <th style={{ padding: "14px 20px" }}>Date</th>
                    <th style={{ padding: "14px 24px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentShipments.map((shipment) => {
                    const badge = getStatusBadge(shipment.status);
                    return (
                      <tr key={shipment._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 24px", fontWeight: "700", color: "#0f172a" }}>
                          {shipment.awb}
                        </td>
                        <td style={{ padding: "16px 20px", color: "#334155" }}>
                          {shipment.orderId?.customerName || "N/A"}
                        </td>
                        <td style={{ padding: "16px 20px", color: "#475569" }}>
                          {shipment.courier || "-"}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: badge.bg,
                            color: badge.color
                          }}>
                            {shipment.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", color: "#64748b" }}>
                          {new Date(shipment.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <button
                            onClick={() => navigate(`/merchant/shipments/${shipment._id}`)}
                            style={{
                              padding: "6px 14px",
                              background: "#f1f5f9",
                              color: "#334155",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <FaEye size={11} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                No recent shipments found. Click <strong>Create Order</strong> or <strong>Create Shipment</strong> above to get started!
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;