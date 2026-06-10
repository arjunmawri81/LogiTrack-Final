import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Commission = () => {
  const [commission, setCommission] = useState({
    totalRevenue: 0,
    commissionRate: 10,
    totalCommission: 0,
  });

  useEffect(() => {
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    try {
      const res = await api.get("/admin/commission");

      setCommission({
        totalRevenue: res.data.totalRevenue || 0,
        commissionRate: res.data.commissionRate || 10,
        totalCommission: res.data.totalCommission || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Commission Management
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Platform commission tracking and earnings analytics
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={cardBlue}>
          <div style={cardLabel}>
            Total Revenue
          </div>

          <div style={cardValue}>
            ₹{commission.totalRevenue}
          </div>
        </div>

        <div style={cardGreen}>
          <div style={cardLabel}>
            Commission Rate
          </div>

          <div style={cardValue}>
            {commission.commissionRate}%
          </div>
        </div>

        <div style={cardOrange}>
          <div style={cardLabel}>
            Total Commission
          </div>

          <div style={cardValue}>
            ₹{commission.totalCommission}
          </div>
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Commission Summary
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>
                Total Revenue
              </th>

              <th style={thStyle}>
                Commission Rate
              </th>

              <th style={thStyle}>
                Commission Earned
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>
                ₹{commission.totalRevenue}
              </td>

              <td style={tdStyle}>
                {commission.commissionRate}%
              </td>

              <td style={tdStyle}>
                ₹{commission.totalCommission}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const cardLabel = {
  fontSize: "14px",
  fontWeight: "500",
  opacity: "0.9",
  marginBottom: "10px",
};

const cardValue = {
  fontSize: "38px",
  fontWeight: "800",
  lineHeight: "1",
};

const cardBlue = {
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(37,99,235,.18)",
};

const cardGreen = {
  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(34,197,94,.18)",
};

const cardOrange = {
  background:
    "linear-gradient(135deg,#f97316,#ea580c)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(249,115,22,.18)",
};

const thStyle = {
  padding: "18px 24px",
  textAlign: "left",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#374151",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default Commission;