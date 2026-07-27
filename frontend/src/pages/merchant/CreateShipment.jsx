import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaBox, FaTruck, FaArrowLeft, FaCheckCircle, FaShippingFast, FaWallet, FaRupeeSign, FaStar, FaSortAmountUp, FaShieldAlt } from "react-icons/fa";
import "./CreateShipment.css"; 

const CreateShipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOrder = location.state?.order;
  
  //   bulk shipment support
  const bulkOrderIds = location.state?.orderIds || [];
  const isBulk = location.state?.isBulk || false;

  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Added warehouses state
  const [formData, setFormData] = useState({
    orderId: selectedOrder?._id || "",
    courier: "",
    warehouseId: "", // Added warehouseId
  });
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [pricing, setPricing] = useState({
    shippingCharge: 0,
    codCharge: 0,
    fuelCharge: 0,
    totalCharge: 0
  });

  // States for recommendations
  const [surfaceRates, setSurfaceRates] = useState([]);
  const [airRates, setAirRates] = useState([]);
  const [recommendedSurface, setRecommendedSurface] = useState(null);
  const [recommendedAir, setRecommendedAir] = useState(null);
  const [activeTab, setActiveTab] = useState("Surface"); // Surface or Air
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Insurance toggle state
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [insuranceAmount, setInsuranceAmount] = useState(0);

  // WhatsApp notification toggle state
  const [sendWhatsAppNotification, setSendWhatsAppNotification] = useState(true);

  // Insurance charge calculation
  const INSURANCE_CHARGE = 12;

  // Get merchantId from user object
  const getMerchantId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id || user?.merchantId || null;
    } catch (error) {
      console.error("Error getting merchantId:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchWallet();
    fetchWarehouses();
    fetchActiveCouriers();
  }, []);

  // Bulk order auto-select effect
  useEffect(() => {
    if (isBulk && bulkOrderIds.length > 0 && orders.length > 0) {
      setFormData((prev) => ({
        ...prev,
        orderId: bulkOrderIds[0], 
      }));
    }
  }, [orders, isBulk, bulkOrderIds]);

  useEffect(() => {
    if (formData.orderId && formData.courier) {
      calculatePricing();
    }
  }, [formData.orderId, formData.courier, activeTab]);

  // Fetch recommendations when order or warehouse is selected
  useEffect(() => {
    if (formData.orderId) {
      fetchRecommendations();
    } else {
      fetchActiveCouriers();
    }
  }, [formData.orderId, formData.warehouseId]);

  // Update insurance amount when order changes
  useEffect(() => {
    if (currentOrder) {
      setInsuranceAmount(currentOrder.insuranceAmount || 0);
      if (currentOrder.insuranceEnabled) {
        setInsuranceEnabled(true);
      }
    }
  }, [formData.orderId]);

  const fetchActiveCouriers = async () => {
    try {
      const res = await api.get("/couriers/active/list");
      if (res.data.success && res.data.couriers && res.data.couriers.length > 0) {
        const mapped = res.data.couriers.map((c) => ({
          courierId: c._id,
          courierName: c.name,
          total: 45,
          forwardRate: 45,
          codCharge: 0,
          estimatedDays: c.estimatedDays || 3,
        }));
        setSurfaceRates((prev) => (prev.length === 0 ? mapped : prev));
        setAirRates((prev) => (prev.length === 0 ? mapped : prev));
      }
    } catch (err) {
      // Fallback silent handle
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      const activeW = (res.data.warehouses || []).filter((w) => w.isActive);
      setWarehouses(activeW);
      if (activeW.length > 0) {
        setFormData((prev) => (prev.warehouseId ? prev : { ...prev, warehouseId: activeW[0]._id }));
      }
    } catch (err) {
      setWarehouses([]);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWalletBalance(res.data.wallet?.balance || 0);
    } catch (error) {
      setWalletBalance(0);
    }
  };

  const calculatePricing = async () => {
    try {
      const res = await api.post("/ratecards/calculate", {
        orderId: formData.orderId,
        courierId: formData.courier,
        serviceType: activeTab,
      });
      
      if (res.data.success) {
        setPricing({
          shippingCharge: res.data.shippingCharge || 0,
          codCharge: res.data.codCharge || 0,
          fuelCharge: res.data.fuelCharge || 0,
          totalCharge: res.data.totalCharge || 0
        });
      } else {
        useStaticPricing();
      }
    } catch (error) {
      useStaticPricing();
    }
  };

  const useStaticPricing = () => {
    const currentOrder = orders.find(o => o._id === formData.orderId) || selectedOrder;
    const baseCharge = 45;
    const codCharge = currentOrder?.paymentMode === "COD" ? 30 : 0;
    const fuelCharge = 5;
    
    setPricing({
      shippingCharge: baseCharge,
      codCharge: codCharge,
      fuelCharge: fuelCharge,
      totalCharge: baseCharge + codCharge + fuelCharge
    });
  };

  // Fetch Recommendations for both Surface and Air concurrently
  const fetchRecommendations = async () => {
    try {
      setRecommendationLoading(true);
      
      const currentOrder = orders.find(o => o._id === formData.orderId) || selectedOrder;

      if (!currentOrder) {
        setRecommendationLoading(false);
        return;
      }

      const merchantId = getMerchantId();

      if (!merchantId) {
        setRecommendationLoading(false);
        return;
      }

      const weight = currentOrder.weight || 0.5;
      const selectedWarehouse = warehouses.find(w => w._id === formData.warehouseId);
      const pickup = selectedWarehouse ? selectedWarehouse.pincode : "";
      const destination = currentOrder.customerPincode || "";

      let surfaceUrl = `/ratecards/recommendation?merchantId=${merchantId}&weight=${weight}&serviceType=Surface`;
      if (pickup) surfaceUrl += `&pickup=${pickup}`;
      if (destination) surfaceUrl += `&destination=${destination}`;

      let airUrl = `/ratecards/recommendation?merchantId=${merchantId}&weight=${weight}&serviceType=Air`;
      if (pickup) airUrl += `&pickup=${pickup}`;
      if (destination) airUrl += `&destination=${destination}`;

      const [surfaceRes, airRes] = await Promise.allSettled([
        api.get(surfaceUrl),
        api.get(airUrl)
      ]);

      let surfaceRatesList = [];
      let airRatesList = [];
      let recSurface = null;
      let recAir = null;

      if (surfaceRes.status === "fulfilled" && surfaceRes.value.data.success) {
        surfaceRatesList = surfaceRes.value.data.couriers || [];
        recSurface = surfaceRes.value.data.recommended || null;
      }

      if (airRes.status === "fulfilled" && airRes.value.data.success) {
        airRatesList = airRes.value.data.couriers || [];
        recAir = airRes.value.data.recommended || null;
      }

      setSurfaceRates(surfaceRatesList);
      setAirRates(airRatesList);
      setRecommendedSurface(recSurface);
      setRecommendedAir(recAir);

      // Auto-select preferred service type or fallback to available
      const preferredServiceType = currentOrder.serviceType || "Surface";
      const targetRatesList = preferredServiceType === "Air" ? airRatesList : surfaceRatesList;
      const targetRecommended = preferredServiceType === "Air" ? recAir : recSurface;

      if (targetRatesList.length > 0) {
        setActiveTab(preferredServiceType);
        if (targetRecommended?.courierId) {
          setFormData((prev) => ({ ...prev, courier: targetRecommended.courierId }));
        } else {
          setFormData((prev) => ({ ...prev, courier: targetRatesList[0].courierId }));
        }
      } else {
        const otherRatesList = preferredServiceType === "Air" ? surfaceRatesList : airRatesList;
        const otherRecommended = preferredServiceType === "Air" ? recSurface : recAir;
        const otherType = preferredServiceType === "Air" ? "Surface" : "Air";

        if (otherRatesList.length > 0) {
          setActiveTab(otherType);
          if (otherRecommended?.courierId) {
            setFormData((prev) => ({ ...prev, courier: otherRecommended.courierId }));
          } else {
            setFormData((prev) => ({ ...prev, courier: otherRatesList[0].courierId }));
          }
        } else {
          setActiveTab(preferredServiceType);
          setFormData((prev) => ({ ...prev, courier: "" }));
        }
      }

    } catch (error) {
      console.error("Recommendation failed:", error);
      setSurfaceRates([]);
      setAirRates([]);
      setRecommendedSurface(null);
      setRecommendedAir(null);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const currentOrder = orders.find(o => o._id === formData.orderId) || selectedOrder;

  // Calculate total with insurance
  const baseTotalCharge = pricing.totalCharge || 0;
  const insuranceCost = insuranceEnabled ? INSURANCE_CHARGE : 0;
  const totalCharge = baseTotalCharge + insuranceCost;
  
  // Balance calculations
  const shortfall = Math.max(0, totalCharge - walletBalance);
  const balanceAfterShipment = Math.max(0, walletBalance - totalCharge);
  const isInsufficientBalance = walletBalance < totalCharge;

  // Updated form validation with warehouseId
  const isFormValid = 
    formData.orderId && 
    formData.warehouseId && // Added warehouse validation
    formData.courier && 
    !isInsufficientBalance &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setLoading(true);
    try {
      // Bulk shipment: Submit multiple orders
      if (isBulk && bulkOrderIds.length > 0) {
        const payload = {
          orderIds: bulkOrderIds,
          courierId: formData.courier,
          warehouseId: formData.warehouseId, // Added warehouseId
          serviceType: activeTab, // Added serviceType
          insuranceEnabled: insuranceEnabled,
          insuranceAmount: insuranceEnabled ? insuranceAmount : 0,
          sendWhatsAppNotification: sendWhatsAppNotification
        };
        
        await api.post("/shipments/bulk", payload);
        alert(`✅ ${bulkOrderIds.length} shipments created successfully!`);
        navigate("/merchant/shipments");
      } else {
        // Single shipment - Updated payload structure
        const payload = {
          orderId: formData.orderId,
          courierId: formData.courier,
          warehouseId: formData.warehouseId, // Added warehouseId
          serviceType: activeTab, // Added serviceType
          insuranceEnabled: insuranceEnabled,
          insuranceAmount: insuranceEnabled ? insuranceAmount : 0,
          sendWhatsAppNotification: sendWhatsAppNotification
        };
        
        await api.post("/shipments", payload);
        alert("Shipment Created Successfully");
        navigate("/merchant/shipments");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="create-shipment-container">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <main className="create-shipment-main">
          <div className="shipment-form-container">
            {/* Header with Gradient */}
            <div className="shipment-form-header">
              <div className="header-icon">
                <FaShippingFast />
              </div>
              <h2 className="header-title">
                {isBulk ? `Bulk Shipment (${bulkOrderIds.length} Orders)` : "Create Shipment"}
              </h2>
              <p className="header-subtitle">
                {isBulk 
                  ? `Creating shipments for ${bulkOrderIds.length} selected orders` 
                  : "Generate new shipment for order"}
              </p>
            </div>

            {/* Form Body */}
            <div className="shipment-form-body">
              <button 
                onClick={() => navigate(-1)} 
                className="back-button"
              >
                <FaArrowLeft size={12} /> Back
              </button>

              <form onSubmit={handleSubmit}>
                {/* Bulk Order Count Display */}
                {isBulk && bulkOrderIds.length > 0 && (
                  <div className="selected-order-card bulk-card">
                    <div className="selected-order-header">
                      <div className="selected-order-icon bulk-icon">
                        <FaBox />
                      </div>
                      <div className="selected-order-content">
                        <div className="selected-order-label bulk-label">
                          Bulk Shipment
                        </div>
                        <div className="selected-order-value bulk-value">
                          {bulkOrderIds.length} orders selected for bulk shipment
                        </div>
                      </div>
                      <FaCheckCircle className="check-icon" />
                    </div>
                  </div>
                )}

                {/* Selected Order Display for Single */}
                {!isBulk && currentOrder && (
                  <div className="selected-order-card">
                    <div className="selected-order-header">
                      <div className="selected-order-icon">
                        <FaBox />
                      </div>
                      <div className="selected-order-content">
                        <div className="selected-order-label">Selected Order</div>
                        <div className="selected-order-value">
                          {currentOrder.orderNumber || currentOrder._id?.slice(-6) || "N/A"} - {currentOrder.customerName || "N/A"}
                        </div>
                      </div>
                      <FaCheckCircle className="check-icon" />
                    </div>

                    {/* Order Details Card */}
                    <div className="order-details-card">
                      <div className="order-detail-row">
                        <span className="order-detail-label">Product</span>
                        <span className="order-detail-value">{currentOrder?.productName || "N/A"}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="order-detail-label">Weight</span>
                        <span className="order-detail-value">{currentOrder?.weight || 0} KG</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="order-detail-label">Payment</span>
                        <span className="order-detail-value">{currentOrder?.paymentMode || "N/A"}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="order-detail-label">Amount</span>
                        <span className="order-detail-value">₹{currentOrder?.amount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Selection - Hide in bulk mode */}
                {!isBulk && (
                  <div className="form-group">
                    <div className="form-label">
                      <FaBox className="label-icon" />
                      <span>Select Order <span className="required-star">*</span></span>
                    </div>
                    <select
                      name="orderId"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="">Choose an order</option>
                      {orders.map((o) => (
                        <option key={o._id} value={o._id}>
                          {`${o.orderNumber || o._id.slice(-6)} - ${o.customerName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* For bulk: Show selected orders count and first order for recommendations */}
                {isBulk && (
                  <div className="form-group">
                    <div className="form-label">
                      <FaBox className="label-icon" />
                      <span>Bulk Orders <span className="required-star">*</span></span>
                    </div>
                    <div className="bulk-orders-display">
                      {bulkOrderIds.length} orders selected
                      <span className="bulk-subtext">
                        Using first order for rate calculation
                      </span>
                    </div>
                  </div>
                )}

                {/* ==================== WAREHOUSE DROPDOWN (ADDED) ==================== */}
                <div className="form-group">
                  <div className="form-label">
                    <span>Select Warehouse <span className="required-star">*</span></span>
                  </div>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warehouseId: e.target.value,
                      })
                    }
                    required
                    className="form-select"
                  >
                    <option value="">Choose Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surface / Air Tab Switcher */}
                {!recommendationLoading && (surfaceRates.length > 0 || airRates.length > 0) && (
                  <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px" }}>
                    {["Surface", "Air"].map((tab) => {
                      const isActive = activeTab === tab;
                      const count = tab === "Surface" ? surfaceRates.length : airRates.length;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab);
                            const rec = tab === "Air" ? recommendedAir : recommendedSurface;
                            if (rec?.courierId) {
                              setFormData(prev => ({ ...prev, courier: rec.courierId }));
                            } else {
                              const list = tab === "Air" ? airRates : surfaceRates;
                              if (list.length > 0) {
                                setFormData(prev => ({ ...prev, courier: list[0].courierId }));
                              } else {
                                setFormData(prev => ({ ...prev, courier: "" }));
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            background: isActive ? "#fff" : "transparent",
                            color: isActive ? "#0f172a" : "#64748b",
                            fontWeight: isActive ? "700" : "500",
                            fontSize: "13px",
                            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            transition: "all 0.2s",
                          }}
                        >
                          {tab === "Surface" ? "🚛 Surface" : "✈️ Air"} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Top 3 Recommended Couriers Card */}
                {recommendationLoading ? (
                  <div className="loading-text">⏳ Finding best couriers...</div>
                ) : (activeTab === "Air" ? airRates : surfaceRates).length > 0 ? (
                  <>
                    <div className="recommended-card">
                      <div className="recommended-badge">🏆 Top 3</div>
                      <div className="recommended-title">
                        <FaStar className="star-icon" />
                        Recommended Couriers (Cheapest) - {activeTab}
                      </div>
                      
                      {(activeTab === "Air" ? airRates : surfaceRates).slice(0, 3).map((c, index) => {
                        const total = Number(c.total || 0);
                        const isCheapest = index === 0;
                        
                        return (
                          <div
                            key={c.courierId}
                            className={`recommended-item ${isCheapest ? 'cheapest' : ''}`}
                          >
                            <span className="recommended-left">
                              <span className={`rank-number ${isCheapest ? 'rank-cheapest' : ''}`}>
                                #{index + 1}
                              </span>
                              <span className="courier-name">{c.courierName}</span>
                              {isCheapest && (
                                <span className="cheapest-badge">Cheapest</span>
                              )}
                            </span>
                            <span className={`rate-amount ${isCheapest ? 'rate-cheapest' : ''}`}>
                              ₹{total}
                            </span>
                          </div>
                        );
                      })}
                      
                      {(activeTab === "Air" ? airRates : surfaceRates).length > 3 && (
                        <div className="more-couriers-text">
                          +{(activeTab === "Air" ? airRates : surfaceRates).length - 3} more couriers available
                        </div>
                      )}
                    </div>

                    {/* Courier Comparison Table */}
                    {(activeTab === "Air" ? airRates : surfaceRates).length > 0 && (
                      <div className="comparison-card">
                        <div className="comparison-title">
                          <FaSortAmountUp className="comparison-icon" />
                          All Courier Comparison ({activeTab})
                        </div>

                        <table className="comparison-table">
                          <thead>
                            <tr>
                              <th className="comparison-th">Courier</th>
                              <th className="comparison-th-center">Forward</th>
                              <th className="comparison-th-center">COD</th>
                              <th className="comparison-th-center">ETA</th>
                              <th className="comparison-th-right">Total</th>
                            </tr>
                          </thead>

                          <tbody>
                            {(activeTab === "Air" ? airRates : surfaceRates).slice(0, 5).map((c, index) => {
                              const total = Number(c.total || 0);
                              const isCheapest = index === 0;
                              const eta = c.estimatedDays ? `${c.estimatedDays} Days` : "N/A";

                              return (
                                <tr
                                  key={c.courierId}
                                  className={`comparison-row ${isCheapest ? 'cheapest-row' : ''}`}
                                >
                                  <td className="comparison-td">
                                    {c.courierName}
                                    {isCheapest && (
                                      <span className="cheapest-tag">⭐ Cheapest</span>
                                    )}
                                  </td>

                                  <td className="comparison-td-center">
                                    ₹{c.forwardRate || 0}
                                  </td>

                                  <td className="comparison-td-center">
                                    ₹{c.codCharge || 0}
                                  </td>

                                  <td className="comparison-td-center eta-text">
                                    {eta}
                                  </td>

                                  <td className={`comparison-td-right ${isCheapest ? 'total-cheapest' : 'total-normal'}`}>
                                    ₹{total}
                                  </td>
                                </tr>
                              );
                            })}
                            
                            {(activeTab === "Air" ? airRates : surfaceRates).length > 5 && (
                              <tr>
                                <td colSpan="5" className="more-couriers-row">
                                  +{(activeTab === "Air" ? airRates : surfaceRates).length - 5} more couriers
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : formData.orderId || isBulk ? (
                  <div className="no-rates-text">
                    No rate cards found for {activeTab}. Please contact admin.
                  </div>
                ) : null}

                {/* Dynamic Courier Dropdown */}
                <div className="form-group">
                  <div className="form-label">
                    <FaTruck className="label-icon" />
                    <span>Select Courier <span className="required-star">*</span></span>
                    {(activeTab === "Air" ? recommendedAir : recommendedSurface) && (
                      <span className="recommended-tag">
                        ⭐ Best: {(activeTab === "Air" ? recommendedAir : recommendedSurface).courierName || (activeTab === "Air" ? recommendedAir : recommendedSurface).courierId}
                      </span>
                    )}
                  </div>
                  <select
                    name="courier"
                    value={formData.courier}
                    onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
                    className={`form-select courier-select ${(activeTab === "Air" ? recommendedAir : recommendedSurface) && formData.courier === (activeTab === "Air" ? recommendedAir : recommendedSurface).courierId ? 'recommended-select' : ''}`}
                    required
                  >
                    <option value="">Choose a courier partner</option>
                    {(activeTab === "Air" ? airRates : surfaceRates).map((c) => (
                      <option
                        key={c.courierId}
                        value={c.courierId}
                      >
                        {c.courierName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Insurance Toggle */}
                {currentOrder && !isBulk && (
                  <div 
                    className={`insurance-toggle ${insuranceEnabled ? 'insurance-active' : ''}`}
                    onClick={() => setInsuranceEnabled(!insuranceEnabled)}
                  >
                    <div className="insurance-left">
                      <FaShieldAlt className="insurance-icon" />
                      <div>
                        <div className="insurance-label">
                          ☑ Add Insurance
                        </div>
                        <div className="insurance-subtext">
                          Protect your shipment (₹{INSURANCE_CHARGE})
                        </div>
                      </div>
                    </div>
                    <div className={`insurance-switch ${insuranceEnabled ? 'switch-active' : ''}`}>
                      <div className={`insurance-knob ${insuranceEnabled ? 'knob-active' : ''}`} />
                    </div>
                  </div>
                )}

                {/* Bulk Insurance Toggle */}
                {isBulk && (
                  <div 
                    className={`insurance-toggle ${insuranceEnabled ? 'insurance-active' : ''}`}
                    onClick={() => setInsuranceEnabled(!insuranceEnabled)}
                  >
                    <div className="insurance-left">
                      <FaShieldAlt className="insurance-icon" />
                      <div>
                        <div className="insurance-label">
                          ☑ Add Insurance to All
                        </div>
                        <div className="insurance-subtext">
                          Protect all shipments (₹{INSURANCE_CHARGE} each)
                        </div>
                      </div>
                    </div>
                    <div className={`insurance-switch ${insuranceEnabled ? 'switch-active' : ''}`}>
                      <div className={`insurance-knob ${insuranceEnabled ? 'knob-active' : ''}`} />
                    </div>
                  </div>
                )}

                {/* WhatsApp Notification Toggle */}
                <div 
                  className={`insurance-toggle ${sendWhatsAppNotification ? 'insurance-active' : ''}`}
                  onClick={() => setSendWhatsAppNotification(!sendWhatsAppNotification)}
                  style={{ marginTop: '12px', borderLeft: sendWhatsAppNotification ? '4px solid #25D366' : '4px solid #cbd5e1' }}
                >
                  <div className="insurance-left">
                    <div className="insurance-icon" style={{ color: '#25D366', fontSize: '18px' }}>
                      💬
                    </div>
                    <div>
                      <div className="insurance-label" style={{ color: '#0f172a' }}>
                        Send WhatsApp Notification to Customer
                      </div>
                      <div className="insurance-subtext">
                        Send tracking link, AWB number & courier details via WhatsApp to customer
                      </div>
                    </div>
                  </div>
                  <div className={`insurance-switch ${sendWhatsAppNotification ? 'switch-active' : ''}`} style={{ background: sendWhatsAppNotification ? '#25D366' : '#cbd5e1' }}>
                    <div className={`insurance-knob ${sendWhatsAppNotification ? 'knob-active' : ''}`} />
                  </div>
                </div>

                {/* Cost Preview */}
                <div className="cost-preview-card">
                  <h4 className="cost-preview-title">
                    {isBulk ? `💰 Bulk Cost Preview (per order)` : `💰 Shipment Cost Preview`}
                  </h4>
                  <div className="cost-row">
                    <span>Shipping Charge</span>
                    <span>₹{pricing.shippingCharge}</span>
                  </div>
                  <div className="cost-row">
                    <span>COD Charge</span>
                    <span>₹{pricing.codCharge}</span>
                  </div>
                  <div className="cost-row">
                    <span>Fuel Charge</span>
                    <span>₹{pricing.fuelCharge}</span>
                  </div>
                  
                  {insuranceEnabled && (
                    <div className="cost-row">
                      <span>🛡️ Insurance Charge</span>
                      <span>₹{INSURANCE_CHARGE}</span>
                    </div>
                  )}
                  
                  <hr className="cost-divider" />
                  <div className="cost-total">
                    <span>Total per Order</span>
                    <span className="total-amount">₹{totalCharge}</span>
                  </div>
                  
                  {isBulk && bulkOrderIds.length > 0 && (
                    <div className="cost-grand-total">
                      <span>Total for {bulkOrderIds.length} Orders</span>
                      <span className="grand-total-amount">
                        ₹{totalCharge * bulkOrderIds.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Wallet Preview */}
                <div className="wallet-card">
                  <div className="wallet-row">
                    <span>💰 Wallet Balance</span>
                    <span className="wallet-balance">₹{walletBalance}</span>
                  </div>
                  <div className="wallet-row">
                    <span>Required Amount</span>
                    <span className="wallet-required">
                      {isBulk ? `₹${totalCharge * bulkOrderIds.length}` : `₹${totalCharge}`}
                    </span>
                  </div>
                  
                  {isInsufficientBalance ? (
                    <>
                      <div className="wallet-row">
                        <span>Shortfall</span>
                        <span className="shortfall-text">
                          ₹{isBulk ? shortfall * bulkOrderIds.length : shortfall}
                        </span>
                      </div>
                      <div className="insufficient-text">
                        ⚠️ Please recharge ₹{isBulk ? shortfall * bulkOrderIds.length : shortfall} to proceed
                      </div>
                    </>
                  ) : (
                    <div className="wallet-row">
                      <span>Balance After Shipment</span>
                      <span className={`wallet-after ${isInsufficientBalance ? 'wallet-insufficient' : 'wallet-sufficient'}`}>
                        ₹{isBulk ? Math.max(0, walletBalance - (totalCharge * bulkOrderIds.length)) : balanceAfterShipment}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="button-wrapper">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`submit-btn ${!isFormValid ? 'submit-disabled' : ''}`}
                  >
                    {loading ? (
                      <>⏳ Creating Shipment{isBulk ? 's' : ''}...</>
                    ) : !formData.orderId && !isBulk ? (
                      <>📋 Select an Order</>
                    ) : !formData.warehouseId ? ( // Added warehouse check
                      <>🏭 Select a Warehouse</>
                    ) : !formData.courier ? (
                      <>🚚 Select a Courier</>
                    ) : isInsufficientBalance ? (
                      <>💳 Recharge Wallet First</>
                    ) : isBulk ? (
                      <>🚀 Create {bulkOrderIds.length} Shipments</>
                    ) : (
                      <>🚀 Create Shipment</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
    
export default CreateShipment;