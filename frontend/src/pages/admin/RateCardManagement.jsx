import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { FaTruck, FaPlane, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";

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
      rate500gm:   str(data.forwardRates?.rate500gm),
      rate1kg:     str(data.forwardRates?.rate1kg),
      rate2kg:     str(data.forwardRates?.rate2kg),
      rate5kg:     str(data.forwardRates?.rate5kg),
      additionalKg:str(data.forwardRates?.additionalKg),
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
    gst:          data.gst !== undefined && data.gst !== null ? Number(data.gst) : 18,
    odaCharge:    str(data.odaCharge),
    handlingCharge: str(data.handlingCharge),
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
  if (Number(formData.forwardRates.rate500gm)  < 0) return "500gm rate cannot be negative.";
  if (Number(formData.forwardRates.rate1kg)    < 0) return "1kg rate cannot be negative.";
  if (Number(formData.forwardRates.rate2kg)    < 0) return "2kg rate cannot be negative.";
  if (Number(formData.forwardRates.rate5kg)    < 0) return "5kg rate cannot be negative.";
  if (Number(formData.forwardRates.additionalKg) < 0) return "Additional kg rate cannot be negative.";
  if (Number(formData.zoneRates.local)    < 0) return "Local zone rate cannot be negative.";
  if (Number(formData.zoneRates.regional) < 0) return "Regional zone rate cannot be negative.";
  if (Number(formData.zoneRates.national) < 0) return "National zone rate cannot be negative.";
  if (Number(formData.codCharges.codCharge)            < 0) return "COD charge cannot be negative.";
  if (Number(formData.rtoCharges.rtoCharge)            < 0) return "RTO charge cannot be negative.";
  if (Number(formData.additionalCharges.reversePickup) < 0) return "Reverse pickup cannot be negative.";
  if (Number(formData.additionalCharges.fuelCharge)    < 0) return "Fuel charge cannot be negative.";
  if (Number(formData.odaCharge)    < 0) return "ODA charge cannot be negative.";
  if (Number(formData.handlingCharge) < 0) return "Handling charge cannot be negative.";
  if (formData.effectiveFrom && formData.effectiveTo) {
    if (new Date(formData.effectiveTo) < new Date(formData.effectiveFrom))
      return "Effective To must be ≥ Effective From.";
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────
// STYLE TOKENS
// ─────────────────────────────────────────────────────────────────
const S = {
  input: {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1px solid #e2e8f0", fontSize: "14px", outline: "none",
    boxSizing: "border-box", background: "#fff", color: "#0f172a",
    transition: "border-color 0.15s",
  },
  label: { display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px", fontWeight: "500" },
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px",
    padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: "14px", fontWeight: "700", marginBottom: "16px",
    paddingBottom: "10px", borderBottom: "2px solid #f1f5f9", color: "#0f172a",
  },
  primaryBtn: {
    padding: "10px 28px", background: "#ea580c", color: "#fff",
    border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700",
    fontSize: "14px", transition: "background 0.2s", display: "flex",
    alignItems: "center", gap: "8px",
  },
  secondaryBtn: {
    padding: "10px 20px", background: "transparent", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer",
    fontWeight: "500", fontSize: "14px", transition: "all 0.2s",
  },
};

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (inline, no file split)
// ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", background: "#fff" }}>
    {[100, 70, 90, 60, 80, 50].map((w, i) => (
      <div key={i} style={{
        height: i === 0 ? "20px" : "14px", width: `${w}%`,
        background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
        backgroundSize: "200% 100%", borderRadius: "6px", marginBottom: "12px",
        animation: "shimmer 1.5s infinite",
      }} />
    ))}
  </div>
);

const ConfigBadge = ({ configured }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700",
    background: configured ? "#dcfce7" : "#fff1f2",
    color: configured ? "#15803d" : "#be123c",
  }}>
    {configured ? <FaCheckCircle size={10} /> : <FaExclamationTriangle size={10} />}
    {configured ? "Configured" : "Not Configured"}
  </span>
);

const FormInput = ({ label, value, onChange, type = "number", placeholder = "₹", disabled = false, required = false }) => (
  <div>
    <label style={S.label}>{label}{required && <span style={{ color: "#ea580c", marginLeft: "3px" }}>*</span>}</label>
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)} disabled={disabled}
      style={{ ...S.input, background: disabled ? "#f8fafc" : "#fff", cursor: disabled ? "not-allowed" : "text" }}
      onFocus={(e) => { if (!disabled) e.target.style.borderColor = "#ea580c"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; }}
    />
  </div>
);

