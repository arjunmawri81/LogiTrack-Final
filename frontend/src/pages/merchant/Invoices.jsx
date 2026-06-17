import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaDownload } from "react-icons/fa";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/invoices/summary");
      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/invoices/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      {/* Sidebar with fixed width */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Invoices
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Manage and download billing invoices
          </p>
        </div>

        {/* Summary Cards */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                color: "#64748b",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Invoices
            </h3>
            <h2 style={{ color: "#0f172a" }}>{summary.totalInvoices}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                color: "#64748b",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Paid Invoices
            </h3>
            <h2 style={{ color: "#0f172a" }}>{summary.paidInvoices}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                color: "#64748b",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Pending Invoices
            </h3>
            <h2 style={{ color: "#0f172a" }}>{summary.pendingInvoices}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                color: "#64748b",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Revenue
            </h3>
            <h2 style={{ color: "#0f172a" }}>₹{summary.totalRevenue}</h2>
          </div>
        </div>

        {/* Invoice Table */}

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  color: "#fff",
                }}
              >
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Invoice No
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Order No
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  {/* Invoice Number */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <span
                      style={{
                        color: "#2563eb",
                        fontWeight: "700",
                        fontFamily: "monospace",
                      }}
                    >
                      {invoice.invoiceNumber}
                    </span>
                  </td>

                  {/* Order Number */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#334155",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {invoice.orderId?.orderNumber || "-"}
                  </td>

                  {/* Amount */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <span
                      style={{
                        color: "#0f172a",
                        fontWeight: "700",
                      }}
                    >
                      ₹{invoice.totalAmount}
                    </span>
                  </td>

                  {/* Status */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <span
                      style={{
                        background:
                          invoice.status === "PAID"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          invoice.status === "PAID"
                            ? "#166534"
                            : "#92400e",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#334155",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {new Date(
                      invoice.createdAt
                    ).toLocaleDateString()}
                  </td>

                  {/* Action */}
                  <td
                    style={{
                      padding: "16px",
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <button
                      onClick={() =>
                        downloadInvoice(invoice._id)
                      }
                      style={{
                        border: "none",
                        background: "#f97316",
                        color: "#fff",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "600",
                        boxShadow: "0 2px 6px rgba(249,115,22,0.25)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
              }}
            >
              No Invoices Found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;