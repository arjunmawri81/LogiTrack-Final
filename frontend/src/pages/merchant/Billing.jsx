import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const Billing = () => {
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

      console.log("INVOICES =>", res.data);

      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.log("INVOICE ERROR =>", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/invoices/summary");

      console.log("SUMMARY =>", res.data);

      setSummary({
        totalInvoices: res.data.totalInvoices || 0,
        paidInvoices: res.data.paidInvoices || 0,
        pendingInvoices: res.data.pendingInvoices || 0,
        totalRevenue: res.data.totalRevenue || 0,
      });
    } catch (error) {
      console.log("SUMMARY ERROR =>", error);
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

      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
    }
  };

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f5f7fb",
    },

    sidebar: {
      width: "280px",
      flexShrink: 0,
    },

    content: {
      flex: 1,
      padding: "30px",
    },

    title: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "25px",
      color: "#0f172a",
    },

    cards: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
      gap: "20px",
      marginBottom: "30px",
    },

    card: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },

    cardTitle: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "10px",
    },

    cardValue: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
    },

    tableCard: {
      background: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },

    tableTitle: {
      padding: "20px",
      fontSize: "20px",
      fontWeight: "600",
      borderBottom: "1px solid #e2e8f0",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
    },

    th: {
      background: "#f8fafc",
      padding: "16px",
      textAlign: "left",
      fontSize: "13px",
      color: "#475569",
    },

    td: {
      padding: "16px",
      borderTop: "1px solid #e2e8f0",
    },

    paid: {
      color: "green",
      fontWeight: "700",
    },

    pending: {
      color: "orange",
      fontWeight: "700",
    },

    btn: {
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "8px 15px",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Sidebar />
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>
          Billing & Invoices
        </h1>

        {/* Summary Cards */}

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Total Invoices
            </div>

            <div style={styles.cardValue}>
              {summary.totalInvoices}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Paid Invoices
            </div>

            <div style={styles.cardValue}>
              {summary.paidInvoices}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Pending Invoices
            </div>

            <div style={styles.cardValue}>
              {summary.pendingInvoices}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Total Revenue
            </div>

            <div style={styles.cardValue}>
              ₹{summary.totalRevenue}
            </div>
          </div>
        </div>

        {/* Invoice Table */}

        <div style={styles.tableCard}>
          <div style={styles.tableTitle}>
            Invoice History
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td style={styles.td}>
                      {invoice.invoiceNumber}
                    </td>

                    <td style={styles.td}>
                      {new Date(
                        invoice.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td style={styles.td}>
                      ₹{invoice.totalAmount}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          invoice.status === "PAID"
                            ? styles.paid
                            : styles.pending
                        }
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.btn}
                        onClick={() =>
                          downloadInvoice(
                            invoice._id
                          )
                        }
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No Invoices Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;