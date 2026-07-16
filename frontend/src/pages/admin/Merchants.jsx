import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaStore,
  FaUserCheck,
  FaBan,
  FaSearch,
  FaClock,
  FaEye,
  FaTimes,
  FaMoneyBillWave,
  FaBox,
  FaShoppingCart,
} from "react-icons/fa";
import "./Merchants.css"; // ← Import external CSS

const Merchants = () => {
  // States
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get("/admin/merchants");
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.log("Merchants Fetch Error Log:", error);
    }
  };

  // View Merchant function
  const viewMerchant = async (id) => {
    setLoading(true);

    try {
      const response = await api.get(`/admin/merchant/${id}`);
      console.log("Full Response:", response.data);
      
      // Store the entire response data
      setSelectedMerchant(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching merchant details:", error);
      alert("Failed to fetch merchant details");
    } finally {
      setLoading(false);
    }
  };

  const approveMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/approve`);
      fetchMerchants();
      alert("✅ Merchant Approved Successfully");
    } catch (error) {
      console.error("Approval Error:", error);
      alert("❌ Approval Failed. Please try again.");
    }
  };

  const blockMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/block`);
      fetchMerchants();
      alert("🔒 Merchant Blocked Successfully");
    } catch (error) {
      console.error("Block Error:", error);
      alert("❌ Block Failed. Please try again.");
    }
  };

  const unblockMerchant = async (id) => {
    try {
      await api.put(`/admin/merchants/${id}/unblock`);
      fetchMerchants();
      alert("✅ Merchant Unblocked Successfully");
    } catch (error) {
      console.error("Unblock Error:", error);
      alert("❌ Unblock Failed. Please try again.");
    }
  };

  const activeMerchants = merchants.filter(
    (m) => m.isApproved && !m.isBlocked
  ).length;
  
  const blockedMerchants = merchants.filter((m) => m.isBlocked).length;
  const pendingMerchants = merchants.filter((m) => !m.isApproved).length;

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to close modal and reset selected merchant
  const closeModal = () => {
    setShowModal(false);
    setSelectedMerchant(null);
  };

  // Get status class for merchant
  const getStatusClass = (merchant) => {
    if (merchant.isBlocked) return "merchants-status-blocked";
    if (merchant.isApproved) return "merchants-status-approved";
    return "merchants-status-pending";
  };

  // Get status text for merchant
  const getStatusText = (merchant) => {
    if (merchant.isBlocked) return "Blocked";
    if (merchant.isApproved) return "Approved";
    return "Pending";
  };

  return (
    <div className="merchants-container">
      <AdminSidebar />
      <div className="merchants-main">
        <AdminTopbar />

        <div className="merchants-header-block">
          <h1 className="merchants-header-title">
            🏪 Merchant Management
          </h1>
          <p className="merchants-header-subtitle">
            View and manage all registered merchants
          </p>
        </div>

        <div className="merchants-stats-grid">
          <div className="merchants-stat-card">
            <div className="merchants-stat-left">
              <div className="merchants-stat-label">Total Merchants</div>
              <h2 className="merchants-stat-value">{merchants.length}</h2>
            </div>
            <div className="merchants-stat-icon merchants-stat-icon-blue">
              <FaStore color="#3b82f6" size={22} />
            </div>
          </div>
          
          <div className="merchants-stat-card">
            <div className="merchants-stat-left">
              <div className="merchants-stat-label">Active Merchants</div>
              <h2 className="merchants-stat-value">{activeMerchants}</h2>
            </div>
            <div className="merchants-stat-icon merchants-stat-icon-green">
              <FaUserCheck color="#10b981" size={22} />
            </div>
          </div>
          
          <div className="merchants-stat-card">
            <div className="merchants-stat-left">
              <div className="merchants-stat-label">Blocked Accounts</div>
              <h2 className="merchants-stat-value">{blockedMerchants}</h2>
            </div>
            <div className="merchants-stat-icon merchants-stat-icon-red">
              <FaBan color="#ef4444" size={22} />
            </div>
          </div>

          <div className="merchants-stat-card">
            <div className="merchants-stat-left">
              <div className="merchants-stat-label">Pending Approval</div>
              <h2 className="merchants-stat-value">{pendingMerchants}</h2>
            </div>
            <div className="merchants-stat-icon merchants-stat-icon-yellow">
              <FaClock color="#f59e0b" size={22} />
            </div>
          </div>
        </div>

        <div className="merchants-search-box">
          <FaSearch color="#94a3b8" size={16} />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="merchants-search-input"
          />
        </div>

        <div className="merchants-table-container">
          <div className="merchants-table-header">
            <h3 className="merchants-table-title">Merchant List</h3>
          </div>
          <div className="merchants-table-wrapper">
            <table className="merchants-table">
              <thead>
                <tr>
                  <th className="merchants-th">COMPANY</th>
                  <th className="merchants-th">EMAIL</th>
                  <th className="merchants-th">STATUS</th>
                  <th className="merchants-th">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredMerchants.length > 0 ? (
                  filteredMerchants.map((merchant) => (
                    <tr key={merchant._id}>
                      <td className="merchants-td">
                        <div className="merchants-user-info">
                          <div className="merchants-avatar">
                            {merchant.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="merchants-company-name">{merchant.name}</span>
                        </div>
                      </td>
                      <td className="merchants-td">{merchant.email}</td>
                      <td className="merchants-td">
                        <span className={`merchants-status-badge ${getStatusClass(merchant)}`}>
                          {getStatusText(merchant)}
                        </span>
                      </td>
                      <td className="merchants-td">
                        <div className="merchants-action-group">
                          <button
                            onClick={() => viewMerchant(merchant._id)}
                            className="merchants-action-btn merchants-action-view"
                          >
                            <FaEye />
                            View
                          </button>

                          {!merchant.isApproved && (
                            <button
                              className="merchants-action-btn merchants-action-approve"
                              onClick={() => approveMerchant(merchant._id)}
                            >
                              Approve
                            </button>
                          )}
                          
                          {merchant.isBlocked ? (
                            <button
                              className="merchants-action-btn merchants-action-unblock"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Unblock "${merchant.name}"?`
                                  )
                                ) {
                                  unblockMerchant(merchant._id);
                                }
                              }}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="merchants-action-btn merchants-action-block"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Block "${merchant.name}"?`
                                  )
                                ) {
                                  blockMerchant(merchant._id);
                                }
                              }}
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="merchants-no-data">
                      {searchTerm ? "No merchants match your search" : "No Merchants Found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Merchant Details Modal */}
      {showModal && selectedMerchant && (
        <div className="merchants-modal-overlay" onClick={closeModal}>
          <div className="merchants-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="merchants-modal-close"
              onClick={closeModal}
            >
              <FaTimes />
            </button>

            {loading ? (
              <div className="merchants-loading-spinner">
                <p>Loading merchant details...</p>
              </div>
            ) : (
              <>
                <h2 className="merchants-modal-title">
                  {selectedMerchant.merchant?.companyName || 
                   selectedMerchant.merchant?.name || 
                   "Merchant Details"}
                </h2>

                {/* Company Name */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Company Name</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.companyName || 
                     selectedMerchant.merchant?.name || 
                     "N/A"}
                  </span>
                </div>

                {/* Contact Person */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Contact Person</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.contactPerson || 
                     selectedMerchant.merchant?.name || 
                     "N/A"}
                  </span>
                </div>

                {/* Email */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Email</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.email || "N/A"}
                  </span>
                </div>

                {/* Phone */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Phone</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.phone || "N/A"}
                  </span>
                </div>

                {/* Address */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Address</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.address || 
                     selectedMerchant.merchant?.businessAddress || 
                     "N/A"}
                  </span>
                </div>

                {/* GST Number */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">GST Number</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.gstNumber || 
                     selectedMerchant.merchant?.gst || 
                     "N/A"}
                  </span>
                </div>

                {/* Business Type */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Business Type</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.businessType || 
                     selectedMerchant.merchant?.business || 
                     "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Status</span>
                  <span>
                    <span className={`merchants-modal-status-badge ${
                      selectedMerchant.merchant?.isBlocked
                        ? "merchants-status-blocked"
                        : selectedMerchant.merchant?.isApproved
                        ? "merchants-status-approved"
                        : "merchants-status-pending"
                    }`}>
                      {selectedMerchant.merchant?.isBlocked
                        ? "Blocked"
                        : selectedMerchant.merchant?.isApproved
                        ? "Approved"
                        : "Pending"}
                    </span>
                  </span>
                </div>

                {/* Joined Date */}
                <div className="merchants-modal-field">
                  <span className="merchants-modal-label">Joined Date</span>
                  <span className="merchants-modal-value">
                    {selectedMerchant.merchant?.createdAt
                      ? new Date(selectedMerchant.merchant.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {/* Stats Row: Wallet Balance, Total Orders, Total Shipments */}
                <div className="merchants-modal-stats">
                  <div className="merchants-modal-stat-item">
                    <div className="merchants-modal-stat-number">
                      ₹{selectedMerchant.walletBalance || 0}
                    </div>
                    <div className="merchants-modal-stat-label">
                      <FaMoneyBillWave />
                      Wallet Balance
                    </div>
                  </div>
                  <div className="merchants-modal-stat-item">
                    <div className="merchants-modal-stat-number">
                      {selectedMerchant.totalOrders || 0}
                    </div>
                    <div className="merchants-modal-stat-label">
                      <FaShoppingCart />
                      Total Orders
                    </div>
                  </div>
                  <div className="merchants-modal-stat-item">
                    <div className="merchants-modal-stat-number">
                      {selectedMerchant.totalShipments || 0}
                    </div>
                    <div className="merchants-modal-stat-label">
                      <FaBox />
                      Total Shipments
                    </div>
                  </div>
                </div>

                {/* View Rate Cards Button with modal close */}
                <button
                  className="merchants-modal-view-rate-btn"
                  onClick={() => {
                    closeModal(); // Close modal first
                    navigate(`/admin/ratecard/${selectedMerchant.merchant._id}`);
                  }}
                >
                  <FaEye size={16} />
                  View Rate Cards
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchants;