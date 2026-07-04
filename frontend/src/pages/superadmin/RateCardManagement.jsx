import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../services/api";
import { FaTruck } from "react-icons/fa";

const RateCardManagement = () => {
  const { merchantId } = useParams();

  // ===================== STATE =====================
  
  // Merchant info state - Will come from API
  const [merchantInfo, setMerchantInfo] = useState({
    companyName: "",
    merchantName: "",
    email: "",
    status: "",
    phone: "",
    gstNumber: "",
    walletBalance: 0,
    totalOrders: 0,
    totalShipments: 0,
  });

  // Loading states
  const [loading, setLoading] = useState({
    merchant: true,
    rates: true,
    saving: false,
  });

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [couriers, setCouriers] = useState([]);

  // Rate form state for selected courier
  const [rates, setRates] = useState({
    forwardRates: {
      rate500gm: "",
      rate1kg: "",
      rate2kg: "",
      rate5kg: "",
      additionalKg: "",
    },
    codCharges: {
      codCharge: "",
    },
    rtoCharges: {
      rtoCharge: "",
    },
    additionalCharges: {
      reversePickup: "",
      fuelCharge: "",
    },
  });

  // Zone Rates State
  const [zoneRates, setZoneRates] = useState({
    local: "",
    regional: "",
    national: "",
  });

  // Assigned Rates - Will come from API
  const [assignedRates, setAssignedRates] = useState([]);

  // Serviceability Settings
  const [serviceability, setServiceability] = useState({
    codEnabled: true,
    prepaidEnabled: true,
    rtoEnabled: true,
    reversePickup: true,
  });

  // ===================== API CALLS =====================

  // 1. Fetch Merchant Info
  const fetchMerchant = async () => {
    try {
      setLoading(prev => ({ ...prev, merchant: true }));
      const response = await api.get(`/admin/merchant/${merchantId}`);
      
      setMerchantInfo({
        companyName: response.data.merchant?.companyName || "",
        merchantName: response.data.merchant?.userId?.name || 
                      response.data.merchant?.name || 
                      "",
        email: response.data.merchant?.email || "",
        status: response.data.merchant?.isApproved ? "Approved" : "Pending",
        phone: response.data.merchant?.phone || 
               response.data.merchant?.mobile || 
               "+91 98765 43210",
        gstNumber: response.data.merchant?.gstNumber || 
                   response.data.merchant?.gst || 
                   "22AAAAA0000A1Z5",
        walletBalance: response.data.walletBalance || 0,
        totalOrders: response.data.totalOrders || 0,
        totalShipments: response.data.totalShipments || 0,
        isApproved: response.data.merchant?.isApproved,
        kycStatus: response.data.merchant?.kycStatus,
        isBlocked: response.data.merchant?.isBlocked,
      });
    } catch (error) {
      console.error("Error fetching merchant:", error);
      setMerchantInfo({
        companyName: "ABC Traders",
        merchantName: "Arjun Singh",
        email: "merchant@gmail.com",
        status: "Approved",
        phone: "+91 98765 43210",
        gstNumber: "22AAAAA0000A1Z5",
        walletBalance: 12500,
        totalOrders: 156,
        totalShipments: 142,
      });
    } finally {
      setLoading(prev => ({ ...prev, merchant: false }));
    }
  };

  // 2. Fetch Couriers
  const fetchCouriers = async () => {
    try {
      const response = await api.get("/couriers/active/list");
      setCouriers(response.data.couriers || []);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  // 3. Fetch All Assigned Rates - ✅ FIXED
  const fetchAssignedRates = async () => {
    try {
      const response = await api.get(`/ratecards/merchant/${merchantId}`);
      
      // ✅ FIXED: Access rateCards array from response
      setAssignedRates(response.data.rateCards || []);
    } catch (error) {
      console.error("Error fetching assigned rates:", error);
      setAssignedRates([]);
    }
  };

  // 4. Load Rates for Selected Courier
  const loadCourierRates = async () => {
    try {
      setLoading(prev => ({ ...prev, rates: true }));
      const response = await api.get(`/ratecards/merchant/${merchantId}/${selectedCourier._id}`);
      
      // Handle response properly
      const data = response.data?.rateCard || response.data;
      
      if (data && data.forwardRates) {
        setRates({
          forwardRates: {
            rate500gm: data.forwardRates?.rate500gm || "",
            rate1kg: data.forwardRates?.rate1kg || "",
            rate2kg: data.forwardRates?.rate2kg || "",
            rate5kg: data.forwardRates?.rate5kg || "",
            additionalKg: data.forwardRates?.additionalKg || "",
          },
          codCharges: {
            codCharge: data.codCharge || "",
          },
          rtoCharges: {
            rtoCharge: data.rtoCharge || "",
          },
          additionalCharges: {
            reversePickup: data.reversePickup || "",
            fuelCharge: data.fuelCharge || "",
          },
        });
        
        setZoneRates({
          local: data.zoneRates?.local || "",
          regional: data.zoneRates?.regional || "",
          national: data.zoneRates?.national || "",
        });
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Error loading courier rates:", error);
      resetForm();
    } finally {
      setLoading(prev => ({ ...prev, rates: false }));
    }
  };

  // Reset form helper
  const resetForm = () => {
    setRates({
      forwardRates: {
        rate500gm: "",
        rate1kg: "",
        rate2kg: "",
        rate5kg: "",
        additionalKg: "",
      },
      codCharges: {
        codCharge: "",
      },
      rtoCharges: {
        rtoCharge: "",
      },
      additionalCharges: {
        reversePickup: "",
        fuelCharge: "",
      },
    });
    setZoneRates({
      local: "",
      regional: "",
      national: "",
    });
  };

  // ===================== EFFECTS =====================

  useEffect(() => {
    fetchMerchant();
    fetchAssignedRates();
    fetchCouriers();
  }, [merchantId]);

  useEffect(() => {
    if (selectedCourier) {
      loadCourierRates();
    }
  }, [selectedCourier]);

  // ===================== HANDLERS =====================

  const handleChange = (section, field, value) => {
    setRates({
      ...rates,
      [section]: {
        ...rates[section],
        [field]: value,
      },
    });
  };

  const handleServiceabilityChange = (field) => {
    setServiceability({
      ...serviceability,
      [field]: !serviceability[field],
    });
  };

  // ===================== SAVE RATES =====================
  const saveRates = async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      
      const payload = {
        merchantId,
        courierId: selectedCourier._id,
        courierPartner: selectedCourier.code || selectedCourier.name,
        forwardRates: rates.forwardRates,
        zoneRates,
        codCharge: rates.codCharges.codCharge,
        rtoCharge: rates.rtoCharges.rtoCharge,
        reversePickup: rates.additionalCharges.reversePickup,
        fuelCharge: rates.additionalCharges.fuelCharge,
        enabled: true,
        isActive: true,
        serviceability,
      };
      
      const response = await api.post("/ratecards/save", payload);
      
      if (response.status === 200 || response.status === 201) {
        alert("Rate card saved successfully!");
        await fetchAssignedRates();
        await loadCourierRates();
      }
    } catch (error) {
      console.error("Error saving rates:", error);
      alert("Failed to save rate card. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // ===================== CALCULATIONS =====================

  const calculatePreview = () => {
    return {
      forward500gm: rates.forwardRates.rate500gm || 0,
      forward1kg: rates.forwardRates.rate1kg || 0,
      forward2kg: rates.forwardRates.rate2kg || 0,
      forward5kg: rates.forwardRates.rate5kg || 0,
      local: zoneRates.local || 0,
      regional: zoneRates.regional || 0,
      national: zoneRates.national || 0,
    };
  };

  const calculateMargin = () => {
    const courierCost = Number(rates.forwardRates.rate500gm) || 45;
    const merchantRate = Number(rates.forwardRates.rate1kg) || 60;
    return {
      courierCost,
      merchantRate,
      profit: merchantRate - courierCost,
    };
  };

  // ===================== STYLES =====================

  const summaryCard = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    textAlign: "center",
  };

  const secondaryBtn = {
    padding: "10px 24px",
    background: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s",
  };

  const primaryBtn = {
    padding: "10px 32px",
    background: "#ea580c",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  };

  // ===================== RENDER =====================

  if (loading.merchant) {
    return (
      <SuperAdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <p>Loading merchant details...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
          paddingBottom: "100px",
        }}
      >
        {/* ================= HEADER ================= */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#0f172a",
          }}
        >
          Rate Card Management
        </h1>

        {/* ================= MERCHANT INFORMATION CARD ================= */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#0f172a",
            }}
          >
            Merchant Information
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Company Name
              </p>
              <p style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                {merchantInfo.companyName || "-"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Merchant
              </p>
              <p style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                {merchantInfo.merchantName || "-"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Email
              </p>
              <p style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                {merchantInfo.email || "-"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Status
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500",
                  background: merchantInfo.status === "Approved" ? "#dcfce7" : "#fef3c7",
                  color: merchantInfo.status === "Approved" ? "#166534" : "#92400e",
                }}
              >
                {merchantInfo.status || "Pending"}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Phone Number
              </p>
              <p style={{ fontWeight: "600", color: "#0f172a" }}>
                {merchantInfo.phone || "-"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                GST Number
              </p>
              <p style={{ fontWeight: "600", color: "#0f172a" }}>
                {merchantInfo.gstNumber || "-"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Wallet Balance
              </p>
              <p
                style={{
                  fontWeight: "700",
                  color: "#16a34a",
                  fontSize: "15px",
                }}
              >
                ₹ {merchantInfo.walletBalance || 0}
              </p>
            </div>
          </div>
        </div>

        {/* ================= MERCHANT SUMMARY CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div style={summaryCard}>
            <h4 style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Total Couriers
            </h4>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
              {couriers.length}
            </h2>
          </div>

          <div style={summaryCard}>
            <h4 style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Configured
            </h4>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>
              {assignedRates.filter(r => r.isActive !== false).length}
            </h2>
          </div>

          <div style={summaryCard}>
            <h4 style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Total Orders
            </h4>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
              {merchantInfo.totalOrders || 0}
            </h2>
          </div>

          <div style={summaryCard}>
            <h4 style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Total Shipments
            </h4>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
              {merchantInfo.totalShipments || 0}
            </h2>
          </div>
        </div>

        {/* Courier Cards with Rate Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {couriers.map((courier) => {
            const rateCard = assignedRates.find(
              (r) =>
                String(r.courierId?._id || r.courierId) ===
                String(courier._id)
            );

            const isConfigured = !!rateCard && rateCard.isActive !== false;
            const forwardRate = rateCard?.forwardRates?.rate500gm || 0;
            const codCharge = rateCard?.codCharge || 0;

            return (
              <div
                key={courier._id}
                style={{
                  border: isConfigured ? "1px solid #dcfce7" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  background: isConfigured ? "#fafffe" : "#ffffff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <FaTruck size={24} color="#ea580c" />
                  <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>
                    {courier.name}
                  </h3>
                </div>

                {isConfigured ? (
                  <>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "8px"
                    }}>
                      <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "500" }}>
                        ✅ Configured
                      </span>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                        Active
                      </span>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "14px",
                      padding: "10px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Forward Rate</p>
                        <p style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: "2px 0 0 0" }}>
                          ₹{forwardRate}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>COD Charge</p>
                        <p style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", margin: "2px 0 0 0" }}>
                          ₹{codCharge}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCourier(courier)}
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        border: "1px solid #ea580c",
                        borderRadius: "8px",
                        background: "transparent",
                        color: "#ea580c",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "13px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ea580c";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#ea580c";
                      }}
                    >
                      Edit Rates
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
                      ⚠️ Not Configured
                    </p>

                    <button
                      onClick={() => setSelectedCourier(courier)}
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#ea580c",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "13px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#c2410c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ea580c";
                      }}
                    >
                      Configure Rates
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ================= FORM SECTION ================= */}
        {selectedCourier && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <button
                onClick={() => setSelectedCourier(null)}
                style={{
                  padding: "6px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => e.target.style.background = "#e2e8f0"}
                onMouseLeave={(e) => e.target.style.background = "#f1f5f9"}
              >
                ← Back to Couriers
              </button>
              <span style={{ marginLeft: "12px", fontSize: "14px", color: "#0f172a", fontWeight: "500" }}>
                Configuring: {selectedCourier.name}
              </span>
            </div>

            {loading.rates && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Loading rates for {selectedCourier?.name}...</p>
              </div>
            )}

            {!loading.rates && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "20px",
                }}
              >
                {/* LEFT COLUMN */}
                <div>
                  {/* FORWARD RATES */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        paddingBottom: "10px",
                        borderBottom: "2px solid #f1f5f9",
                        color: "#0f172a",
                      }}
                    >
                      Forward Rates
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          500gm
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.forwardRates.rate500gm}
                          onChange={(e) =>
                            handleChange("forwardRates", "rate500gm", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          1kg
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.forwardRates.rate1kg}
                          onChange={(e) =>
                            handleChange("forwardRates", "rate1kg", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          2kg
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.forwardRates.rate2kg}
                          onChange={(e) =>
                            handleChange("forwardRates", "rate2kg", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          5kg
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.forwardRates.rate5kg}
                          onChange={(e) =>
                            handleChange("forwardRates", "rate5kg", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          Additional KG
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.forwardRates.additionalKg}
                          onChange={(e) =>
                            handleChange("forwardRates", "additionalKg", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ZONE RATES */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        paddingBottom: "10px",
                        borderBottom: "2px solid #f1f5f9",
                        color: "#0f172a",
                      }}
                    >
                      Zone Rates
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          Local Rate
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={zoneRates.local}
                          onChange={(e) =>
                            setZoneRates({
                              ...zoneRates,
                              local: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          Regional Rate
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={zoneRates.regional}
                          onChange={(e) =>
                            setZoneRates({
                              ...zoneRates,
                              regional: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          National Rate
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={zoneRates.national}
                          onChange={(e) =>
                            setZoneRates({
                              ...zoneRates,
                              national: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADDITIONAL CHARGES */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        paddingBottom: "10px",
                        borderBottom: "2px solid #f1f5f9",
                        color: "#0f172a",
                      }}
                    >
                      Additional Charges
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          COD Charge
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.codCharges.codCharge}
                          onChange={(e) =>
                            handleChange("codCharges", "codCharge", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          RTO Charge
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.rtoCharges.rtoCharge}
                          onChange={(e) =>
                            handleChange("rtoCharges", "rtoCharge", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          Reverse Pickup
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.additionalCharges.reversePickup}
                          onChange={(e) =>
                            handleChange("additionalCharges", "reversePickup", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                          Fuel Charge
                        </label>
                        <input
                          type="number"
                          placeholder="₹"
                          value={rates.additionalCharges.fuelCharge}
                          onChange={(e) =>
                            handleChange("additionalCharges", "fuelCharge", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SERVICEABILITY */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        marginBottom: "20px",
                        paddingBottom: "10px",
                        borderBottom: "2px solid #f1f5f9",
                        color: "#0f172a",
                      }}
                    >
                      Serviceability Settings
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "15px",
                      }}
                    >
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={serviceability.codEnabled}
                          onChange={() => handleServiceabilityChange("codEnabled")}
                        />
                        COD Enabled
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={serviceability.prepaidEnabled}
                          onChange={() => handleServiceabilityChange("prepaidEnabled")}
                        />
                        Prepaid Enabled
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={serviceability.rtoEnabled}
                          onChange={() => handleServiceabilityChange("rtoEnabled")}
                        />
                        RTO Enabled
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={serviceability.reversePickup}
                          onChange={() => handleServiceabilityChange("reversePickup")}
                        />
                        Reverse Pickup
                      </label>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                  {/* RATE PREVIEW */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#0f172a",
                        }}
                      >
                        Rate Preview
                      </h2>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#ea580c",
                        }}
                      >
                        {selectedCourier?.name}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>500gm</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().forward500gm}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>1kg</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().forward1kg}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>2kg</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().forward2kg}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>5kg</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().forward5kg}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>Local</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().local}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>Regional</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().regional}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>National</p>
                        <p style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                          ₹{calculatePreview().national}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f172a" }}>
                        Per kg/per zone
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* MARGIN PREVIEW */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h3
                      style={{
                        marginBottom: "15px",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      Margin Preview
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        padding: "8px 0",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Courier Cost</span>
                      <strong style={{ color: "#0f172a" }}>₹{calculateMargin().courierCost}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        padding: "8px 0",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Merchant Rate</span>
                      <strong style={{ color: "#0f172a" }}>₹{calculateMargin().merchantRate}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: calculateMargin().profit > 0 ? "#16a34a" : "#dc2626",
                        fontWeight: "700",
                        fontSize: "18px",
                        padding: "8px 0",
                        borderTop: "2px solid #e2e8f0",
                        marginTop: "4px",
                      }}
                    >
                      <span>Profit</span>
                      <span>₹{calculateMargin().profit}</span>
                    </div>
                  </div>

                  {/* AUDIT */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <strong style={{ color: "#0f172a" }}>Last Updated By:</strong>{" "}
                    <span style={{ color: "#475569" }}>Super Admin</span>
                    <br />
                    <strong style={{ color: "#0f172a" }}>Updated On:</strong>{" "}
                    <span style={{ color: "#475569" }}>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SAVE BUTTON */}
            <div
              style={{
                position: "sticky",
                bottom: "0",
                background: "white",
                borderTop: "1px solid #e2e8f0",
                padding: "16px 24px",
                boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "20px",
                borderRadius: "0 0 14px 14px",
              }}
            >
              <button
                onClick={resetForm}
                style={{
                  ...secondaryBtn,
                  padding: "10px 24px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                Reset
              </button>
              <button
                onClick={() => alert("Draft saved successfully!")}
                style={{
                  ...secondaryBtn,
                  padding: "10px 24px",
                  border: "1px solid #ea580c",
                  color: "#ea580c",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#fff7ed";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                Save Draft
              </button>
              <button
                onClick={saveRates}
                disabled={loading.saving}
                style={{
                  ...primaryBtn,
                  padding: "10px 32px",
                  background: loading.saving ? "#94a3b8" : "#ea580c",
                  cursor: loading.saving ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading.saving) e.target.style.background = "#c2410c";
                }}
                onMouseLeave={(e) => {
                  if (!loading.saving) e.target.style.background = "#ea580c";
                }}
              >
                {loading.saving ? "Saving..." : "Save Rate Card"}
              </button>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default RateCardManagement;