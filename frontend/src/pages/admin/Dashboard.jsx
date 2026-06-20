import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import { 
  FaUsers, 
  FaTruck, 
  FaRupeeSign, 
  FaBox, 
  FaStore, 
  FaClock, 
  FaCheckCircle, 
  FaChartLine,
  FaBell
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ========== STYLES ==========
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    mainContent: {
      flex: 1,
      marginLeft: "280px",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      padding: "20px 30px",
      minWidth: 0
    },
    headerBlock: {
      marginBottom: "30px"
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "35px"
    },
    card: {
      padding: "24px",
      borderRadius: "16px",
      color: "white",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer"
    },
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px"
    },
    cardLabel: {
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      opacity: 0.9
    },
    cardValue: {
      fontSize: "38px",
      fontWeight: "800",
      margin: 0,
      lineHeight: 1.2
    },
    overviewBox: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    overviewTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px"
    },
    statCard: {
      backgroundColor: "#f8fafc",
      padding: "16px",
      borderRadius: "12px",
      borderLeft: "4px solid",
      transition: "transform 0.2s",
      cursor: "pointer"
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "8px",
      letterSpacing: "0.05em",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0
    }
  };
  // ========== END OF STYLES ==========

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    pendingMerchants: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalShipments: 0,
    deliveredShipments: 0,
    totalRevenue: 0,
  });

  // Recent orders state only
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      if (response.data.success !== undefined) {
        setStats(response.data);
      } else if (response.data.data) {
        setStats(response.data.data);
      } else {
        setStats(response.data);
      }

      // Fetch recent orders - latest first
      const ordersRes = await api.get("/admin/orders");
      setRecentOrders(
        ordersRes.data.orders
          ?.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 5) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <p style={styles.headerSubtitle}>
            Complete platform monitoring, operational logs, and business analytics
          </p>
        </div>

        {/* 4 Main Cards */}
        <div style={styles.cardsGrid}>
          <div 
            style={{ ...styles.card, background: "linear-gradient(135deg, #1e40af, #3b82f6)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Users</span>
              <FaUsers size={22} />
            </div>
            <p style={styles.cardValue}>{formatNumber(stats.totalUsers)}</p>
          </div>

          <div 
            style={{ ...styles.card, background: "linear-gradient(135deg, #065f46, #10b981)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Orders</span>
              <FaBox size={22} />
            </div>
            <p style={styles.cardValue}>{formatNumber(stats.totalOrders)}</p>
          </div>

          <div 
            style={{ ...styles.card, background: "linear-gradient(135deg, #9a3412, #ea580c)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Shipments</span>
              <FaTruck size={22} />
            </div>
            <p style={styles.cardValue}>{formatNumber(stats.totalShipments)}</p>
          </div>

          <div 
            style={{ ...styles.card, background: "linear-gradient(135deg, #5b21b6, #8b5cf6)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>Total Revenue</span>
              <FaRupeeSign size={22} />
            </div>
            <p style={styles.cardValue}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Platform Overview with Additional Stats */}
        <div style={styles.overviewBox}>
          <h2 style={styles.overviewTitle}>
            <FaChartLine size={20} color="#3b82f6" />
            Platform Overview
          </h2>
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderLeftColor: "#2563eb" }}>
              <div style={styles.statLabel}>Total Users</div>
              <h2 style={styles.statValue}>{formatNumber(stats.totalUsers)}</h2>
            </div>
            
            <div style={{ ...styles.statCard, borderLeftColor: "#10b981" }}>
              <div style={styles.statLabel}>Total Orders</div>
              <h2 style={styles.statValue}>{formatNumber(stats.totalOrders)}</h2>
            </div>
            
            <div style={{ ...styles.statCard, borderLeftColor: "#f97316" }}>
              <div style={styles.statLabel}>Total Shipments</div>
              <h2 style={styles.statValue}>{formatNumber(stats.totalShipments)}</h2>
            </div>
            
            <div style={{ ...styles.statCard, borderLeftColor: "#9333ea" }}>
              <div style={styles.statLabel}>Total Revenue</div>
              <h2 style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</h2>
            </div>

            {/* 4 Additional Overview Cards */}
            <div style={{ ...styles.statCard, borderLeftColor: "#14b8a6" }}>
              <div style={styles.statLabel}>
                <FaStore size={12} />
                Total Merchants
              </div>
              <h2 style={styles.statValue}>{formatNumber(stats.totalMerchants)}</h2>
            </div>

            <div style={{ ...styles.statCard, borderLeftColor: "#ef4444" }}>
              <div style={styles.statLabel}>
                <FaClock size={12} />
                Pending Merchants
              </div>
              <h2 style={styles.statValue}>{formatNumber(stats.pendingMerchants)}</h2>
            </div>

            <div style={{ ...styles.statCard, borderLeftColor: "#f59e0b" }}>
              <div style={styles.statLabel}>
                <FaClock size={12} />
                Pending Orders
              </div>
              <h2 style={styles.statValue}>{formatNumber(stats.pendingOrders)}</h2>
            </div>

            <div style={{ ...styles.statCard, borderLeftColor: "#22c55e" }}>
              <div style={styles.statLabel}>
                <FaCheckCircle size={12} />
                Delivered Shipments
              </div>
              <h2 style={styles.statValue}>{formatNumber(stats.deliveredShipments)}</h2>
            </div>
          </div>
        </div>

        {/* Recent Activity Log - Premium Style with Bell Icon */}
        <div
          style={{
            background: "#fff",
            marginTop: "25px",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Premium Gradient Heading with Bell Icon */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              padding: "18px 22px",
              borderRadius: "14px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#fff",
              boxShadow: "0 8px 20px rgba(37,99,235,0.2)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaBell size={20} color="#fff" />
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#fff"
                  }}
                >
                  Recent Activity Log
                </h2>

                <p
                  style={{
                    marginTop: "4px",
                    color: "#dbeafe",
                    fontSize: "13px",
                    marginBottom: 0
                  }}
                >
                  Latest platform transactions and order activities
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/orders")}
              style={{
                background: "#fff",
                color: "#2563eb",
                border: "none",
                padding: "8px 18px",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "13px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0f4ff";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              View All
            </button>
          </div>

          {/* Compact Activity Rows */}
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div
                key={order._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  marginBottom: "8px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #eef2f6",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#2563eb";
                  e.currentTarget.style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#eef2f6";
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onClick={() => navigate(`/admin/orders/${order._id}`)}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#0f172a",
                      fontSize: "14px",
                    }}
                  >
                    Order Created
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      marginTop: "2px",
                      fontSize: "12px",
                    }}
                  >
                    {order.orderNumber}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#16a34a",
                      fontWeight: "700",
                      fontSize: "15px",
                    }}
                  >
                    ₹{order.amount}
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "11px",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "30px 0", color: "#94a3b8", textAlign: "center" }}>
              No recent activity
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;