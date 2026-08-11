import { useState, useEffect } from "react";
import api from "../services/api";
import { 
  FaBuilding, FaFileInvoice, FaRegIdCard, 
  FaMapMarkerAlt, FaUniversity, FaCheckCircle, 
  FaExclamationTriangle, FaArrowLeft, FaSignOutAlt 
} from "react-icons/fa";
import "./MerchantOnboardingModal.css";

const MerchantOnboardingModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    phone: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bankAccount: "",
    ifscCode: "",
    bankName: "",
  });

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const role = (localStorage.getItem("role") || "").toUpperCase();
      
      // Check if user is a merchant
      const isMerchantRole = role === "MERCHANT" || (userStr && JSON.parse(userStr)?.role?.toUpperCase() === "MERCHANT");
      if (!isMerchantRole) return;

      // 1. Initial check from localStorage user object
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const hasLocalAddress = u.address && u.address.trim() !== "";
          const hasLocalPincode = u.pincode && u.pincode.trim() !== "";
          const hasLocalBank = (u.accountNumber && u.accountNumber.trim() !== "") || (u.bankAccount && u.bankAccount.trim() !== "");
          
          if (!hasLocalAddress || !hasLocalPincode || !hasLocalBank) {
            setShowModal(true);
          }
        } catch (e) {
          console.error("LocalUser Parse Error:", e);
        }
      }

      // 2. Fetch fresh profile from API
      const res = await api.get("/merchant/profile");
      if (res.data.success) {
        const m = res.data.merchant || {};
        const u = res.data.user || {};

        const companyName = m.companyName || u.companyName || "";
        const name = u.name || "";
        const phone = u.phone || "";
        const gstNumber = m.gstNumber || u.gstNumber || "";
        const panNumber = m.panNumber || u.panNumber || "";
        const address = m.address || u.address || "";
        const city = u.city || m.city || "";
        const state = u.state || m.state || "";
        const pincode = u.pincode || m.pincode || "";
        const bankAccount = m.bankAccount || u.accountNumber || "";
        const ifscCode = m.ifscCode || u.ifscCode || "";
        const bankName = m.bankName || u.bankName || "";

        setFormData({
          companyName,
          name,
          phone,
          gstNumber,
          panNumber,
          address,
          city,
          state,
          pincode,
          bankAccount,
          ifscCode,
          bankName,
        });

        // Mandatory check: If address, pincode, bank account or city/state are empty -> MUST show modal!
        const isIncomplete = !address.trim() || !city.trim() || !pincode.trim() || !bankAccount.trim();
        if (isIncomplete) {
          setShowModal(true);
        } else {
          setShowModal(false);
        }
      }
    } catch (err) {
      console.log("Check Profile Completion Error:", err);
      // Fallback if API fails
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (!u.address || !u.pincode || (!u.accountNumber && !u.bankAccount)) {
          setShowModal(true);
        }
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      return alert("Please fill in your full address, city, and pincode.");
    }

    if (!formData.bankAccount.trim() || !formData.ifscCode.trim() || !formData.bankName.trim()) {
      return alert("Please fill in your bank account details for COD remittance.");
    }

    setLoading(true);

    try {
      const res = await api.put("/merchant/profile", formData);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("userUpdated"));
      }

      alert("Profile Details Saved Successfully! You can now use all dashboard features.");
      setShowModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  if (!showModal) return null;

  const statesList = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", 
    "Gujarat", "Uttar Pradesh", "West Bengal", "Rajasthan", 
    "Punjab", "Haryana", "Telangana", "Kerala", "Madhya Pradesh",
    "Andhra Pradesh", "Bihar", "Chhattisgarh", "Goa", "Himachal Pradesh",
    "Jharkhand", "Odisha", "Uttarakhand"
  ];

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-modal-card">
        {/* MANDATORY MODAL HEADER */}
        <div className="onboarding-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="header-badge">
              Mandatory Profile Setup
            </div>

            <button 
              type="button" 
              className="modal-logout-btn" 
              onClick={handleLogout}
              title="Logout and back to login"
            >
              <FaArrowLeft /> Back to Login
            </button>
          </div>

          <h2 className="modal-title" style={{ marginTop: "8px" }}>Action Required: Complete Your Business Profile</h2>
          <p className="modal-subtitle">
            To start creating shipments and accessing your dashboard features, please complete your business and bank details below.
          </p>
        </div>

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-sections-grid">
            
            {/* SECTION 1: BUSINESS & TAX */}
            <div className="form-section">
              <h3 className="section-heading">
                <FaFileInvoice className="section-icon" /> Business & Tax Details
              </h3>

              <div className="input-field-group">
                <label>Company Name</label>
                <div className="input-with-icon">
                  <FaBuilding className="field-icon" />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company / Business Name"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-row-2">
                <div className="input-field-group">
                  <label>GST Number (Optional)</label>
                  <div className="input-with-icon">
                    <FaFileInvoice className="field-icon" />
                    <input
                      type="text"
                      name="gstNumber"
                      placeholder="GSTIN (e.g. 27AAAAA0000A1Z5)"
                      value={formData.gstNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label>PAN Number (Optional)</label>
                  <div className="input-with-icon">
                    <FaRegIdCard className="field-icon" />
                    <input
                      type="text"
                      name="panNumber"
                      placeholder="PAN (e.g. ABCDE1234F)"
                      value={formData.panNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ADDRESS & LOCATION */}
            <div className="form-section">
              <h3 className="section-heading">
                <FaMapMarkerAlt className="section-icon" /> Business & Registered Address *
              </h3>

              <div className="input-field-group">
                <label>Full Address *</label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="field-icon" style={{ marginTop: "12px" }} />
                  <textarea
                    name="address"
                    placeholder="Enter full address with building, street & landmark"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    required
                  />
                </div>
              </div>

              <div className="input-row-3">
                <div className="input-field-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {statesList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="input-field-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: BANK DETAILS FOR REMITTANCE */}
            <div className="form-section">
              <h3 className="section-heading">
                <FaUniversity className="section-icon" /> Bank Account Details (For COD Remittance) *
              </h3>

              <div className="input-row-3">
                <div className="input-field-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    name="bankAccount"
                    placeholder="Bank Account Number"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>IFSC Code *</label>
                  <input
                    type="text"
                    name="ifscCode"
                    placeholder="IFSC (e.g. SBIN0001234)"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Bank & Branch Name"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

          </div>

          {/* MANDATORY ACTION BUTTONS */}
          <div className="onboarding-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              type="button" 
              className="later-btn" 
              onClick={handleLogout}
              style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaArrowLeft /> Back to Login
            </button>

            <button 
              type="submit" 
              className="save-onboarding-btn" 
              disabled={loading} 
              style={{ flex: 1, justifyContent: "center", height: "48px", fontSize: "15px" }}
            >
              {loading ? (
                "Saving Profile Details..."
              ) : (
                <>
                  <FaCheckCircle /> Save Profile Details & Unlock Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantOnboardingModal;