const CheckboxToggle = ({ label, checked, onChange }) => (
  <label style={{
    display: "flex", alignItems: "center", gap: "10px",
    cursor: "pointer", padding: "10px 14px",
    border: "1px solid", borderRadius: "10px",
    borderColor: checked ? "#ea580c" : "#e2e8f0",
    background: checked ? "#fff7ed" : "#f8fafc",
    transition: "all 0.2s",
  }}>
    <div onClick={onChange} style={{
      width: "38px", height: "20px", borderRadius: "10px",
      background: checked ? "#ea580c" : "#cbd5e1",
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: "2px",
        left: checked ? "20px" : "2px",
        width: "16px", height: "16px", borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
    <span style={{ fontSize: "13px", fontWeight: "600", color: checked ? "#ea580c" : "#64748b" }}>
      {label}
    </span>
  </label>
);

// ─────────────────────────────────────────────────────────────────
// RATE FORM — renders the full form for Surface or Air
// ─────────────────────────────────────────────────────────────────
const RateForm = ({ formData, onChange, onSave, onReset, onBack, saving, activeTab, onTabChange, courierName }) => {
  const { forwardRates, codCharges, rtoCharges, additionalCharges, zoneRates,
          gst, odaCharge, handlingCharge, effectiveFrom, effectiveTo, serviceability } = formData;

  const field = (section, key, val) => onChange(section, key, val);

  const preview = [
    { label: "500gm", value: forwardRates.rate500gm || 0 },
    { label: "1kg",   value: forwardRates.rate1kg   || 0 },
    { label: "2kg",   value: forwardRates.rate2kg   || 0 },
    { label: "5kg",   value: forwardRates.rate5kg   || 0 },
    { label: "Local",    value: zoneRates.local    || 0 },
    { label: "Regional", value: zoneRates.regional || 0 },
    { label: "National", value: zoneRates.national || 0 },
  ];

  return (
    <>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Back + Courier label */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={onBack}
          style={{ padding: "6px 14px", border: "none", borderRadius: "8px", background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
        >
          ← Back to Couriers
        </button>
        <span style={{ fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>
          {courierName}
        </span>
        <ConfigBadge configured={false} />
      </div>

      {/* Surface / Air Tab */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px" }}>
        {["Surface", "Air"].map((tab) => (
          <button key={tab} onClick={() => onTabChange(tab)} style={{
            padding: "9px 24px", borderRadius: "8px", border: "none",
            background: activeTab === tab ? "#ea580c" : "#f1f5f9",
            color: activeTab === tab ? "#fff" : "#475569",
            fontWeight: "700", cursor: "pointer", fontSize: "14px",
            boxShadow: activeTab === tab ? "0 4px 6px -1px rgba(234,88,12,0.25)" : "none",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: "7px",
          }}>
            {tab === "Surface" ? <FaTruck size={13} /> : <FaPlane size={13} />}
            {tab} Rates
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>

        {/* LEFT */}
        <div>
          {/* Basic Information */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Basic Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <FormInput label="Service Type" value={activeTab} onChange={() => {}} disabled placeholder="" type="text" />
              <FormInput label="GST (%)" value={gst} onChange={(v) => onChange(null, "gst", v)} required />
              <FormInput label="Effective From" value={effectiveFrom} onChange={(v) => onChange(null, "effectiveFrom", v)} type="date" placeholder="" required />
              <FormInput label="Effective To" value={effectiveTo} onChange={(v) => onChange(null, "effectiveTo", v)} type="date" placeholder="" required />
            </div>
          </div>

          {/* Forward Rates */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Forward Rates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <FormInput label="500gm" value={forwardRates.rate500gm} onChange={(v) => field("forwardRates","rate500gm",v)} required />
              <FormInput label="1kg"   value={forwardRates.rate1kg}   onChange={(v) => field("forwardRates","rate1kg",v)} />
              <FormInput label="2kg"   value={forwardRates.rate2kg}   onChange={(v) => field("forwardRates","rate2kg",v)} />
              <FormInput label="5kg"   value={forwardRates.rate5kg}   onChange={(v) => field("forwardRates","rate5kg",v)} />
              <FormInput label="Additional KG" value={forwardRates.additionalKg} onChange={(v) => field("forwardRates","additionalKg",v)} />
            </div>
          </div>

          {/* Zone Rates */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Zone Rates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <FormInput label="Local"    value={zoneRates.local}    onChange={(v) => field("zoneRates","local",v)} />
              <FormInput label="Regional" value={zoneRates.regional} onChange={(v) => field("zoneRates","regional",v)} />
              <FormInput label="National" value={zoneRates.national} onChange={(v) => field("zoneRates","national",v)} />
            </div>
          </div>

          {/* Charges */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Charges</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <FormInput label="COD Charge"     value={codCharges.codCharge}              onChange={(v) => field("codCharges","codCharge",v)} required />
              <FormInput label="RTO Charge"     value={rtoCharges.rtoCharge}             onChange={(v) => field("rtoCharges","rtoCharge",v)} />
              <FormInput label="Reverse Pickup" value={additionalCharges.reversePickup}  onChange={(v) => field("additionalCharges","reversePickup",v)} />
              <FormInput label="Fuel Charge"    value={additionalCharges.fuelCharge}     onChange={(v) => field("additionalCharges","fuelCharge",v)} />
              <FormInput label="ODA Charge"     value={odaCharge}     onChange={(v) => onChange(null,"odaCharge",v)} />
              <FormInput label="Handling Charge" value={handlingCharge} onChange={(v) => onChange(null,"handlingCharge",v)} />
            </div>
          </div>

          {/* Serviceability */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Serviceability</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              <CheckboxToggle label="COD Enabled"     checked={serviceability.codEnabled}     onChange={() => onChange("serviceability","codEnabled",    !serviceability.codEnabled)} />
              <CheckboxToggle label="Prepaid Enabled" checked={serviceability.prepaidEnabled} onChange={() => onChange("serviceability","prepaidEnabled", !serviceability.prepaidEnabled)} />
              <CheckboxToggle label="RTO Enabled"     checked={serviceability.rtoEnabled}     onChange={() => onChange("serviceability","rtoEnabled",    !serviceability.rtoEnabled)} />
              <CheckboxToggle label="Reverse Pickup"  checked={serviceability.reversePickup}  onChange={() => onChange("serviceability","reversePickup", !serviceability.reversePickup)} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* Rate Preview */}
          <div style={{ ...S.card, background: "#f8fafc", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Live Preview</h3>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#ea580c" }}>{courierName}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {preview.map(({ label, value }) => (
                <div key={label} style={{ background: "#fff", borderRadius: "10px", padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 4px" }}>{label}</p>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>₹{value || 0}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "14px", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Service: {activeTab}</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>GST: {gst}%</span>
            </div>
          </div>

          {/* Quick summary */}
          <div style={{ ...S.card }}>
            <h3 style={{ ...S.sectionTitle, marginBottom: "12px" }}>Summary</h3>
            {[
              { label: "COD Charge",     value: codCharges.codCharge || 0 },
              { label: "RTO Charge",     value: rtoCharges.rtoCharge || 0 },
              { label: "Fuel Charge",    value: additionalCharges.fuelCharge || 0 },
              { label: "ODA Charge",     value: odaCharge || 0 },
              { label: "Handling",       value: handlingCharge || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>₹{value}</span>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div style={{ ...S.card }}>
            <h3 style={{ ...S.sectionTitle, marginBottom: "12px" }}>Validity Period</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {effectiveFrom && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>From</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {new Date(effectiveFrom).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {effectiveTo && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>To</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {new Date(effectiveTo).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {(!effectiveFrom && !effectiveTo) && (
                <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", margin: "8px 0 0" }}>No dates set yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{
        position: "sticky", bottom: 0, background: "#fff",
        borderTop: "1px solid #e2e8f0", padding: "14px 24px",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "flex-end", gap: "10px",
        marginTop: "20px", borderRadius: "0 0 14px 14px", zIndex: 10,
      }}>
        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px", color: "#b45309", fontSize: "13px", background: "#fef3c7", padding: "6px 12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
          <FaExclamationTriangle size={14} />
          <span>🔒 Read Only: Custom Rate Cards can only be configured by SuperAdmin.</span>
        </div>
        <button
          onClick={onReset}
          style={S.secondaryBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          Reset
        </button>
        <button
          disabled={true}
          style={{
            ...S.primaryBtn,
            background: "#cbd5e1",
            color: "#64748b",
            cursor: "not-allowed",
            border: "1px solid #94a3b8",
          }}
          title="SuperAdmin permission required to save rate cards"
        >
          🔒 Save Disabled (SuperAdmin Only)
        </button>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────
// COURIER CARD
// ─────────────────────────────────────────────────────────────────
const CourierCard = ({ courier, surfaceCard, airCard, onSelect }) => {
  const isConfigured = (card) => !!card && card.isActive !== false;
  const isSurface = isConfigured(surfaceCard);
  const isAir     = isConfigured(airCard);

  const ServiceSection = ({ type, card, configured }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
          {type === "Surface" ? <FaTruck size={12} /> : <FaPlane size={12} />}
          {type} Shipping
        </span>
        <ConfigBadge configured={configured} />
      </div>

      {configured && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "8px", padding: "10px", background: "#f8fafc",
          borderRadius: "10px", border: "1px solid #f1f5f9",
        }}>
          {[
            { l: "Min (500g)", v: `₹${card.forwardRates?.rate500gm ?? 0}` },
            { l: "COD Charge", v: `₹${card.codCharge ?? 0}` },
            { l: "GST",        v: `${card.gst !== undefined ? card.gst : 18}%` },
            { l: "Valid From", v: card.effectiveFrom ? new Date(card.effectiveFrom).toLocaleDateString("en-IN") : "N/A" },
          ].map(({ l, v }) => (
            <div key={l}>
              <p style={{ fontSize: "10px", color: "#94a3b8", margin: "0 0 2px" }}>{l}</p>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onSelect(courier, type)}
        style={{
          width: "100%", padding: "8px", borderRadius: "8px", cursor: "pointer",
          fontWeight: "700", fontSize: "13px", transition: "all 0.2s",
          border: configured ? "1.5px solid #ea580c" : "none",
          background: configured ? "transparent" : "#ea580c",
          color: configured ? "#ea580c" : "#fff",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = configured ? "#fff7ed" : "#c2410c";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = configured ? "transparent" : "#ea580c";
        }}
      >
        {configured ? `Edit ${type} Rates` : `Configure ${type} Rates`}
      </button>
    </div>
  );

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px",
      background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: "16px",
      transition: "all 0.2s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ background: "#fff7ed", padding: "10px", borderRadius: "10px" }}>
          <FaTruck size={22} color="#ea580c" />
        </div>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "#0f172a" }}>{courier.name}</h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>
            {isSurface && isAir ? "✅ Fully Configured" : isSurface || isAir ? "⚡ Partially Configured" : "⚠️ Not Configured"}
          </p>
        </div>
      </div>

      <ServiceSection type="Surface" card={surfaceCard} configured={isSurface} />
      <div style={{ borderTop: "1px dashed #e2e8f0" }} />
      <ServiceSection type="Air" card={airCard} configured={isAir} />
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
  const [couriers, setCouriers] = useState([]);
  const [assignedRates, setAssignedRates] = useState([]);

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState("Surface"); // "Surface" | "Air"
  const [formData, setFormData]     = useState({ ...EMPTY_FORM });
  const [initialData, setInitialData] = useState({ ...EMPTY_FORM });

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

  // ── Helpers ──
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
      /* silently fallback — merchant info non-critical */
    } finally {
      setLoading((p) => ({ ...p, merchant: false }));
    }
  }, [merchantId]);

  // ── API: Fetch couriers list ──
  const fetchCouriers = useCallback(async () => {
    try {
      const res = await api.get("/couriers/active/list");
      setCouriers(res.data.couriers || []);
    } catch {
      toast.error("Failed to load couriers.");
    }
  }, []);

  // ── API: Fetch all assigned rate cards ──
  const fetchAssignedRates = useCallback(async () => {
    try {
      const res = await api.get(`/ratecards/merchant/${merchantId}`);
      setAssignedRates(res.data.rateCards || []);
    } catch {
      setAssignedRates([]);
    }
  }, [merchantId]);

  // ── API: Load rate for specific courier + serviceType ──
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

  // ── Re-load when courier or tab changes ──
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

  // Generic form field updater
  const handleChange = (section, key, value) => {
    setFormData((prev) => {
      if (section) {
        return { ...prev, [section]: { ...prev[section], [key]: value } };
      }
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
        courierId:      selectedCourier._id,
        courierPartner: selectedCourier.code || selectedCourier.name,
        serviceType:    activeFormTab,
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
        codCharge:     Number(formData.codCharges.codCharge)             || 0,
        rtoCharge:     Number(formData.rtoCharges.rtoCharge)             || 0,
        reversePickup: Number(formData.additionalCharges.reversePickup)  || 0,
        fuelCharge:    Number(formData.additionalCharges.fuelCharge)     || 0,
        gst:           Number(formData.gst) || 18,
        odaCharge:     Number(formData.odaCharge)     || 0,
        handlingCharge:Number(formData.handlingCharge) || 0,
        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveTo:   formData.effectiveTo   || undefined,
        serviceability: formData.serviceability,
        enabled: true,
        isActive: true,
      };

      const res = await api.post("/ratecards/save", payload);

      if (res.data?.success) {
        toast.success(`${activeFormTab} Rate Card saved successfully!`);
        setInitialData({ ...formData });

        // Refresh everything sequentially
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

  // ── Derived helpers ──
  const getRateCard = (courierId, serviceType) =>
    assignedRates.find(
      (r) =>
        String(r.courierId?._id || r.courierId) === String(courierId) &&
        (r.serviceType || "Surface") === serviceType
    );

  const configuredCount = assignedRates.filter((r) => r.isActive !== false).length;

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  if (loading.merchant) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: "280px", display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
          <AdminTopbar />
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <FaSpinner size={32} color="#ea580c" style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: "280px", display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden", background: "#f8fafc" }}>
        <AdminTopbar />
        <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "24px", paddingBottom: "120px", width: "100%", boxSizing: "border-box" }}>

          <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>

          {/* ── Page Header ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px", color: "#0f172a" }}>
                Rate Card Management
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Manage Surface & Air rate cards independently for each courier partner
              </p>
            </div>
            {isDirty && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 14px", background: "#fff7ed", borderRadius: "10px",
                border: "1px solid #fed7aa", fontSize: "13px", color: "#c2410c", fontWeight: "600",
              }}>
                ⚠️ Unsaved Changes
              </div>
            )}
          </div>

          {/* ── Merchant Info Card ── */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "#0f172a" }}>Merchant Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "16px" }}>
              {[
                { label: "Company",    value: merchantInfo.companyName },
                { label: "Merchant",   value: merchantInfo.merchantName },
                { label: "Email",      value: merchantInfo.email },
                { label: "Status",     value: merchantInfo.status, badge: true },
                { label: "Phone",      value: merchantInfo.phone },
                { label: "GST No",     value: merchantInfo.gstNumber },
                { label: "Wallet",     value: `₹${merchantInfo.walletBalance || 0}`, highlight: true },
              ].map(({ label, value, badge, highlight }) => (
                <div key={label}>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", fontWeight: "500" }}>{label}</p>
                  {badge ? (
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "700",
                      background: value === "Approved" ? "#dcfce7" : "#fef3c7",
                      color: value === "Approved" ? "#166534" : "#92400e",
                    }}>{value || "—"}</span>
                  ) : (
                    <p style={{ fontSize: "14px", fontWeight: highlight ? "800" : "600", color: highlight ? "#16a34a" : "#0f172a", margin: 0 }}>
                      {value || "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
            {[
              { label: "Total Couriers",  value: couriers.length,       color: "#0f172a" },
              { label: "Configured",      value: configuredCount,        color: "#16a34a" },
              { label: "Total Orders",    value: merchantInfo.totalOrders || 0,    color: "#0f172a" },
              { label: "Total Shipments", value: merchantInfo.totalShipments || 0, color: "#0f172a" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", fontWeight: "500" }}>{label}</p>
                <p style={{ fontSize: "28px", fontWeight: "800", color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Main Content: Cards OR Form ── */}
          {!selectedCourier ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Courier Partners ({couriers.length})
                </h2>
              </div>

              {couriers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  <FaTruck size={48} color="#e2e8f0" style={{ marginBottom: "16px" }} />
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>No Couriers Found</p>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>No active courier partners available.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                  {couriers.map((courier) => (
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
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <FaSpinner size={28} color="#ea580c" style={{ animation: "spin 0.8s linear infinite" }} />
                  <p style={{ color: "#64748b", marginTop: "12px", fontSize: "14px" }}>
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
      </div>
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default RateCardManagement;