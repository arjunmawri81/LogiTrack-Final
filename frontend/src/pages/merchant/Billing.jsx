import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaDownload, FaSearch, FaFilter, FaWallet, FaFileInvoice, FaCheckCircle, FaClock, FaRupeeSign } from "react-icons/fa";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [dateFilter, setDateFilter] = useState("ALL_TIME");
  const [downloading, setDownloading] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchInvoices(), fetchSummary(), fetchWallet()]);
    } catch (error) {
      console.log("FETCH ERROR =>", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.log("INVOICE ERROR =>", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/invoices/summary");
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

  const getDateFilteredInvoices = (invoiceList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return invoiceList.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      
      switch (dateFilter) {
        case "TODAY":
          return invDate >= today;
        case "LAST_7_DAYS":
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return invDate >= sevenDaysAgo;
        case "THIS_MONTH":
          return invDate.getMonth() === now.getMonth() && 
                 invDate.getFullYear() === now.getFullYear();
        case "ALL_TIME":
        default:
          return true;
      }
    });
  };

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
    getDateFilteredInvoices(
      invoices.filter((invoice) => {
        const matchesSearch =
          invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
          invoice.shipmentId?.awb?.toLowerCase().includes(search.toLowerCase()) ||
          invoice._id?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL"
            ? true
            : invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    )
  );

  const copyInvoiceNumber = (invoiceNumber) => {
    navigator.clipboard.writeText(invoiceNumber);
    // You can add toast notification here
  };

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

  // Styles
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
      width: "280px",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      padding: "30px",
      overflowX: "hidden",
    },
    pageTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "#64748b",
      marginBottom: "24px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      marginBottom: "24px",
    },
    statCard: (bgColor = "#ffffff", borderColor = "#e2e8f0") => ({
      background: bgColor,
      padding: "16px 20px",
      borderRadius: "14px",
      border: `1px solid ${borderColor}`,
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      transition: "all 0.2s ease",
    }),
    statIcon: (color) => ({
      fontSize: "20px",
      color: color,
      marginBottom: "6px",
    }),
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0f172a",
    },
    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    },
    searchWrapper: {
      background: "#ffffff",
      padding: "8px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      transition: "all 0.2s ease",
      flexWrap: "wrap",
    },
    searchInput: {
      border: "none",
      outline: "none",
      flex: 1,
      fontSize: "14px",
      padding: "12px 0",
      background: "transparent",
      minWidth: "200px",
    },
    filterSelect: {
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
      fontWeight: "500",
      color: "#334155",
      background: "#ffffff",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.2s ease",
      minWidth: "140px",
    },
    tableCard: {
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    tableHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e2e8f0",
      background: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
    },
    tableTitle: {
      margin: 0,
      color: "#0f172a",
      fontSize: "18px",
      fontWeight: "700",
    },
    tableCount: {
      fontSize: "13px",
      fontWeight: "400",
      color: "#64748b",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "900px",
    },
    th: {
      padding: "14px 16px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "600",
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
    },
    td: {
      padding: "14px 16px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
      background: "#ffffff",
    },
    statusBadge: (status) => ({
      padding: "4px 12px",
      borderRadius: "100px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
      background: status === "PAID" ? "#dcfce7" : "#fef3c7",
      color: status === "PAID" ? "#166534" : "#92400e",
    }),
    invoiceNumber: {
      fontWeight: "600",
      color: "#2563eb",
      fontFamily: "monospace",
      fontSize: "13px",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    btn: (bg = "#0f172a") => ({
      background: bg,
      color: "#fff",
      border: "none",
      padding: "8px 12px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    }),
    btnDisabled: {
      background: "#94a3b8",
      color: "#fff",
      border: "none",
      padding: "8px 12px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "not-allowed",
      opacity: 0.7,
    },
    noData: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#94a3b8",
    },
    noDataTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#64748b",
      marginBottom: "8px",
    },
    amount: {
      fontWeight: "700",
      color: "#0f172a",
    },
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      padding: "18px 24px",
      borderTop: "1px solid #e2e8f0",
      fontSize: "14px",
      color: "#64748b",
    },
    paymentMethod: {
      fontSize: "13px",
      fontWeight: "500",
    },
    awbText: {
      fontWeight: "600",
      color: "#2563eb",
      fontFamily: "monospace",
      fontSize: "13px",
    },
  };

  const desktopStyles = `
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .search-wrapper:focus-within {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    select:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    tr:hover td {
      background: #f8fafc !important;
    }

    button:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    button:active {
      transform: translateY(0);
    }

    .invoice-number:hover {
      color: #f97316 !important;
    }

    @media (min-width: 768px) {
      .billing-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .billing-content {
        padding: 30px !important;
      }
    }

    @media (max-width: 768px) {
      .billing-content {
        padding: 16px !important;
      }
      .stats-grid {
        grid-template-columns: 1fr 1fr !important;
      }
      .search-wrapper {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .search-wrapper input,
      .search-wrapper select {
        width: 100% !important;
      }
    }
  `;

  return (
    <>
      <style>{desktopStyles}</style>
      <div className="billing-container" style={styles.container}>
        <div className="sidebar-wrapper" style={styles.sidebar}>
          <Sidebar />
        </div>

        <div className="billing-content" style={styles.content}>
          <h1 style={styles.pageTitle}>Billing & Invoices</h1>
          <p style={styles.pageSubtitle}>Manage your invoices and payment history</p>

          {/* Statistics Cards - Only 5 cards */}
          <div className="stats-grid" style={styles.statsGrid}>
            <div className="stat-card" style={styles.statCard("#ecfdf5", "#bbf7d0")}>
              <FaWallet style={styles.statIcon("#065f46")} />
              <div style={{ ...styles.statValue, color: "#065f46" }}>₹{walletBalance.toLocaleString()}</div>
              <div style={styles.statLabel}>Wallet Balance</div>
            </div>

            <div className="stat-card" style={styles.statCard()}>
              <FaRupeeSign style={styles.statIcon("#ea580c")} />
              <div style={{ ...styles.statValue, color: "#ea580c" }}>₹{summary.totalRevenue.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Billing</div>
            </div>

            <div className="stat-card" style={styles.statCard()}>
              <FaFileInvoice style={styles.statIcon("#2563eb")} />
              <div style={styles.statValue}>{summary.totalInvoices}</div>
              <div style={styles.statLabel}>Total Invoices</div>
            </div>

            <div className="stat-card" style={styles.statCard()}>
              <FaCheckCircle style={styles.statIcon("#16a34a")} />
              <div style={{ ...styles.statValue, color: "#16a34a" }}>{summary.paidInvoices}</div>
              <div style={styles.statLabel}>Paid</div>
            </div>

            <div className="stat-card" style={styles.statCard()}>
              <FaClock style={styles.statIcon("#d97706")} />
              <div style={{ ...styles.statValue, color: "#d97706" }}>{summary.pendingInvoices}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="search-wrapper" style={styles.searchWrapper}>
            <FaSearch style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search Invoice No / AWB / Transaction ID..."
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <FaFilter style={{ color: "#94a3b8", fontSize: "14px" }} />
              <select
                style={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>

              <select
                style={styles.filterSelect}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>

              <select
                style={styles.filterSelect}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL_TIME">All Time</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="THIS_MONTH">This Month</option>
              </select>
            </div>
          </div>

          {/* Invoice Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>
                Invoice History
                <span style={styles.tableCount}>
                  ({filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'})
                </span>
              </h3>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Invoice No</th>
                    <th style={styles.th}>AWB</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Payment</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Download</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ ...styles.noData, padding: "40px" }}>
                        <div>Loading invoices...</div>
                      </td>
                    </tr>
                  ) : filteredInvoices.length > 0 ? (
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
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.awbText}>
                            {invoice.shipmentId?.awb || "-"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.amount}>
                            ₹{Number(invoice.totalAmount || invoice.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.paymentMethod}>
                            {invoice.paymentMethod || "Wallet"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.statusBadge(invoice.status)}>
                            {invoice.status === "PAID" ? "Paid" : "Pending"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {new Date(invoice.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>

                        <td style={styles.td}>
                          <button
                            title="Download Invoice"
                            style={downloading === invoice._id ? styles.btnDisabled : styles.btn("#0f172a")}
                            onClick={() => downloadInvoice(invoice._id)}
                            disabled={downloading === invoice._id}
                          >
                            <FaDownload size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={styles.noData}>
                        <div style={styles.noDataTitle}>
                          {search || statusFilter !== "ALL" || dateFilter !== "ALL_TIME" 
                            ? "No matching invoices found" 
                            : "No invoices yet"}
                        </div>
                        <div>
                          {search || statusFilter !== "ALL" || dateFilter !== "ALL_TIME"
                            ? "Try adjusting your search or filters"
                            : "Create shipments to generate invoices automatically"}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <span>
                Showing {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
              </span>
              <span>
                Page 1 of 1
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Billing;