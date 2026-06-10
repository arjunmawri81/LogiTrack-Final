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
      console.log(error);
    }
  };

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "25px" }}>
        <h1
          style={{
            fontSize: "40px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "8px",
            lineHeight: "1.1",
          }}
        >
          Super Admin Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Complete platform monitoring and business analytics
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "16px",
        }}
      >
        {/* USERS */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            padding: "18px",
            borderRadius: "18px",
            height: "110px",
            boxShadow:
              "0 10px 20px rgba(37,99,235,.18)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Total Users
          </h3>

          <h1
            style={{
              fontSize: "36px",
              margin: 0,
              fontWeight: "800",
            }}
          >
            {stats.totalUsers}
          </h1>
        </div>

        {/* ORDERS */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            padding: "18px",
            borderRadius: "18px",
            height: "110px",
            boxShadow:
              "0 10px 20px rgba(34,197,94,.18)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Total Orders
          </h3>

          <h1
            style={{
              fontSize: "36px",
              margin: 0,
              fontWeight: "800",
            }}
          >
            {stats.totalOrders}
          </h1>
        </div>

        {/* SHIPMENTS */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#f97316,#ea580c)",
            color: "#fff",
            padding: "18px",
            borderRadius: "18px",
            height: "110px",
            boxShadow:
              "0 10px 20px rgba(249,115,22,.18)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Total Shipments
          </h3>

          <h1
            style={{
              fontSize: "36px",
              margin: 0,
              fontWeight: "800",
            }}
          >
            {stats.totalShipments}
          </h1>
        </div>

        {/* REVENUE */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#7c3aed,#9333ea)",
            color: "#fff",
            padding: "18px",
            borderRadius: "18px",
            height: "110px",
            boxShadow:
              "0 10px 20px rgba(124,58,237,.18)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Total Revenue
          </h3>

          <h1
            style={{
              fontSize: "36px",
              margin: 0,
              fontWeight: "800",
            }}
          >
            ₹{stats.totalRevenue}
          </h1>
        </div>
      </div>

      {/* OVERVIEW */}
      <div
        style={{
          marginTop: "25px",
          background: "#ffffff",
          padding: "20px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 25px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "18px",
            fontSize: "24px",
          }}
        >
          Platform Overview
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(200px,1fr))",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              borderLeft:
                "4px solid #2563eb",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Total Users
            </div>

            <h2
              style={{
                marginTop: "8px",
                color: "#111827",
              }}
            >
              {stats.totalUsers}
            </h2>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              borderLeft:
                "4px solid #22c55e",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Total Orders
            </div>

            <h2
              style={{
                marginTop: "8px",
                color: "#111827",
              }}
            >
              {stats.totalOrders}
            </h2>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              borderLeft:
                "4px solid #f97316",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Total Shipments
            </div>

            <h2
              style={{
                marginTop: "8px",
                color: "#111827",
              }}
            >
              {stats.totalShipments}
            </h2>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "14px",
              borderRadius: "14px",
              borderLeft:
                "4px solid #9333ea",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Total Revenue
            </div>

            <h2
              style={{
                marginTop: "8px",
                color: "#111827",
              }}
            >
              ₹{stats.totalRevenue}
            </h2>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;