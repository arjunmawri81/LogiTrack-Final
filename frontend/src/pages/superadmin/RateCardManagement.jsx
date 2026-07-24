import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  FaTruck,
  FaPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaInfoCircle,
  FaBoxes,
  FaMapMarkerAlt,
  FaReceipt,
  FaSlidersH,
  FaEye,
  FaShieldAlt,
  FaArrowLeft,
  FaSave,
  FaUndo,
  FaWallet,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaSearch,
  FaEdit,
  FaPlusCircle,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RateCardManagement.css";

// ─────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  forwardRates: { rate500gm: "", rate1kg: "", rate2kg: "", rate5kg: "", additionalKg: "" },
  codCharges:   { codCharge: "" },
  rtoCharges:   { rtoCharge: "" },
  additionalCharges: { reversePickup: "", fuelCharge: "" },
  zoneRates:    { local: "", regional: "", national: "" },
  gst:          18,
  odaCharge:    "",
  handlingCharge: "",
  effectiveFrom: "",
  effectiveTo:   "",
  serviceability: { codEnabled: true, prepaidEnabled: true, rtoEnabled: true, reversePickup: true },
};

const normalizeFromBackend = (data) => {
  if (!data) return { ...EMPTY_FORM };
  const str = (v) => (v !== undefined && v !== null ? String(v) : "");
  return {
    forwardRates: {
      rate500gm:    str(data.forwardRates?.rate500gm),
      rate1kg:      str(data.forwardRates?.rate1kg),
      rate2kg:      str(data.forwardRates?.rate2kg),
      rate5kg:      str(data.forwardRates?.rate5kg),
      additionalKg: str(data.forwardRates?.additionalKg),
    },
    codCharges:   { codCharge: str(data.codCharge) },
    rtoCharges:   { rtoCharge: str(data.rtoCharge) },
    additionalCharges: {
      reversePickup: str(data.reversePickup),
      fuelCharge:    str(data.fuelCharge),
    },
    zoneRates: {
      local:    str(data.zoneRates?.local),
      regional: str(data.zoneRates?.regional),
      national: str(data.zoneRates?.national),
    },
    gst:           data.gst !== undefined && data.gst !== null ? Number(data.gst) : 18,
    odaCharge:     str(data.odaCharge),
    handlingCharge:str(data.handlingCharge),
    effectiveFrom: data.effectiveFrom ? data.effectiveFrom.split("T")[0] : "",
    effectiveTo:   data.effectiveTo   ? data.effectiveTo.split("T")[0]   : "",
    serviceability: {
      codEnabled:     data.serviceability?.codEnabled     !== false,
      prepaidEnabled: data.serviceability?.prepaidEnabled !== false,
      rtoEnabled:     data.serviceability?.rtoEnabled     !== false,
      reversePickup:  data.serviceability?.reversePickup  !== false,
    },
  };
};

