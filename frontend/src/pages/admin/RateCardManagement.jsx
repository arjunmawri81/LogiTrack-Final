import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { FaTruck } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { toast } from "react-toastify";

const RateCardManagement = () => {
  const { merchantId } = useParams();

  // ===================== STATE =====================
  
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

  const [loading, setLoading] = useState({
    merchant: true,
    rates: true,
  });

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [couriers, setCouriers] = useState([]);
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

  const [zoneRates, setZoneRates] = useState({
    local: "",
    regional: "",
    national: "",
  });

  const [assignedRates, setAssignedRates] = useState([]);

  const [serviceability, setServiceability] = useState({
    codEnabled: true,
    prepaidEnabled: true,
    rtoEnabled: true,
    reversePickup: true,
  });

  const [auditInfo, setAuditInfo] = useState({
    updatedBy: "Super Admin",
    updatedAt: new Date().toISOString(),
  });

  // ===================== API CALLS =====================

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
               "",
        gstNumber: response.data.merchant?.gstNumber || 
                   response.data.merchant?.gst || 
                   "",
        walletBalance: response.data.walletBalance || 0,
        totalOrders: response.data.totalOrders || 0,
        totalShipments: response.data.totalShipments || 0,
      });
    } catch (error) {
      console.error("Error fetching merchant:", error);
      toast.error("Failed to load merchant details. Please try again.");
      setMerchantInfo({
        companyName: "",
        merchantName: "",
        email: "",
        status: "Pending",
        phone: "",
        gstNumber: "",
        walletBalance: 0,
        totalOrders: 0,
        totalShipments: 0,
      });
    } finally {
      setLoading(prev => ({ ...prev, merchant: false }));
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await api.get("/couriers/active/list");
      setCouriers(response.data.couriers || []);
    } catch (error) {
      console.error("Error fetching couriers:", error);
      toast.error("Failed to load couriers list.");
    }
  };

  const fetchAssignedRates = async () => {
    try {
      const response = await api.get(`/ratecards/merchant/${merchantId}`);
      setAssignedRates(response.data.rateCards || []);
    } catch (error) {
      console.error("Error fetching assigned rates:", error);
      setAssignedRates([]);
    }
  };

  const loadCourierRates = async () => {
    try {
      setLoading(prev => ({ ...prev, rates: true }));
      const response = await api.get(`/ratecards/merchant/${merchantId}/${selectedCourier._id}`);
      
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
        
        setServiceability({
          codEnabled: data.serviceability?.codEnabled !== false,
          prepaidEnabled: data.serviceability?.prepaidEnabled !== false,
          rtoEnabled: data.serviceability?.rtoEnabled !== false,
          reversePickup: data.serviceability?.reversePickup !== false,
        });

        setAuditInfo({
          updatedBy: data.updatedBy?.name || data.updatedBy || "Super Admin",
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Error loading courier rates:", error);
      toast.error("Failed to load rates for this courier.");
      resetForm();
    } finally {
      setLoading(prev => ({ ...prev, rates: false }));
    }
  };

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
    setServiceability({
      codEnabled: true,
      prepaidEnabled: true,
      rtoEnabled: true,
      reversePickup: true,
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
    const courierCost = Number(rates.forwardRates.rate500gm) || 0;
    const merchantRate = Number(rates.forwardRates.rate1kg) || 0;
    return {
      courierCost,
      merchantRate,
      profit: merchantRate - courierCost,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date().toLocaleDateString();
    }
  };

  // ===================== STYLES =====================

  const summaryCard = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    textAlign: "center",
  };

  // ===================== RENDER =====================

  if (loading.merchant) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div style={{ 
          flex: 1, 
          marginLeft: "280px", // ✅ Added margin for sidebar
          display: "flex", 
          flexDirection: "column",
          minHeight: "100vh",
          overflowX: "hidden",
          background: "#f8fafc"
        }}>
          <AdminTopbar />
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px",
            }}
          >
            <p>Loading merchant details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />

      <div style={{ 
        flex: 1,
        marginLeft: "280px", // ✅ Added margin for sidebar
        display: "flex", 
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden",
        background: "#f8fafc"
      }}>
        <AdminTopbar />

        <div
          style={{
            flex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "24px",
            paddingBottom: "100px",
            width: "100%",
            boxSizing: "border-box",
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

          {/* Courier Cards */}
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
                        View Rates
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
                        ⚠️ Not Configured
                      </p>
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "8px 16px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#e2e8f0",
                          color: "#94a3b8",
                          cursor: "not-allowed",
                          fontWeight: "500",
                          fontSize: "13px",
                        }}
                      >
                        Not Configured
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
                  Viewing: {selectedCourier.name}
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              fontSize: "14px",
                              outline: "none",
                              background: "#f8fafc",
                              cursor: "not-allowed",
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
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "not-allowed" }}>
                          <input
                            type="checkbox"
                            checked={serviceability.codEnabled}
                            disabled
                          />
                          COD Enabled
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "not-allowed" }}>
                          <input
                            type="checkbox"
                            checked={serviceability.prepaidEnabled}
                            disabled
                          />
                          Prepaid Enabled
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "not-allowed" }}>
                          <input
                            type="checkbox"
                            checked={serviceability.rtoEnabled}
                            disabled
                          />
                          RTO Enabled
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "not-allowed" }}>
                          <input
                            type="checkbox"
                            checked={serviceability.reversePickup}
                            disabled
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
                      <span style={{ color: "#475569" }}>{auditInfo.updatedBy || "N/A"}</span>
                      <br />
                      <strong style={{ color: "#0f172a" }}>Updated On:</strong>{" "}
                      <span style={{ color: "#475569" }}>{formatDate(auditInfo.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateCardManagement;