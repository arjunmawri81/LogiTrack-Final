import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaDownload } from "react-icons/fa";
import "./Invoices.css";

const MONTHS = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: 5 },
  (_, i) => currentYear - 2 + i
);

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(
        `/invoices?year=${selectedYear}&month=${selectedMonth}`
      );
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(
        `/invoices/summary?year=${selectedYear}&month=${selectedMonth}`
      );
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const response = await api.get(
        `/invoices/${id}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        invoice.invoiceNumber?.toLowerCase().includes(searchText) ||
        invoice.shipmentId?.awb?.toLowerCase().includes(searchText) ||
        invoice.orderId?.customerName?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;

      const matchesCourier =
        courierFilter === "ALL" ||
        invoice.shipmentId?.courier?.toLowerCase() === courierFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCourier;
    });
  }, [invoices, search, statusFilter, courierFilter]);

  return (
    <div className="invoices-container">
      <div className="invoices-sidebar">
        <Sidebar />
      </div>

      <div className="invoices-main">
        <div className="invoices-header">
          <h1 className="invoices-title">Invoices</h1>
          <p className="invoices-subtitle">Manage and download billing invoices</p>
        </div>

        <div className="billing-cycle-card">
          <div className="billing-header">
            <div className="billing-header-left">
              <h3>Billing Cycle</h3>
              <p>View invoices for {selectedYear}</p>
            </div>
          </div>

          <div className="billing-selectors">
            <div className="billing-selector-group">
              <label>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="billing-selector-group">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="selected-cycle">
            <span>Current Billing Cycle</span>
            <strong>
              {MONTHS.find((m) => m.id === selectedMonth)?.name} {selectedYear}
            </strong>
          </div>
        </div>

        <div className="invoices-summary-grid">
          <div className="invoices-summary-card">
            <h3 className="invoices-summary-label">Total Invoices</h3>
            <h2 className="invoices-summary-value">{summary.totalInvoices}</h2>
          </div>

          <div className="invoices-summary-card">
            <h3 className="invoices-summary-label">Paid Invoices</h3>
            <h2 className="invoices-summary-value">{summary.paidInvoices}</h2>
          </div>

          <div className="invoices-summary-card">
            <h3 className="invoices-summary-label">Pending Invoices</h3>
            <h2 className="invoices-summary-value">{summary.pendingInvoices}</h2>
          </div>

          <div className="invoices-summary-card">
            <h3 className="invoices-summary-label">Total Billing</h3>
            <h2 className="invoices-summary-value">
              ₹{Number(summary.totalRevenue || 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        <div className="invoices-filters">
          <input
            type="text"
            placeholder="Search Invoice / AWB / Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="invoices-search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="invoices-filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="invoices-filter-select"
          >
            <option value="ALL">All Couriers</option>
            <option value="delhivery">Delhivery</option>
            <option value="dtdc">DTDC</option>
            <option value="xpressbees">XpressBees</option>
            <option value="shadowfax">Shadowfax</option>
            <option value="ecom">Ecom</option>
          </select>
        </div>

        {error && (
          <div className="invoices-error">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="invoices-loading">
            <div className="invoices-spinner"></div>
            <p>Loading invoices...</p>
          </div>
        ) : (
          <div className="invoices-table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr className="invoices-table-head">
                  <th className="invoices-th">Invoice No</th>
                  <th className="invoices-th">AWB</th>
                  <th className="invoices-th">Customer</th>
                  <th className="invoices-th">Courier</th>
                  <th className="invoices-th">Amount</th>
                  <th className="invoices-th">Status</th>
                  <th className="invoices-th">Date</th>
                  <th className="invoices-th">Download</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="invoices-row">
                    <td className="invoices-td">
                      <span className="invoices-invoice-number">
                        {invoice.invoiceNumber}
                      </span>
                    </td>

                    <td className="invoices-td invoices-awb">
                      {invoice.shipmentId?.awb || "-"}
                    </td>

                    <td className="invoices-td invoices-customer">
                      {invoice.orderId?.customerName || "-"}
                    </td>

                    <td className="invoices-td invoices-courier">
                      {invoice.shipmentId?.courier || "-"}
                    </td>

                    <td className="invoices-td invoices-amount">
                      ₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="invoices-td">
                      <span
                        className={`invoices-status-badge ${
                          invoice.status === "PAID"
                            ? "invoices-status-paid"
                            : invoice.status === "FAILED"
                            ? "invoices-status-failed"
                            : "invoices-status-pending"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td className="invoices-td invoices-date">
                      {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="invoices-td">
                      <button
                        className="invoices-download-btn"
                        title="Download Invoice PDF"
                        onClick={() => downloadInvoice(invoice._id)}
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="invoices-empty">
                <h3>No Invoices Found</h3>
                <p>
                  Create shipments to automatically generate invoices.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;