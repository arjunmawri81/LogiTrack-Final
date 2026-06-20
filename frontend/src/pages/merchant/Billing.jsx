import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [downloading, setDownloading] = useState(null); // ✅ Track which invoice is downloading

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
    fetchWallet();
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

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWalletBalance(res.data.wallet?.balance || 0);
    } catch (error) {
      console.log("WALLET ERROR =>", error);
      setWalletBalance(0);
    }
  };

  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || inv.amount || 0),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlySpend = invoices
    .filter((inv) => {
      const date = new Date(inv.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

  const getSortedInvoices = (invoiceList) => {
    const sorted = [...invoiceList];
    if (sortOrder === "NEWEST") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return sorted;
  };

  const filteredInvoices = getSortedInvoices(
    invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        invoice._id?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
  );

  // ✅ Fix 1: No alert, just console log
  const copyInvoiceNumber = (invoiceNumber) => {
    navigator.clipboard.writeText(invoiceNumber);
    console.log(`📋 Invoice ${invoiceNumber} copied to clipboard!`);
    // TODO: Add toast notification later
  };

  // ✅ Fix 2: Download with loading state
  const downloadInvoice = async (id) => {
    try {
      setDownloading(id);
      
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(
        `${baseUrl}/invoices/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("DOWNLOAD ERROR =>", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(null);
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
      fontFamily: "'Inter', -apple-system, sans-serif"
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "8px",
      color: "#0f172a",
    },
    subtitle: {
      fontSize: "14px",
      color: "#64748b",
      marginBottom: "25px",
    },
    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "30px",
    },
    card: {
      background: "#fff",
      padding: "18px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      transition: "transform 0.2s ease",
    },
    cardTitle: {
      color: "#64748b",
      fontSize: "12px",
      fontWeight: "500",
      marginBottom: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    },
    cardValue: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#0f172a",
    },
    cardSub: {
      fontSize: "11px",
      color: "#94a3b8",
      marginTop: "4px",
    },
    filterBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    searchInput: {
      flex: 1,
      minWidth: "180px",
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#fff",
    },
    filterSelect: {
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "#fff",
      cursor: "pointer",
      outline: "none",
      minWidth: "140px",
    },
    tableCard: {
      background: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    tableTitle: {
      padding: "18px 24px",
      fontSize: "18px",
      fontWeight: "600",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
    },
    tableCount: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#64748b",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      background: "#f8fafc",
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: "600",
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    },
    td: {
      padding: "12px 16px",
      borderTop: "1px solid #e2e8f0",
      fontSize: "14px",
      color: "#334155",
    },
    paid: {
      color: "#16a34a",
      fontWeight: "600",
      background: "#dcfce7",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      display: "inline-block",
    },
    pending: {
      color: "#d97706",
      fontWeight: "600",
      background: "#fef3c7",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      display: "inline-block",
    },
    btn: {
      background: "#0f172a",
      color: "#fff",
      border: "none",
      padding: "7px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s ease",
    },
    btnDisabled: {
      background: "#94a3b8",
      color: "#fff",
      border: "none",
      padding: "7px 14px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "not-allowed",
      opacity: 0.7,
    },
    invoiceNumber: {
      fontWeight: "600",
      color: "#0f172a",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    noData: {
      textAlign: "center",
      padding: "50px 20px",
      color: "#94a3b8",
      fontSize: "14px",
    },
    noDataTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#64748b",
      marginBottom: "8px",
    },
  };

  const styleTag = `
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .search-input:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
    .filter-select:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
    .btn-download:hover {
      background: #1e293b !important;
    }
    .invoice-number:hover {
      color: #f97316 !important;
    }
    @media (max-width: 768px) {
      .billing-content {
        padding: 16px !important;
      }
      .billing-cards {
        grid-template-columns: 1fr 1fr !important;
      }
      .filter-bar {
        flex-direction: column !important;
      }
      .filter-bar input,
      .filter-bar select {
        width: 100% !important;
      }
    }
  `;

  return (
    <>
      <style>{styleTag}</style>
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <Sidebar />
        </div>

        <div className="billing-content" style={styles.content}>
          <h1 style={styles.title}>Billing & Invoices</h1>
          <p style={styles.subtitle}>Manage your invoices and payment history</p>

          {/* Summary Cards */}
          <div className="billing-cards" style={styles.cards}>
            <div className="card-hover" style={styles.card}>
              <div style={styles.cardTitle}>Total Invoices</div>
              <div style={styles.cardValue}>{summary.totalInvoices}</div>
            </div>

            <div className="card-hover" style={styles.card}>
              <div style={styles.cardTitle}>Paid Invoices</div>
              <div style={{ ...styles.cardValue, color: "#16a34a" }}>
                {summary.paidInvoices}
              </div>
            </div>

            <div className="card-hover" style={styles.card}>
              <div style={styles.cardTitle}>Pending Invoices</div>
              <div style={{ ...styles.cardValue, color: "#d97706" }}>
                {summary.pendingInvoices}
              </div>
            </div>

            <div className="card-hover" style={styles.card}>
              <div style={styles.cardTitle}>Total Revenue</div>
              <div style={{ ...styles.cardValue, color: "#ea580c" }}>
                ₹{summary.totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="card-hover" style={{ ...styles.card, background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
              <div style={styles.cardTitle}>📋 Invoice Amount</div>
              <div style={{ ...styles.cardValue, color: "#0f172a" }}>
                ₹{totalInvoiceAmount.toLocaleString()}
              </div>
              <div style={styles.cardSub}>Total across all invoices</div>
            </div>

            <div className="card-hover" style={{ ...styles.card, background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", borderColor: "#bbf7d0" }}>
              <div style={{ ...styles.cardTitle, color: "#065f46" }}>💰 Wallet Balance</div>
              <div style={{ ...styles.cardValue, color: "#065f46" }}>₹{walletBalance.toLocaleString()}</div>
              <div style={styles.cardSub}>Available for shipments</div>
            </div>

            <div className="card-hover" style={{ ...styles.card, background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderColor: "#bfdbfe" }}>
              <div style={{ ...styles.cardTitle, color: "#1e40af" }}>📊 Monthly Spend</div>
              <div style={{ ...styles.cardValue, color: "#1e40af" }}>₹{monthlySpend.toLocaleString()}</div>
              <div style={styles.cardSub}>
                {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Search + Filter + Sort Bar */}
          <div className="filter-bar" style={styles.filterBar}>
            <input
              type="text"
              placeholder="🔍 Search by Invoice Number..."
              className="search-input"
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <select
              className="filter-select"
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">📋 All Status</option>
              <option value="PAID">✅ Paid</option>
              <option value="PENDING">⏳ Pending</option>
            </select>

            <select
              className="filter-select"
              style={styles.filterSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="NEWEST">🕐 Newest First</option>
              <option value="OLDEST">🕐 Oldest First</option>
            </select>
          </div>

          {/* Invoice Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableTitle}>
              <span>Invoice History</span>
              <span style={styles.tableCount}>
                {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
              </span>
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
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td style={styles.td}>
                        <span
                          className="invoice-number"
                          style={styles.invoiceNumber}
                          onClick={() => copyInvoiceNumber(invoice.invoiceNumber)}
                          title="Click to copy invoice number"
                        >
                          {invoice.invoiceNumber || invoice._id.slice(-8)}
                          <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "6px" }}>
                            📋
                          </span>
                        </span>
                      </td>

                      <td style={styles.td}>
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* ✅ Fix 3: Amount Formatting with toLocaleString */}
                      <td style={styles.td}>
                        <strong>₹{Number(invoice.totalAmount || invoice.amount || 0).toLocaleString()}</strong>
                      </td>

                      <td style={styles.td}>
                        <span style={invoice.status === "PAID" ? styles.paid : styles.pending}>
                          {invoice.status === "PAID" ? "✅ Paid" : "⏳ Pending"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          className="btn-download"
                          style={downloading === invoice._id ? styles.btnDisabled : styles.btn}
                          onClick={() => downloadInvoice(invoice._id)}
                          disabled={downloading === invoice._id}
                          onMouseEnter={(e) => {
                            if (downloading !== invoice._id) {
                              e.target.style.background = "#1e293b";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (downloading !== invoice._id) {
                              e.target.style.background = "#0f172a";
                            }
                          }}
                        >
                          {downloading === invoice._id ? (
                            <>⏳ Downloading...</>
                          ) : (
                            <>📄 Download PDF</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      {search || statusFilter !== "ALL" ? (
                        <>
                          <div style={styles.noDataTitle}>No matching invoices found</div>
                          <div>Try adjusting your search or filters</div>
                        </>
                      ) : (
                        <>
                          <div style={styles.noDataTitle}>📭 No invoices yet</div>
                          <div>Create shipments to generate invoices automatically</div>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Billing;