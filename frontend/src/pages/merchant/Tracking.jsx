import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaTruck, FaBox, FaCalendarAlt, FaPhoneAlt, FaUser, FaCheckCircle, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import "./Tracking.css"; // ✅ CSS imported

const Tracking = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return { background: "#dcfce7", color: "#166534", icon: <FaCheckCircle /> };
      case "IN_TRANSIT":
        return { background: "#dbeafe", color: "#1d4ed8", icon: <FaTruck /> };
      case "OUT_FOR_DELIVERY":
        return { background: "#dbeafe", color: "#1d4ed8", icon: <FaTruck /> };
      case "PICKED_UP":
        return { background: "#e0e7ff", color: "#3730a3", icon: <FaBox /> };
      case "PICKUP_SCHEDULED":
      case "PICKUP_PENDING":
        return { background: "#fef3c7", color: "#92400e", icon: <FaBox /> };
      case "RTO":
        return { background: "#fee2e2", color: "#991b1b", icon: <FaClock /> };
      case "CANCELLED":
        return { background: "#fee2e2", color: "#991b1b", icon: <FaClock /> };
      default:
        return { background: "#f1f5f9", color: "#64748b", icon: <FaClock /> };
    }
  };

  const handleTrack = async () => {
    if (!awb) { alert("Please enter AWB number"); return; }
    try {
      setLoading(true);
      const res = await api.get(`/shipments/track/${awb}`);
      setShipment(res.data.shipment);
    } catch (error) {
      setShipment(null);
      alert(error?.response?.data?.message || "Shipment Not Found");
    } finally { setLoading(false); }
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case "DELIVERED": return "100%";
      case "OUT_FOR_DELIVERY": return "85%";
      case "IN_TRANSIT": return "70%";
      case "PICKED_UP": return "50%";
      case "PICKUP_SCHEDULED": return "30%";
      case "PICKUP_PENDING": return "15%";
      default: return "5%";
    }
  };

  const getProgressPercent = (status) => {
    switch (status) {
      case "DELIVERED": return "100%";
      case "OUT_FOR_DELIVERY": return "85%";
      case "IN_TRANSIT": return "70%";
      case "PICKED_UP": return "50%";
      case "PICKUP_SCHEDULED": return "30%";
      case "PICKUP_PENDING": return "15%";
      default: return "5%";
    }
  };

  return (
    <>
      <div className="tracking-container">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <main className="tracking-main">
          <div className="tracking-content-wrapper">
            <div className="tracking-page-header">
              <h1 className="tracking-title">Track Shipment</h1>
              <p className="tracking-subtitle">Real-time shipment tracking and updates</p>
            </div>

            {/* Search Card */}
            <div className="tracking-search-card">
              <div className="tracking-search-header">
                <div className="tracking-search-icon">
                  <FaTruck />
                </div>
                <div>
                  <h3 className="tracking-search-title">Enter AWB Details</h3>
                </div>
              </div>
              <div className="tracking-input-wrapper">
                <label className="tracking-input-label">Air Waybill Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. AWB17813389631365888" 
                  value={awb} 
                  onChange={(e) => setAwb(e.target.value)} 
                  className="tracking-input"
                />
              </div>
              <button onClick={handleTrack} disabled={loading} className="tracking-track-btn">
                {loading ? "Tracking..." : "Track Shipment"}
              </button>
            </div>

            {/* Shipment Details */}
            {shipment && (
              <div className="tracking-details-card">
                <div className="tracking-card-header">
                  <div className="tracking-card-title">
                    <FaBox className="tracking-card-icon" />
                    Shipment Details
                  </div>
                  <div 
                    className="tracking-status-badge-large"
                    style={{
                      background: getStatusStyle(shipment.status).background,
                      color: getStatusStyle(shipment.status).color,
                    }}
                  >
                    {getStatusStyle(shipment.status).icon}
                    {shipment.status || "PICKUP_PENDING"}
                  </div>
                </div>

                <div className="tracking-info-grid">
                  <div className="tracking-info-item">
                    <div className="tracking-info-label">
                      <FaTruck size={11} /> AWB NUMBER
                    </div>
                    <p className="tracking-info-value">{shipment.awb || "N/A"}</p>
                    <p className="tracking-info-value-small">{shipment.courier || "Delhivery"}</p>
                  </div>
                  <div className="tracking-info-item">
                    <div className="tracking-info-label">
                      <FaUser size={11} /> CUSTOMER
                    </div>
                    <p className="tracking-info-value">{shipment.orderId?.customerName || "Rahul Sharma"}</p>
                    <div className="tracking-customer-phone">
                      <FaPhoneAlt size={10} className="tracking-phone-icon" />
                      <p className="tracking-info-value-small">{shipment.orderId?.customerPhone || "9876543210"}</p>
                    </div>
                  </div>
                  <div className="tracking-info-item">
                    <div className="tracking-info-label">
                      <FaCalendarAlt size={11} /> PICKUP DATE
                    </div>
                    <p className="tracking-info-value">
                      {shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : "Pending"}
                    </p>
                  </div>
                  <div className="tracking-info-item">
                    <div className="tracking-info-label">
                      <FaCalendarAlt size={11} /> DELIVERY DATE
                    </div>
                    <p className="tracking-info-value">
                      {shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : "Not Delivered"}
                    </p>
                  </div>
                </div>

                <div className="tracking-divider" />

                {/* Progress Bar */}
                <div className="tracking-progress-section">
                  <div className="tracking-progress-header">
                    <span className="tracking-progress-label">Shipment Progress</span>
                    <span className="tracking-progress-percent">{getProgressPercent(shipment.status)} Complete</span>
                  </div>
                  <div className="tracking-progress-bar-wrapper">
                    <div 
                      className="tracking-progress-bar" 
                      style={{ width: getProgressWidth(shipment.status) }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Timeline */}
            {shipment?.trackingEvents?.length > 0 && (
              <div className="tracking-timeline-card">
                <div className="tracking-card-header">
                  <div className="tracking-card-title">
                    <FaClock className="tracking-card-icon" />
                    Tracking Timeline
                  </div>
                </div>
                {[...shipment.trackingEvents].reverse().map((event, index) => (
                  <div key={index} className="tracking-timeline-item">
                    <div className="tracking-timeline-icon">
                      {event.status === "DELIVERED" ? <FaCheckCircle /> : 
                       event.status === "IN_TRANSIT" ? <FaTruck /> : 
                       <FaClock />}
                    </div>
                    <div className="tracking-timeline-content">
                      <div className="tracking-timeline-status">{event.status}</div>
                      <div className="tracking-timeline-remark">{event.remark}</div>
                      <div className="tracking-timeline-meta">
                        <span className="tracking-timeline-location">
                          <FaMapMarkerAlt size={10} /> {event.location || "Warehouse"}
                        </span>
                        <span className="tracking-timeline-time">
                          <FaClock size={10} /> {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {shipment && shipment?.trackingEvents?.length === 0 && (
              <div className="tracking-empty-state">
                <FaTruck size={48} className="tracking-empty-icon" />
                <p>No tracking events available yet</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Tracking;