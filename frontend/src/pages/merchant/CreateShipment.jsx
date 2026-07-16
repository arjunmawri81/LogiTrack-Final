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
  const [formData, setFormData] = useState({
    orderId: selectedOrder?._id || "",
    courier: "",
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
  const [recommended, setRecommended] = useState(null);
  const [courierRates, setCourierRates] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Insurance toggle state
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [insuranceAmount, setInsuranceAmount] = useState(0);

  // Insurance charge calculation
  const INSURANCE_CHARGE = 12;

  // Get merchantId from user object
  const getMerchantId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id || user?.merchantId || null;
    } catch (error) {
      console.log("Error getting merchantId:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchWallet();
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
  }, [formData.orderId, formData.courier]);

  // Fetch recommendations when order is selected
  useEffect(() => {
    if (formData.orderId) {
      fetchRecommendations();
    } else {
      setRecommended(null);
      setCourierRates([]);
    }
  }, [formData.orderId]);

  // Update insurance amount when order changes
  useEffect(() => {
    if (currentOrder) {
      setInsuranceAmount(currentOrder.insuranceAmount || 0);
      if (currentOrder.insuranceEnabled) {
        setInsuranceEnabled(true);
      }
    }
  }, [formData.orderId]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      console.log("WALLET =>", res.data);
      setWalletBalance(res.data.wallet?.balance || 0);
    } catch (error) {
      console.log("Wallet fetch failed, using default");
      setWalletBalance(0);
    }
  };

  const calculatePricing = async () => {
    try {
      const res = await api.post("/ratecards/calculate", {
        orderId: formData.orderId,
        courierId: formData.courier,
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
      console.log("Pricing API failed, using fallback:", error);
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

  // Fetch Recommendations
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
        console.log("Merchant ID not found");
        setRecommendationLoading(false);
        return;
      }

      const weight = currentOrder.weight || 0.5;
      
      const res = await api.get(
        `/ratecards/recommendation?merchantId=${merchantId}&weight=${weight}`
      );

      console.log("RECOMMENDATIONS =>", res.data);
      console.log("COURIERS ARRAY =>", res.data.couriers);
      console.log("TOTAL =>", res.data.couriers?.length);

      if (res.data.success) {
        setRecommended(res.data.recommended);
        setCourierRates(res.data.couriers || []);

        // ✅ Auto-select recommended courier using courierId
        if (res.data.recommended?.courierId) {
          setFormData((prev) => ({
            ...prev,
            courier: res.data.recommended.courierId,
          }));
        }
      }
    } catch (error) {
      console.log("Recommendation failed:", error);
      setRecommended(null);
      setCourierRates([]);
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

  const isFormValid = 
    formData.orderId && 
    formData.courier && 
    !isInsufficientBalance &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setLoading(true);
    try {
      // ✅ Bulk shipment: Submit multiple orders
      if (isBulk && bulkOrderIds.length > 0) {
        const payload = {
          orderIds: bulkOrderIds,
          courierId: formData.courier,
          insuranceEnabled: insuranceEnabled,
          insuranceAmount: insuranceEnabled ? insuranceAmount : 0
        };
        
        await api.post("/shipments/bulk", payload);
        alert(`✅ ${bulkOrderIds.length} shipments created successfully!`);
        navigate("/merchant/shipments");
      } else {
        // Single shipment
        const payload = {
          ...formData,
          courierId: formData.courier,
          insuranceEnabled: insuranceEnabled,
          insuranceAmount: insuranceEnabled ? insuranceAmount : 0
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

                {/* Top 3 Recommended Couriers Card */}
                {recommendationLoading ? (
                  <div className="loading-text">⏳ Finding best couriers...</div>
                ) : courierRates.length > 0 ? (
                  <>
                    <div className="recommended-card">
                      <div className="recommended-badge">🏆 Top 3</div>
                      <div className="recommended-title">
                        <FaStar className="star-icon" />
                        Recommended Couriers (Cheapest)
                      </div>
                      
                      {courierRates.slice(0, 3).map((c, index) => {
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
                      
                      {courierRates.length > 3 && (
                        <div className="more-couriers-text">
                          +{courierRates.length - 3} more couriers available
                        </div>
                      )}
                    </div>

                    {/* Courier Comparison Table */}
                    {courierRates.length > 0 && (
                      <div className="comparison-card">
                        <div className="comparison-title">
                          <FaSortAmountUp className="comparison-icon" />
                          All Courier Comparison
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
                            {courierRates.slice(0, 5).map((c, index) => {
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
                            
                            {courierRates.length > 5 && (
                              <tr>
                                <td colSpan="5" className="more-couriers-row">
                                  +{courierRates.length - 5} more couriers
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
                    No rate cards found. Please contact admin.
                  </div>
                ) : null}

                {/* Dynamic Courier Dropdown */}
                <div className="form-group">
                  <div className="form-label">
                    <FaTruck className="label-icon" />
                    <span>Select Courier <span className="required-star">*</span></span>
                    {recommended && (
                      <span className="recommended-tag">
                        ⭐ Best: {recommended.courierName || recommended.courierId}
                      </span>
                    )}
                  </div>
                  <select
                    name="courier"
                    value={formData.courier}
                    onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
                    className={`form-select courier-select ${recommended && formData.courier === recommended.courierId ? 'recommended-select' : ''}`}
                    required
                  >
                    <option value="">Choose a courier partner</option>
                    {courierRates.map((c) => (
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