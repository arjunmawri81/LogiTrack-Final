import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const Revenue = () => {
  const [revenue, setRevenue] = useState(0);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await api.get("/admin/revenue");

      setRevenue(res.data.totalRevenue || 0);
      setInvoices(res.data.invoices || []);
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
          Revenue Analytics
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Platform revenue tracking and invoice analytics
        </p>
      </div>

      {/* REVENUE CARD */}
      <div
        style={{
          width: "320px",
          background:
            "linear-gradient(135deg,#22c55e,#16a34a)",
          borderRadius: "20px",
          padding: "22px",
          color: "#fff",
          marginBottom: "30px",
          boxShadow:
            "0 12px 25px rgba(34,197,94,.18)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            opacity: "0.9",
            marginBottom: "10px",
          }}
        >
          Total Revenue
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "800",
            lineHeight: "1",
          }}
        >
          ₹{revenue}
        </div>
      </div>

      {/* REVENUE TABLE */}
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
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Revenue Records
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
              <th style={thStyle}>Invoice ID</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  style={{
                    background: "#ffffff",
                  }}
                >
                  <td style={tdStyle}>
                    {invoice._id}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "7px 14px",
                        borderRadius: "999px",
                        fontWeight: "600",
                        fontSize: "13px",
                        display: "inline-block",
                      }}
                    >
                      ₹{invoice.amount}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {new Date(
                      invoice.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                    background: "#ffffff",
                    fontSize: "15px",
                  }}
                >
                  No Revenue Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
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

export default Revenue;