const validateForm = (formData) => {
  if (formData.gst === "" || formData.gst === null || formData.gst === undefined)
    return "GST percentage is required.";
  if (!formData.forwardRates.rate500gm) return "500gm Forward Rate is required.";
  if (formData.codCharges.codCharge === "" || formData.codCharges.codCharge === null)
    return "COD Charge is required.";
  if (!formData.effectiveFrom) return "Effective From date is required.";
  if (!formData.effectiveTo)   return "Effective To date is required.";
  if (Number(formData.gst) < 0)   return "GST cannot be negative.";
  if (Number(formData.gst) > 100) return "GST must be between 0 and 100.";
  if (Number(formData.forwardRates.rate500gm)    < 0) return "500gm rate cannot be negative.";
  if (Number(formData.forwardRates.rate1kg)      < 0) return "1kg rate cannot be negative.";
  if (Number(formData.forwardRates.rate2kg)      < 0) return "2kg rate cannot be negative.";
  if (Number(formData.forwardRates.rate5kg)      < 0) return "5kg rate cannot be negative.";
  if (Number(formData.forwardRates.additionalKg) < 0) return "Additional kg rate cannot be negative.";
  if (Number(formData.zoneRates.local)    < 0) return "Local zone rate cannot be negative.";
  if (Number(formData.zoneRates.regional) < 0) return "Regional zone rate cannot be negative.";
  if (Number(formData.zoneRates.national) < 0) return "National zone rate cannot be negative.";
  if (Number(formData.codCharges.codCharge)            < 0) return "COD charge cannot be negative.";
  if (Number(formData.rtoCharges.rtoCharge)            < 0) return "RTO charge cannot be negative.";
  if (Number(formData.additionalCharges.reversePickup) < 0) return "Reverse pickup cannot be negative.";
  if (Number(formData.additionalCharges.fuelCharge)    < 0) return "Fuel charge cannot be negative.";
  if (Number(formData.odaCharge)      < 0) return "ODA charge cannot be negative.";
  if (Number(formData.handlingCharge) < 0) return "Handling charge cannot be negative.";
  if (formData.effectiveFrom && formData.effectiveTo) {
    if (new Date(formData.effectiveTo) < new Date(formData.effectiveFrom))
      return "Effective To must be ≥ Effective From.";
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────
// INLINE SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────

const StatusBadge = ({ active }) => (
  <span className={`rcm-status-chip ${active ? "active" : "inactive"}`}>
    {active ? <FaCheckCircle size={10} /> : <FaExclamationTriangle size={10} />}
    {active ? "Configured" : "Not Configured"}
  </span>
);

const FormInput = ({
  label,
  value,
  onChange,
  type = "number",
  placeholder = "0",
  disabled = false,
  required = false,
  prefix = "₹",
}) => (
  <div className="rcm-form-field">
    <label className="rcm-field-label">
      {label}
      {required && <span className="rcm-field-required">*</span>}
    </label>
    <div className="rcm-field-input-box">
      {prefix && <span className="rcm-field-prefix">{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`rcm-input-element ${prefix ? "has-prefix" : ""}`}
      />
    </div>
  </div>
);

const CheckboxToggle = ({ label, checked, onChange }) => (
  <label className={`rcm-toggle-label ${checked ? "checked" : ""}`}>
    <div onClick={onChange} className={`rcm-toggle-switch ${checked ? "checked" : ""}`}>
      <div className="rcm-toggle-handle" />
    </div>
    <span className="rcm-toggle-text">{label}</span>
  </label>
);

// ─────────────────────────────────────────────────────────────────
// RATE FORM
// ─────────────────────────────────────────────────────────────────

const RateForm = ({ formData, onChange, onSave, onReset, onBack, saving, activeTab, onTabChange, courierName }) => {
  const {
    forwardRates,
    codCharges,
    rtoCharges,
    additionalCharges,
    zoneRates,
    gst,
    odaCharge,
    handlingCharge,
    effectiveFrom,
    effectiveTo,
    serviceability,
  } = formData;

  const field = (section, key, val) => onChange(section, key, val);

  const preview = [
    { label: "500gm",    value: forwardRates.rate500gm || 0 },
    { label: "1kg",      value: forwardRates.rate1kg   || 0 },
    { label: "2kg",      value: forwardRates.rate2kg   || 0 },
    { label: "5kg",      value: forwardRates.rate5kg   || 0 },
    { label: "Local",    value: zoneRates.local    || 0 },
    { label: "Regional", value: zoneRates.regional || 0 },
    { label: "National", value: zoneRates.national || 0 },
  ];

  return (
    <>
      {/* Top Controls Bar */}
      <div className="rcm-form-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button onClick={onBack} className="rcm-back-btn">
            <FaArrowLeft size={12} /> Back to Couriers
          </button>
          <span style={{ fontSize: "18px", color: "#0f172a", fontWeight: "800" }}>{courierName}</span>
          <StatusBadge active={false} />
        </div>

        <div className="rcm-tab-switcher">
          {["Surface", "Air"].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`rcm-tab-btn ${activeTab === tab ? "active" : "inactive"}`}
            >
              {tab === "Surface" ? <FaTruck size={14} /> : <FaPlane size={14} />}
              {tab} Rates
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="rcm-form-grid-layout">
        {/* LEFT FIELDS (Dark Rate Cards) */}
        <div>
          {/* Basic Information */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">
              <span className="rcm-card-title-icon"><FaInfoCircle size={16} /></span> Basic Information
            </h3>
            <div className="rcm-inputs-grid-3">
              <FormInput label="Service Type" value={activeTab} onChange={() => {}} disabled placeholder="" type="text" prefix="" />
              <FormInput label="GST (%)" value={gst} onChange={(v) => onChange(null, "gst", v)} required prefix="%" />
              <FormInput label="Effective From" value={effectiveFrom} onChange={(v) => onChange(null, "effectiveFrom", v)} type="date" placeholder="" required prefix="" />
              <FormInput label="Effective To"   value={effectiveTo}   onChange={(v) => onChange(null, "effectiveTo",   v)} type="date" placeholder="" required prefix="" />
            </div>
          </div>

          {/* Forward Rates */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">
              <span className="rcm-card-title-icon"><FaBoxes size={16} /></span> Forward Rates
            </h3>
            <div className="rcm-inputs-grid-3">
              <FormInput label="500gm"        value={forwardRates.rate500gm}    onChange={(v) => field("forwardRates","rate500gm",v)}    required />
              <FormInput label="1kg"          value={forwardRates.rate1kg}      onChange={(v) => field("forwardRates","rate1kg",v)} />
              <FormInput label="2kg"          value={forwardRates.rate2kg}      onChange={(v) => field("forwardRates","rate2kg",v)} />
              <FormInput label="5kg"          value={forwardRates.rate5kg}      onChange={(v) => field("forwardRates","rate5kg",v)} />
              <FormInput label="Additional KG" value={forwardRates.additionalKg} onChange={(v) => field("forwardRates","additionalKg",v)} />
            </div>
          </div>

          {/* Zone Rates */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">
              <span className="rcm-card-title-icon"><FaMapMarkerAlt size={16} /></span> Zone Rates
            </h3>
            <div className="rcm-inputs-grid-3">
              <FormInput label="Local"    value={zoneRates.local}    onChange={(v) => field("zoneRates","local",v)} />
              <FormInput label="Regional" value={zoneRates.regional} onChange={(v) => field("zoneRates","regional",v)} />
              <FormInput label="National" value={zoneRates.national} onChange={(v) => field("zoneRates","national",v)} />
            </div>
          </div>

          {/* Additional Charges */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">
              <span className="rcm-card-title-icon"><FaReceipt size={16} /></span> Additional Charges
            </h3>
            <div className="rcm-inputs-grid-3">
              <FormInput label="COD Charge"      value={codCharges.codCharge}             onChange={(v) => field("codCharges","codCharge",v)} required />
              <FormInput label="RTO Charge"      value={rtoCharges.rtoCharge}             onChange={(v) => field("rtoCharges","rtoCharge",v)} />
              <FormInput label="Reverse Pickup"  value={additionalCharges.reversePickup}  onChange={(v) => field("additionalCharges","reversePickup",v)} />
              <FormInput label="Fuel Charge"     value={additionalCharges.fuelCharge}     onChange={(v) => field("additionalCharges","fuelCharge",v)} />
              <FormInput label="ODA Charge"      value={odaCharge}      onChange={(v) => onChange(null,"odaCharge",v)} />
              <FormInput label="Handling Charge" value={handlingCharge} onChange={(v) => onChange(null,"handlingCharge",v)} />
            </div>
          </div>

          {/* Serviceability */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">
              <span className="rcm-card-title-icon"><FaSlidersH size={16} /></span> Serviceability Options
            </h3>
            <div className="rcm-inputs-grid-2">
              <CheckboxToggle label="COD Enabled"     checked={serviceability.codEnabled}     onChange={() => onChange("serviceability","codEnabled",    !serviceability.codEnabled)} />
              <CheckboxToggle label="Prepaid Enabled" checked={serviceability.prepaidEnabled} onChange={() => onChange("serviceability","prepaidEnabled", !serviceability.prepaidEnabled)} />
              <CheckboxToggle label="RTO Enabled"     checked={serviceability.rtoEnabled}     onChange={() => onChange("serviceability","rtoEnabled",    !serviceability.rtoEnabled)} />
              <CheckboxToggle label="Reverse Pickup"  checked={serviceability.reversePickup}  onChange={() => onChange("serviceability","reversePickup", !serviceability.reversePickup)} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR PREVIEW */}
        <div>
          {/* Live Preview Card */}
          <div className="rcm-preview-card">
            <div className="rcm-preview-header">
              <h3 className="rcm-preview-title">
                <FaEye size={16} color="#ea580c" /> Live Rate Preview
              </h3>
              <span className="rcm-preview-courier-tag">{courierName}</span>
            </div>
            <div className="rcm-preview-grid">
              {preview.map(({ label, value }) => (
                <div key={label} className="rcm-preview-item">
                  <p className="rcm-preview-item-label">{label}</p>
                  <p className="rcm-preview-item-val">₹{value || 0}</p>
                </div>
              ))}
            </div>
            <div className="rcm-preview-footer">
              <span>Service: {activeTab}</span>
              <span>GST: {gst}%</span>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">Summary Breakdown</h3>
            {[
              { label: "COD Charge",  value: codCharges.codCharge || 0 },
              { label: "RTO Charge",  value: rtoCharges.rtoCharge || 0 },
              { label: "Fuel Charge", value: additionalCharges.fuelCharge || 0 },
              { label: "ODA Charge",  value: odaCharge || 0 },
              { label: "Handling",    value: handlingCharge || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="rcm-summary-item">
                <span className="rcm-summary-label">{label}</span>
                <span className="rcm-summary-val">₹{value}</span>
              </div>
            ))}
          </div>

          {/* Validity Period */}
          <div className="rcm-card">
            <h3 className="rcm-card-title">Validity Period</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {effectiveFrom ? (
                <div className="rcm-summary-item">
                  <span className="rcm-summary-label">From</span>
                  <span className="rcm-summary-val">
                    {new Date(effectiveFrom).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ) : null}
              {effectiveTo ? (
                <div className="rcm-summary-item">
                  <span className="rcm-summary-label">To</span>
                  <span className="rcm-summary-val">
                    {new Date(effectiveTo).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ) : null}
              {!effectiveFrom && !effectiveTo && (
                <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", margin: "4px 0" }}>No dates configured yet</p>
              )}
            </div>
          </div>

          {/* Super Admin Note */}
          <div className="rcm-note-card">
            <p className="rcm-note-title">
              <FaShieldAlt size={15} /> Super Admin Override
            </p>
            <p className="rcm-note-body">
              You are setting merchant-specific rate card overrides. These rates will override standard courier default rates for this merchant account.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Sticky Footer */}
      <div className="rcm-sticky-footer">
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff" }}>
          Configuring <span style={{ color: "#ea580c" }}>{activeTab} Rates</span> for {courierName}
        </div>
        <div className="rcm-footer-btn-group">
          <button onClick={onReset} className="rcm-reset-btn">
            <FaUndo size={12} /> Reset
          </button>
          <button onClick={onSave} disabled={saving} className="rcm-save-btn">
            {saving ? (
              <FaSpinner size={16} className="rcm-spinner" />
            ) : (
              <FaSave size={14} />
            )}
            {saving ? "Saving…" : `Save ${activeTab} Rate Card`}
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────
// COURIER CARD (DARK SIDEBAR BACKGROUND #0f172a)
// ─────────────────────────────────────────────────────────────────

const CourierCard = ({ courier, surfaceCard, airCard, onSelect }) => {
  const isConfigured = (card) =>
    !!card &&
    card.isActive !== false &&
    card.enabled !== false &&
    ((card.forwardRates?.rate500gm || 0) > 0 || (card.forwardRates?.rate1kg || 0) > 0);
  const isSurface = isConfigured(surfaceCard);
  const isAir     = isConfigured(airCard);

  const cardStatusClass = isSurface && isAir ? "fully-configured" : isSurface || isAir ? "partially-configured" : "not-configured";

  const ServiceBlock = ({ type, card, configured }) => (
    <div className={`rcm-service-box ${configured ? "configured" : "unconfigured"}`}>
      <div className="rcm-service-box-header">
        <span className="rcm-service-title">
          <span className="rcm-service-title-icon">
            {type === "Surface" ? <FaTruck size={14} /> : <FaPlane size={14} />}
          </span>
          {type} Shipping
        </span>
        <StatusBadge active={configured} />
      </div>

      {configured ? (
        <div className="rcm-service-metrics-grid">
          {[
            { l: "Min (500g)", v: `₹${card.forwardRates?.rate500gm ?? 0}` },
            { l: "COD Charge", v: `₹${card.codCharge ?? 0}` },
            { l: "GST",        v: `${card.gst !== undefined ? card.gst : 18}%` },
            { l: "Valid From", v: card.effectiveFrom ? new Date(card.effectiveFrom).toLocaleDateString("en-IN") : "N/A" },
          ].map(({ l, v }) => (
            <div key={l} className="rcm-metric-item">
              <p className="rcm-metric-label">{l}</p>
              <p className="rcm-metric-value">{v}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rcm-unconfigured-hint">
          <FaExclamationTriangle size={13} color="#f59e0b" />
          <span>No active {type.toLowerCase()} rates set</span>
        </div>
      )}

      <button
        onClick={() => onSelect(courier, type)}
        className={configured ? "rcm-btn-edit" : "rcm-btn-configure"}
      >
        {configured ? (
          <>
            <FaEdit size={12} /> Edit {type} Rates
          </>
        ) : (
          <>
            <FaPlusCircle size={12} /> Configure {type} Rates
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className={`rcm-courier-card ${cardStatusClass}`}>
      {/* Courier Header */}
      <div className="rcm-courier-header">
        <div className="rcm-courier-identity">
          <div className="rcm-courier-avatar-box">
            <FaTruck size={22} />
          </div>
          <div>
            <h3 className="rcm-courier-name">{courier.name}</h3>
            <span className={`rcm-courier-badge-overall ${isSurface && isAir ? "full" : isSurface || isAir ? "partial" : "none"}`}>
              {isSurface && isAir ? "Fully Configured" : isSurface || isAir ? "Partially Configured" : "Not Configured"}
            </span>
          </div>
        </div>
      </div>

      {/* Surface & Air Sub-Blocks */}
      <div className="rcm-services-wrapper">
        <ServiceBlock type="Surface" card={surfaceCard} configured={isSurface} />
        <ServiceBlock type="Air" card={airCard} configured={isAir} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

const RateCardManagement = () => {
  const { merchantId } = useParams();

  // ── State ──
  const [merchantInfo, setMerchantInfo] = useState({
    companyName: "", merchantName: "", email: "", status: "",
    phone: "", gstNumber: "", walletBalance: 0, totalOrders: 0, totalShipments: 0,
  });
  const [loading, setLoading] = useState({ merchant: true, rates: false, saving: false });
  const [couriers, setCouriers]         = useState([]);
  const [assignedRates, setAssignedRates] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState("Surface");
  const [formData, setFormData]   = useState({ ...EMPTY_FORM });
  const [initialData, setInitialData] = useState({ ...EMPTY_FORM });

  // ── Search & Filter State ──
  const [searchTerm, setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  // ── Unsaved changes: browser unload ──
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const confirmIfDirty = useCallback((proceed) => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Discard them?")) proceed();
    } else {
      proceed();
    }
  }, [isDirty]);

  // ── API: Fetch merchant ──
  const fetchMerchant = useCallback(async () => {
    try {
      setLoading((p) => ({ ...p, merchant: true }));
      const res = await api.get(`/admin/merchant/${merchantId}`);
      const m = res.data.merchant || {};
      setMerchantInfo({
        companyName:    m.companyName || "",
        merchantName:   m.userId?.name || m.name || "",
        email:          m.email || "",
        status:         m.isApproved ? "Approved" : "Pending",
        phone:          m.phone || m.mobile || "",
        gstNumber:      m.gstNumber || m.gst || "",
        walletBalance:  res.data.walletBalance || 0,
        totalOrders:    res.data.totalOrders || 0,
        totalShipments: res.data.totalShipments || 0,
        isApproved:     m.isApproved,
        kycStatus:      m.kycStatus,
        isBlocked:      m.isBlocked,
      });
    } catch {
      /* silently ignore */
    } finally {
      setLoading((p) => ({ ...p, merchant: false }));
    }
  }, [merchantId]);

  const fetchCouriers = useCallback(async () => {
    try {
      const res = await api.get("/couriers/active/list");
      setCouriers(res.data.couriers || []);
    } catch {
      toast.error("Failed to load couriers.");
    }
  }, []);

  const fetchAssignedRates = useCallback(async () => {
    try {
      const res = await api.get(`/ratecards/merchant/${merchantId}`);
      setAssignedRates(res.data.rateCards || []);
    } catch {
      setAssignedRates([]);
    }
  }, [merchantId]);

  const loadCourierRates = useCallback(async (courier, serviceType) => {
    if (!courier) return;
    try {
      setLoading((p) => ({ ...p, rates: true }));
      const res = await api.get(`/ratecards/merchant/${merchantId}/${courier._id}?serviceType=${serviceType}`);
      const data = res.data?.rateCard || res.data;
      if (data && data.forwardRates) {
        const normalized = normalizeFromBackend(data);
        setFormData(normalized);
        setInitialData(normalized);
      } else {
        setFormData({ ...EMPTY_FORM });
        setInitialData({ ...EMPTY_FORM });
      }
    } catch {
      setFormData({ ...EMPTY_FORM });
      setInitialData({ ...EMPTY_FORM });
    } finally {
      setLoading((p) => ({ ...p, rates: false }));
    }
  }, [merchantId]);

  // ── Bootstrap ──
  useEffect(() => {
    fetchMerchant();
    fetchCouriers();
    fetchAssignedRates();
  }, [merchantId]);

  useEffect(() => {
    if (selectedCourier) {
      loadCourierRates(selectedCourier, activeFormTab);
    }
  }, [selectedCourier?._id, activeFormTab]);

  // ── Handlers ──
  const handleSelectCourier = (courier, type) => {
    confirmIfDirty(() => {
      setSelectedCourier(courier);
      setActiveFormTab(type);
    });
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeFormTab) return;
    confirmIfDirty(() => setActiveFormTab(newTab));
  };

  const handleBack = () => {
    confirmIfDirty(() => {
      setSelectedCourier(null);
      setFormData({ ...EMPTY_FORM });
      setInitialData({ ...EMPTY_FORM });
    });
  };

  const handleChange = (section, key, value) => {
    setFormData((prev) => {
      if (section) return { ...prev, [section]: { ...prev[section], [key]: value } };
      return { ...prev, [key]: value };
    });
  };

  const handleReset = () => setFormData({ ...initialData });

  // ── Save ──
  const handleSave = async () => {
    const errMsg = validateForm(formData);
    if (errMsg) { toast.error(errMsg); return; }

    try {
      setLoading((p) => ({ ...p, saving: true }));

      const payload = {
        merchantId,
        courierId:     selectedCourier._id,
        courierPartner:selectedCourier.code || selectedCourier.name,
        serviceType:   activeFormTab,
        forwardRates: {
          rate500gm:    Number(formData.forwardRates.rate500gm)    || 0,
          rate1kg:      Number(formData.forwardRates.rate1kg)      || 0,
          rate2kg:      Number(formData.forwardRates.rate2kg)      || 0,
          rate5kg:      Number(formData.forwardRates.rate5kg)      || 0,
          additionalKg: Number(formData.forwardRates.additionalKg) || 0,
        },
        zoneRates: {
          local:    Number(formData.zoneRates.local)    || 0,
          regional: Number(formData.zoneRates.regional) || 0,
          national: Number(formData.zoneRates.national) || 0,
        },
        codCharge:     Number(formData.codCharges.codCharge)            || 0,
        rtoCharge:     Number(formData.rtoCharges.rtoCharge)            || 0,
        reversePickup: Number(formData.additionalCharges.reversePickup) || 0,
        fuelCharge:    Number(formData.additionalCharges.fuelCharge)    || 0,
        gst:           Number(formData.gst) || 18,
        odaCharge:     Number(formData.odaCharge)      || 0,
        handlingCharge:Number(formData.handlingCharge) || 0,
        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveTo:   formData.effectiveTo   || undefined,
        serviceability: formData.serviceability,
        enabled:  true,
        isActive: true,
      };

      const res = await api.post("/ratecards/save", payload);

      if (res.data?.success) {
        toast.success(`${activeFormTab} Rate Card saved successfully!`);
        setInitialData({ ...formData });
        await fetchAssignedRates();
        await loadCourierRates(selectedCourier, activeFormTab);
      } else {
        toast.error(res.data?.message || `Failed to save ${activeFormTab} rate card.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save rate card.");
    } finally {
      setLoading((p) => ({ ...p, saving: false }));
    }
  };

  // ── Derived ──
  const getRateCard = (courierId, serviceType) =>
    assignedRates.find(
      (r) =>
        String(r.courierId?._id || r.courierId) === String(courierId) &&
        (r.serviceType || "Surface") === serviceType
    );

  const configuredCount = assignedRates.filter((r) => r.isActive !== false).length;

  // Search & Filter Logic
  const filteredCouriers = couriers.filter((courier) => {
    const matchesSearch = courier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const surface = getRateCard(courier._id, "Surface");
    const air     = getRateCard(courier._id, "Air");
    const isSurface = surface && surface.isActive !== false;
    const isAir     = air && air.isActive !== false;

    if (statusFilter === "full") return matchesSearch && isSurface && isAir;
    if (statusFilter === "partial") return matchesSearch && (isSurface || isAir) && !(isSurface && isAir);
    if (statusFilter === "none") return matchesSearch && !isSurface && !isAir;
    return matchesSearch;
  });

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  if (loading.merchant) {
    return (
      <SuperAdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <FaSpinner size={36} color="#ea580c" className="rcm-spinner" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="rcm-container">
        {/* Page Header */}
        <div className="rcm-header">
          <div className="rcm-header-left">
            <h1 className="rcm-title">
              <div className="rcm-title-icon-wrapper">
                <FaReceipt size={20} />
              </div>
              Merchant Rate Management
            </h1>
            <p className="rcm-subtitle">
              Configure and manage custom Surface & Air rate cards for courier partners
            </p>
          </div>
          {isDirty && (
            <div className="rcm-unsaved-badge">
              <FaExclamationTriangle size={14} /> Unsaved Changes
            </div>
          )}
        </div>

        {/* Hero Merchant Card (Clean Light Styling) */}
        <div className="rcm-merchant-card">
          <div className="rcm-merchant-card-header">
            <div className="rcm-merchant-title-group">
              <div className="rcm-merchant-avatar">
                {merchantInfo.companyName ? merchantInfo.companyName.charAt(0).toUpperCase() : <FaBuilding />}
              </div>
              <div>
                <h2 className="rcm-merchant-name-title">{merchantInfo.companyName || "Merchant Details"}</h2>
                <p className="rcm-merchant-company-sub">{merchantInfo.merchantName ? `Owner: ${merchantInfo.merchantName}` : "Merchant Account"}</p>
              </div>
            </div>
            <span style={{
              display: "inline-block", padding: "4px 14px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "800",
              background: merchantInfo.status === "Approved" ? "#dcfce7" : "#fef3c7",
              color: merchantInfo.status === "Approved" ? "#166534" : "#92400e",
              border: `1px solid ${merchantInfo.status === "Approved" ? "#bbf7d0" : "#fde68a"}`,
            }}>{merchantInfo.status || "—"}</span>
          </div>

          <div className="rcm-merchant-grid">
            <div className="rcm-merchant-item">
              <p className="rcm-merchant-item-label">Email</p>
              <p className="rcm-merchant-item-value">{merchantInfo.email || "—"}</p>
            </div>
            <div className="rcm-merchant-item">
              <p className="rcm-merchant-item-label">Phone</p>
              <p className="rcm-merchant-item-value">{merchantInfo.phone || "—"}</p>
            </div>
            <div className="rcm-merchant-item">
              <p className="rcm-merchant-item-label">GST No</p>
              <p className="rcm-merchant-item-value">{merchantInfo.gstNumber || "—"}</p>
            </div>
            <div className="rcm-merchant-item">
              <p className="rcm-merchant-item-label">KYC Status</p>
              <p className="rcm-merchant-item-value">{merchantInfo.kycStatus || "Verified"}</p>
            </div>
            <div className="rcm-merchant-item">
              <p className="rcm-merchant-item-label">Account State</p>
              <p className="rcm-merchant-item-value" style={{ color: merchantInfo.isBlocked ? "#dc2626" : "#16a34a" }}>
                {merchantInfo.isBlocked ? "Blocked" : "Active"}
              </p>
            </div>
            <div className="rcm-merchant-item" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <p className="rcm-merchant-item-label" style={{ color: "#166534" }}>Wallet Balance</p>
              <p className="rcm-merchant-item-value highlight-wallet">₹{merchantInfo.walletBalance || 0}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="rcm-stats-grid">
          {[
            { label: "Total Couriers",   value: couriers.length,                  icon: FaTruck,        iconBg: "#fff7ed", iconColor: "#ea580c" },
            { label: "Configured Cards", value: configuredCount,                  icon: FaCheckCircle,  iconBg: "#f0fdf4", iconColor: "#16a34a" },
            { label: "Total Orders",     value: merchantInfo.totalOrders || 0,    icon: FaBoxes,        iconBg: "#eff6ff", iconColor: "#2563eb" },
            { label: "Total Shipments",  value: merchantInfo.totalShipments || 0, icon: FaPlane,        iconBg: "#faf5ff", iconColor: "#9333ea" },
          ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="rcm-stat-card">
              <div className="rcm-stat-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
                <Icon size={22} />
              </div>
              <div className="rcm-stat-info">
                <p className="rcm-stat-label">{label}</p>
                <p className="rcm-stat-value">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Section */}
        {!selectedCourier ? (
          <>
            {/* Filter & Search Toolbar */}
            <div className="rcm-filter-toolbar">
              <div className="rcm-search-box">
                <FaSearch className="rcm-search-icon" />
                <input
                  type="text"
                  placeholder="Search courier partner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rcm-search-input"
                />
              </div>

              <div className="rcm-filter-pills">
                {[
                  { id: "all", label: "All Couriers" },
                  { id: "full", label: "Fully Configured" },
                  { id: "partial", label: "Partially Configured" },
                  { id: "none", label: "Not Configured" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setStatusFilter(id)}
                    className={`rcm-filter-btn ${statusFilter === id ? "active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Courier Grid (Cards have #0f172a Sidebar Dark BG) */}
            {filteredCouriers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <FaTruck size={44} color="#cbd5e1" style={{ marginBottom: "14px" }} />
                <p style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>No Couriers Found</p>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Try resetting search filters or checking courier status.</p>
              </div>
            ) : (
              <div className="rcm-couriers-grid">
                {filteredCouriers.map((courier) => (
                  <CourierCard
                    key={courier._id}
                    courier={courier}
                    surfaceCard={getRateCard(courier._id, "Surface")}
                    airCard={getRateCard(courier._id, "Air")}
                    onSelect={handleSelectCourier}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {loading.rates ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <FaSpinner size={36} color="#ea580c" className="rcm-spinner" />
                <p style={{ color: "#64748b", marginTop: "14px", fontSize: "14px", fontWeight: "700" }}>
                  Loading {activeFormTab} rates for {selectedCourier.name}…
                </p>
              </div>
            ) : (
              <RateForm
                formData={formData}
                onChange={handleChange}
                onSave={handleSave}
                onReset={handleReset}
                onBack={handleBack}
                saving={loading.saving}
                activeTab={activeFormTab}
                onTabChange={handleTabChange}
                courierName={selectedCourier.name}
              />
            )}
          </>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop />
    </SuperAdminLayout>
  );
};

export default RateCardManagement;