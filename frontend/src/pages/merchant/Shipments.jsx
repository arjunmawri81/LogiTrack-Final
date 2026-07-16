import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { 
  FaTruck,
  FaSearch,
  FaDownload,
  FaTimes,
  FaEye,
  FaFileInvoice,
  FaBox,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUndo,
  FaFilter,
} from "react-icons/fa";
import "./Shipments.css"; 

const Shipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      
      const res = await api.get("/shipments");
      
      console.log("SHIPMENTS =>", res.data.shipments);
      console.log("FIRST SHIPMENT =>", res.data.shipments[0]);
      
      setShipments(res.data.shipments || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED": return { background: "#dcfce7", color: "#166534" };
      case "RTO": return { background: "#fee2e2", color: "#991b1b" };
      case "NDR": return { background: "#fef3c7", color: "#92400e" };
      case "IN_TRANSIT": return { background: "#dbeafe", color: "#1d4ed8" };
      case "OUT_FOR_DELIVERY": return { background: "#dbeafe", color: "#1d4ed8" };
      case "PICKED_UP": return { background: "#e0e7ff", color: "#4338ca" };
      case "PICKUP_PENDING": return { background: "#fef3c7", color: "#92400e" };
      case "PICKUP_SCHEDULED": return { background: "#fef3c7", color: "#92400e" };
      case "CANCELLED": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const downloadLabel = async (shipmentId, awb) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/label`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Label-${awb}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Label download failed");
    }
  };

  const downloadInvoice = async (shipment) => {
    try {
      let invoiceId = null;

      if (shipment.invoiceId?._id) {
        invoiceId = shipment.invoiceId._id;
      } else if (typeof shipment.invoiceId === "string") {
        invoiceId = shipment.invoiceId;
      }

      if (!invoiceId) {
        alert("Invoice not generated");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invoice download failed");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Invoice download failed");
    }
  };

  // Statistics Calculations
  const totalShipments = shipments.length;
  const delivered = shipments.filter(s => s.status === "DELIVERED").length;
  const inTransit = shipments.filter(s => 
    s.status === "IN_TRANSIT" || 
    s.status === "OUT_FOR_DELIVERY"
  ).length;
  const pending = shipments.filter(s => 
    s.status === "PICKUP_PENDING" || 
    s.status === "PICKUP_SCHEDULED"
  ).length;
  const ndr = shipments.filter(s => s.status === "NDR").length;
  const rto = shipments.filter(s => s.status === "RTO").length;

  // Filter with status
  const filtered = shipments.filter((s) => {
    const matchesSearch =
      s.awb?.toLowerCase().includes(search.toLowerCase()) ||
      (s.orderId?.customerName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="shipments-container">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <main className="shipments-main">
          <h1 className="shipments-title">Shipments Management</h1>
          <p className="shipments-subtitle">Manage and track all your shipments</p>

          {/* Statistics Cards */}
          <div className="shipments-stats-grid">
            <div className="stat-card stat-card-blue">
              <FaBox className="stat-icon stat-icon-blue" />
              <div className="stat-value">{totalShipments}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card stat-card-orange">
              <FaClock className="stat-icon stat-icon-orange" />
              <div className="stat-value">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card stat-card-blue">
              <FaTruck className="stat-icon stat-icon-blue" />
              <div className="stat-value">{inTransit}</div>
              <div className="stat-label">In Transit</div>
            </div>
            <div className="stat-card stat-card-green">
              <FaCheckCircle className="stat-icon stat-icon-green" />
              <div className="stat-value">{delivered}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card stat-card-yellow">
              <FaExclamationTriangle className="stat-icon stat-icon-yellow" />
              <div className="stat-value">{ndr}</div>
              <div className="stat-label">NDR</div>
            </div>
            <div className="stat-card stat-card-red">
              <FaUndo className="stat-icon stat-icon-red" />
              <div className="stat-value">{rto}</div>
              <div className="stat-label">RTO</div>
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className="shipments-search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by AWB or Customer Name..." 
              className="shipments-search-input"
              onChange={(e) => setSearch(e.target.value)} 
            />
            
            <div className="filter-wrapper">
              <FaFilter className="filter-icon" />
              <select
                className="shipments-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PICKUP_PENDING">Pickup Pending</option>
                <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="NDR">NDR</option>
                <option value="RTO">RTO</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="shipments-table-card">
            <div className="shipments-table-header">
              <h3 className="shipments-table-title">
                Shipment Records
                <span className="shipments-count">
                  ({filtered.length} shipments)
                </span>
              </h3>
            </div>
            
            <div className="shipments-table-wrapper">
              {loading ? (
                <div className="shipments-loading">Loading Shipments...</div>
              ) : (
                <table className="shipments-table">
                  <thead>
                    <tr className="shipments-table-head">
                      {[
                        "AWB",
                        "CUSTOMER",
                        "COURIER",
                        "STATUS",
                        "DATE",
                        "DETAILS",
                        "INVOICE",
                        "LABEL",
                        "TIMELINE"
                      ].map((h) => (
                        <th key={h} className="shipments-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((shipment) => {
                        const statusStyle = getStatusStyle(shipment.status);
                        return (
                          <tr key={shipment._id} className="shipments-row">
                            <td className="shipments-td">
                              <b className="shipments-awb">{shipment.awb}</b>
                            </td>
                            <td className="shipments-td">
                              <span className="shipments-customer">
                                {shipment.orderId?.customerName || "N/A"}
                              </span>
                            </td>
                            <td className="shipments-td">
                              <span className="shipments-courier">
                                {shipment.courier}
                              </span>
                            </td>
                            <td className="shipments-td">
                              <span 
                                className="shipments-status-badge"
                                style={{
                                  background: statusStyle.background,
                                  color: statusStyle.color,
                                }}
                              >
                                {shipment.status}
                              </span>
                            </td>
                            <td className="shipments-td">
                              <span className="shipments-date">
                                {new Date(shipment.createdAt).toLocaleDateString('en-GB')}
                              </span>
                            </td>
                            
                            <td className="shipments-td">
                              <button
                                onClick={() =>
                                  navigate(`/merchant/shipments/${shipment._id}`)
                                }
                                className="shipments-btn shipments-btn-details"
                              >
                                <FaEye size={11} /> Details
                              </button>
                            </td>
                            
                            <td className="shipments-td">
                              <button
                                onClick={() => downloadInvoice(shipment)}
                                className="shipments-btn shipments-btn-invoice"
                              >
                                <FaFileInvoice size={11} />
                                Invoice
                              </button>
                            </td>
                            
                            <td className="shipments-td">
                              <button 
                                onClick={() => downloadLabel(shipment._id, shipment.awb)} 
                                className="shipments-btn shipments-btn-label"
                              >
                                <FaDownload size={11} /> Label
                              </button>
                            </td>
                            
                            <td className="shipments-td">
                              <button 
                                onClick={async () => { 
                                  try { 
                                    const res = await api.get(`/shipments/${shipment._id}/timeline`); 
                                    setSelectedTimeline(res.data.timeline); 
                                    setShowModal(true); 
                                  } catch (err) { 
                                    alert("Timeline not available"); 
                                  } 
                                }} 
                                className="shipments-btn shipments-btn-timeline"
                              >
                                <FaEye size={11} /> Timeline
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="shipments-empty">
                          {search || statusFilter !== "ALL" ? "No matching shipments found" : "No Shipments Found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Timeline Modal */}
      {showModal && (
        <div className="shipments-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="shipments-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="shipments-modal-header">
              <h2 className="shipments-modal-title">Shipment Timeline</h2>
              <button onClick={() => setShowModal(false)} className="shipments-modal-close">
                <FaTimes />
              </button>
            </div>
            <div className="shipments-modal-body">
              {selectedTimeline?.length > 0 ? selectedTimeline.map((item, index) => (
                <div key={index} className="shipments-timeline-item">
                  <div className="shipments-timeline-status">{item.status}</div>
                  <div className="shipments-timeline-remark">{item.remark}</div>
                  <div className="shipments-timeline-meta">
                    {item.location && `📍 ${item.location}`} 
                    {item.location && item.createdAt && " • "}
                    {item.createdAt && new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              )) : <p className="shipments-timeline-empty">No updates yet</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipments;