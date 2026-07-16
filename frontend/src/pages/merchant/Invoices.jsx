import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaDownload } from "react-icons/fa";
import "./Invoices.css"; 

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");
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

  // ✅ Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
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

        {/* Summary Cards */}
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
            <h2 className="invoices-summary-value">₹{summary.totalRevenue}</h2>
          </div>
        </div>

        {/* Search and Filter Section */}
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

        {/* Invoice Table */}
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
                    ₹{invoice.totalAmount}
                  </td>

                  <td className="invoices-td">
                    <span
                      className={`invoices-status-badge ${
                        invoice.status === "PAID"
                          ? "invoices-status-paid"
                          : "invoices-status-pending"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td className="invoices-td invoices-date">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>

                  <td className="invoices-td">
                    <button
                      title="Download Invoice"
                      onClick={() => downloadInvoice(invoice._id)}
                      className="invoices-download-btn"
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
              No invoices available.
              <br />
              Create shipments to generate invoices.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;