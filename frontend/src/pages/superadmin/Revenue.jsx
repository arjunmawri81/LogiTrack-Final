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
      console.error("Error fetching financial analytics metadata:", error);
    }
  };

  // Base font framework rule across all page elements
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
            Revenue Analytics
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Platform revenue tracking and invoice analytics
          </p>
        </div>

        {/* REVENUE OVERVIEW CARD */}
        <div
          style={{
            width: "300px",
            background: "linear-gradient(135deg, #065f46, #10b981)",
            borderRadius: "16px",
            padding: "24px",
            color: "#ffffff",
            marginBottom: "35px",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#a7f3d0",
              marginBottom: "12px",
            }}
          >
            Total Revenue
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: "800",
              lineHeight: "1",
              letterSpacing: "-0.03em",
            }}
          >
            ₹{revenue.toLocaleString()}
          </div>
        </div>

        {/* INVOICES AND REVENUE DATA GRID */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            overflowX: "auto",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
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
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Invoice ID</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice._id} style={{ background: "#ffffff" }}>
                    
                    {/* Database Identity Row Element */}
                    <td 
                      style={{ 
                        ...tdStyle, 
                        fontFamily: "monospace", 
                        color: "#475569", 
                        fontSize: "13px", 
                        letterSpacing: "0.03em" 
                      }}
                    >
                      {invoice._id}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontWeight: "600",
                          fontSize: "12px",
                          display: "inline-block",
                          letterSpacing: "0.02em",
                        }}
                      >
                        ₹{invoice.amount?.toLocaleString()}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, color: "#64748b" }}>
                      {invoice.createdAt 
                        ? new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })
                        : "—"
                      }
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: "#94a3b8",
                      background: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    No Revenue Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Layout Specific CSS Metrics Definitions
const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  color: "#475569",
  fontWeight: "600",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "500",
  borderBottom: "1px solid #f1f5f9",
};

export default Revenue;