import { useState, useEffect } from "react";
import api from "../services/api";
import { 
  FaBuilding, FaFileInvoice, FaRegIdCard, 
  FaMapMarkerAlt, FaUniversity, FaCheckCircle, 
  FaTimes, FaRocket, FaShieldAlt 
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
      const role = localStorage.getItem("role");
      if (role !== "MERCHANT") return;

      // Check if user already skipped for this browser session
      if (sessionStorage.getItem("merchant_onboarding_dismissed")) {
        return;
      }

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
        const city = u.city || "";
        const state = u.state || "";
        const pincode = u.pincode || "";
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

        // Trigger popup if address, bank details or GST/PAN are missing
        const isIncomplete = !address || !pincode || !bankAccount || !gstNumber;
        if (isIncomplete) {
          setShowModal(true);
        }
      }
    } catch (err) {
      console.log("Check Profile Completion Error:", err);
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
    setLoading(true);

    try {
      const res = await api.put("/merchant/profile", formData);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("userUpdated"));
      }

      alert("Profile Details Saved Successfully!");
      setShowModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("merchant_onboarding_dismissed", "true");
    setShowModal(false);
  };

  if (!showModal) return null;

  const statesList = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", 
    "Gujarat", "Uttar Pradesh", "West Bengal", "Rajasthan", 
    "Punjab", "Haryana", "Telangana", "Kerala", "Madhya Pradesh"
  ];

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-modal-card">
        {/* MODAL HEADER */}
        <div className="onboarding-header">
          <div className="header-badge">
            <FaRocket className="rocket-icon" /> Welcome to MyParcelPoint
          </div>
          <button className="dismiss-btn" onClick={handleDismiss} title="Complete Later">
            <FaTimes />
          </button>
          <h2 className="modal-title">Complete Your Business Profile</h2>
          <p className="modal-subtitle">
            Fill in your business, registered address, and bank details to start booking shipments effortlessly.
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
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-row-2">
                <div className="input-field-group">
                  <label>GST Number</label>
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
                  <label>PAN Number</label>
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
                <FaMapMarkerAlt className="section-icon" /> Business & Registered Address
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
                <FaUniversity className="section-icon" /> Bank Details (For COD Remittance)
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

          {/* ACTIONS */}
          <div className="onboarding-actions">
            <button type="button" className="later-btn" onClick={handleDismiss}>
              Skip / Complete Later
            </button>

            <button type="submit" className="save-onboarding-btn" disabled={loading}>
              {loading ? (
                "Saving Profile..."
              ) : (
                <>
                  <FaCheckCircle /> Save Profile & Continue
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
