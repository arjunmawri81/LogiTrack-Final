import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaBox, FaTruck, FaArrowLeft, FaCheckCircle, FaShippingFast, FaWallet, FaRupeeSign, FaStar, FaSortAmountUp, FaShieldAlt } from "react-icons/fa";

const CreateShipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOrder = location.state?.order;
  
  // ✅ Step 1: Added bulk shipment support
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

  // ETA mapping (temporary - will come from API)
  const etaMap = {
    delhivery: "3 Days",
    xpressbees: "2 Days",
    dtdc: "4 Days",
    ecom: "3 Days",
    bluedart: "2 Days",
    shadowfax: "3 Days",
  };

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

  // ✅ Step 2: Bulk order auto-select effect
  useEffect(() => {
    if (isBulk && bulkOrderIds.length > 0 && orders.length > 0) {
      setFormData((prev) => ({
        ...prev,
        orderId: bulkOrderIds[0], // recommendation ke liye pehla order
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
        courier: formData.courier
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

  // Courier Name Mapping
  const courierMap = {
    dtdc: "DTDC",
    delhivery: "Delhivery",
    xpressbees: "XpressBees",
    bluedart: "BlueDart",
    ecom: "Ecom",
    shadowfax: "Shadowfax",
  };

  // Reverse mapping for display
  const reverseCourierMap = {
    "DTDC": "dtdc",
    "Delhivery": "delhivery",
    "XpressBees": "xpressbees",
    "BlueDart": "bluedart",
    "Ecom": "ecom",
    "Shadowfax": "shadowfax",
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

        // Auto-select recommended courier
        if (res.data.recommended?.courier) {
          const recommendedCourier = res.data.recommended.courier;
          const displayCourier = courierMap[recommendedCourier] || recommendedCourier;
          
          setFormData((prev) => ({
            ...prev,
            courier: displayCourier
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
          courier: reverseCourierMap[formData.courier] || formData.courier.toLowerCase(),
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
          courier: reverseCourierMap[formData.courier] || formData.courier.toLowerCase(),
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

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    sidebarWrapper: {
      width: "100%",
      flexShrink: 0
    },
    main: {
      flex: 1,
      padding: "24px 20px",
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center"
    },
    formContainer: {
      background: "#ffffff",
      borderRadius: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01)",
      width: "100%",
      maxWidth: "1200px",
      overflow: "hidden"
    },
    formHeader: {
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      padding: "28px 32px",
      textAlign: "center"
    },
    headerIcon: {
      width: "56px",
      height: "56px",
      background: "rgba(255,255,255,0.2)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px auto",
      color: "#fff",
      fontSize: "28px"
    },
    headerTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#fff",
      margin: "0 0 4px 0",
      letterSpacing: "-0.5px"
    },
    headerSubtitle: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.85)",
      margin: 0
    },
    formBody: {
      padding: "32px"
    },
    selectedOrderCard: {
      background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      padding: "16px",
      borderRadius: "14px",
      marginBottom: "24px",
      border: "1px solid #fed7aa"
    },
    selectedOrderHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    selectedOrderIcon: {
      width: "40px",
      height: "40px",
      background: "#f97316",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "18px"
    },
    selectedOrderContent: {
      flex: 1
    },
    selectedOrderLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#9a3412",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px"
    },
    selectedOrderValue: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#431407",
      margin: 0
    },
    selectedOrderCheck: {
      color: "#16a34a",
      fontSize: "20px"
    },
    orderDetailsCard: {
      marginTop: "12px",
      padding: "12px 16px",
      background: "#ffffff",
      borderRadius: "10px",
      border: "1px solid #f1f5f9"
    },
    orderDetailRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      fontSize: "13px",
      color: "#334155"
    },
    orderDetailLabel: {
      color: "#64748b"
    },
    orderDetailValue: {
      fontWeight: "500",
      color: "#0f172a"
    },
    formGroup: {
      marginBottom: "24px"
    },
    label: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#334155",
      marginBottom: "8px"
    },
    labelIcon: {
      color: "#f97316",
      fontSize: "14px"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "2px"
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      outline: "none",
      fontFamily: "inherit",
      background: "#fff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: "#1e293b"
    },
    recommendedCard: {
      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      border: "2px solid #86efac",
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "20px",
      position: "relative"
    },
    recommendedBadge: {
      position: "absolute",
      top: "-10px",
      right: "16px",
      background: "#f97316",
      color: "#fff",
      padding: "2px 14px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      boxShadow: "0 2px 8px rgba(249,115,22,0.3)"
    },
    recommendedTitle: {
      margin: "0 0 4px 0",
      fontSize: "13px",
      fontWeight: "600",
      color: "#15803d",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    recommendedCourier: {
      margin: "8px 0 0 0",
      fontSize: "20px",
      fontWeight: "700",
      color: "#065f46",
      letterSpacing: "-0.5px"
    },
    recommendedRate: {
      margin: "0",
      fontSize: "14px",
      color: "#15803d",
      fontWeight: "500"
    },
    comparisonCard: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "20px"
    },
    comparisonTitle: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 12px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    costPreviewCard: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "16px",
      marginBottom: "20px"
    },
    costPreviewTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 12px 0"
    },
    costRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      fontSize: "13px",
      color: "#475569"
    },
    costDivider: {
      border: "none",
      borderTop: "1px solid #e2e8f0",
      margin: "8px 0"
    },
    costTotal: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      fontSize: "15px",
      fontWeight: "700",
      color: "#0f172a"
    },
    walletCard: {
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      borderRadius: "14px",
      padding: "16px",
      marginBottom: "20px"
    },
    walletRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      fontSize: "13px",
      color: "#065f46"
    },
    walletBalance: {
      fontWeight: "600",
      color: "#065f46"
    },
    walletAfter: {
      fontWeight: "600",
      color: isInsufficientBalance ? "#dc2626" : "#065f46"
    },
    walletRequired: {
      fontWeight: "600",
      color: "#0f172a"
    },
    shortfallText: {
      fontWeight: "600",
      color: "#dc2626"
    },
    insufficientText: {
      color: "#dc2626",
      fontSize: "12px",
      fontWeight: "500",
      marginTop: "8px",
      textAlign: "center"
    },
    submitButton: {
      width: "100%",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      color: "#fff",
      padding: "14px 24px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "8px"
    },
    submitButtonDisabled: {
      width: "100%",
      background: "#94a3b8",
      color: "#fff",
      padding: "14px 24px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "8px",
      opacity: 0.7
    },
    backButton: {
      background: "transparent",
      border: "1.5px solid #e2e8f0",
      color: "#64748b",
      padding: "10px 20px",
      borderRadius: "10px",
      fontWeight: "500",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "20px"
    },
    buttonWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    loadingText: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "13px",
      padding: "8px 0"
    },
    noRatesText: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "13px",
      padding: "12px 0"
    },
    insuranceToggle: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "14px 16px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    insuranceToggleActive: {
      background: "#f0fdf4",
      border: "1px solid #86efac",
    },
    insuranceLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    insuranceIcon: {
      color: "#f97316",
      fontSize: "16px"
    },
    insuranceLabel: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#0f172a"
    },
    insuranceSubtext: {
      fontSize: "11px",
      color: "#64748b",
      marginTop: "2px"
    },
    insuranceSwitch: {
      width: "44px",
      height: "24px",
      background: "#cbd5e1",
      borderRadius: "12px",
      position: "relative",
      transition: "all 0.3s ease",
      flexShrink: 0
    },
    insuranceSwitchActive: {
      background: "#f97316",
    },
    insuranceSwitchKnob: {
      width: "20px",
      height: "20px",
      background: "#fff",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: "2px",
      transition: "all 0.3s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
    },
    insuranceSwitchKnobActive: {
      left: "22px",
    },
    insuranceCostRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      fontSize: "13px",
      color: "#475569",
      marginTop: "4px"
    }
  };

  const desktopStyles = `
    @media (min-width: 768px) {
      .create-shipment-container {
        flex-direction: row !important;
      }
      .sidebar-wrapper {
        width: 280px !important;
      }
      .create-shipment-main {
        padding: 32px 40px !important;
      }
    }

    @media (max-width: 767px) {
      .create-shipment-main {
        padding: 16px !important;
      }
      .create-shipment-main > div {
        max-width: 100% !important;
        border-radius: 16px !important;
      }
      .create-shipment-main > div > div:first-child {
        padding: 20px 16px !important;
      }
      .create-shipment-main > div > div:last-child {
        padding: 20px 16px !important;
      }
    }

    select:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
    }

    select:hover {
      border-color: #f97316 !important;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    .back-button:hover {
      border-color: #f97316 !important;
      color: #f97316 !important;
    }

    .comparison-table th {
      border-bottom: 2px solid #e2e8f0 !important;
    }

    .comparison-table td {
      border-bottom: 1px solid #f1f5f9 !important;
    }

    .comparison-table tr:last-child td {
      border-bottom: none !important;
    }

    .insurance-toggle:hover {
      border-color: #f97316 !important;
    }
  `;

  return (
    <>
      <style>{desktopStyles}</style>
      <div className="create-shipment-container" style={styles.container}>
        <div className="sidebar-wrapper" style={styles.sidebarWrapper}>
          <Sidebar />
        </div>

        <main className="create-shipment-main" style={styles.main}>
          <div style={styles.formContainer}>
            {/* Header with Gradient */}
            <div style={styles.formHeader}>
              <div style={styles.headerIcon}>
                <FaShippingFast />
              </div>
              <h2 style={styles.headerTitle}>
                {isBulk ? `Bulk Shipment (${bulkOrderIds.length} Orders)` : "Create Shipment"}
              </h2>
              <p style={styles.headerSubtitle}>
                {isBulk 
                  ? `Creating shipments for ${bulkOrderIds.length} selected orders` 
                  : "Generate new shipment for order"}
              </p>
            </div>

            {/* Form Body */}
            <div style={styles.formBody}>
              <button 
                onClick={() => navigate(-1)} 
                className="back-button"
                style={styles.backButton}
              >
                <FaArrowLeft size={12} /> Back
              </button>

              <form onSubmit={handleSubmit}>
                {/* Bulk Order Count Display */}
                {isBulk && bulkOrderIds.length > 0 && (
                  <div style={{
                    ...styles.selectedOrderCard,
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    border: "1px solid #86efac"
                  }}>
                    <div style={styles.selectedOrderHeader}>
                      <div style={{
                        ...styles.selectedOrderIcon,
                        background: "#16a34a"
                      }}>
                        <FaBox />
                      </div>
                      <div style={styles.selectedOrderContent}>
                        <div style={{
                          ...styles.selectedOrderLabel,
                          color: "#166534"
                        }}>
                          Bulk Shipment
                        </div>
                        <div style={{
                          ...styles.selectedOrderValue,
                          color: "#14532d"
                        }}>
                          {bulkOrderIds.length} orders selected for bulk shipment
                        </div>
                      </div>
                      <FaCheckCircle style={{
                        color: "#16a34a",
                        fontSize: "20px"
                      }} />
                    </div>
                  </div>
                )}

                {/* Selected Order Display for Single */}
                {!isBulk && currentOrder && (
                  <div style={styles.selectedOrderCard}>
                    <div style={styles.selectedOrderHeader}>
                      <div style={styles.selectedOrderIcon}>
                        <FaBox />
                      </div>
                      <div style={styles.selectedOrderContent}>
                        <div style={styles.selectedOrderLabel}>Selected Order</div>
                        <div style={styles.selectedOrderValue}>
                          {currentOrder.orderNumber || currentOrder._id?.slice(-6) || "N/A"} - {currentOrder.customerName || "N/A"}
                        </div>
                      </div>
                      <FaCheckCircle style={styles.selectedOrderCheck} />
                    </div>

                    {/* Order Details Card */}
                    <div style={styles.orderDetailsCard}>
                      <div style={styles.orderDetailRow}>
                        <span style={styles.orderDetailLabel}>Product</span>
                        <span style={styles.orderDetailValue}>{currentOrder?.productName || "N/A"}</span>
                      </div>
                      <div style={styles.orderDetailRow}>
                        <span style={styles.orderDetailLabel}>Weight</span>
                        <span style={styles.orderDetailValue}>{currentOrder?.weight || 0} KG</span>
                      </div>
                      <div style={styles.orderDetailRow}>
                        <span style={styles.orderDetailLabel}>Payment</span>
                        <span style={styles.orderDetailValue}>{currentOrder?.paymentMode || "N/A"}</span>
                      </div>
                      <div style={styles.orderDetailRow}>
                        <span style={styles.orderDetailLabel}>Amount</span>
                        <span style={styles.orderDetailValue}>₹{currentOrder?.amount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Selection - Hide in bulk mode */}
                {!isBulk && (
                  <div style={styles.formGroup}>
                    <div style={styles.label}>
                      <FaBox style={styles.labelIcon} />
                      <span>Select Order <span style={styles.requiredStar}>*</span></span>
                    </div>
                    <select
                      name="orderId"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      style={styles.select}
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
                  <div style={styles.formGroup}>
                    <div style={styles.label}>
                      <FaBox style={styles.labelIcon} />
                      <span>Bulk Orders <span style={styles.requiredStar}>*</span></span>
                    </div>
                    <div style={{
                      padding: "12px 16px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#0f172a"
                    }}>
                      {bulkOrderIds.length} orders selected
                      <span style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "4px"
                      }}>
                        Using first order for rate calculation
                      </span>
                    </div>
                  </div>
                )}

                {/* Top 3 Recommended Couriers Card */}
                {recommendationLoading ? (
                  <div style={styles.loadingText}>⏳ Finding best couriers...</div>
                ) : courierRates.length > 0 ? (
                  <>
                    <div style={styles.recommendedCard}>
                      <div style={styles.recommendedBadge}>🏆 Top 3</div>
                      <div style={styles.recommendedTitle}>
                        <FaStar style={{ color: "#f97316" }} />
                        Recommended Couriers (Cheapest)
                      </div>
                      
                      {courierRates.slice(0, 3).map((c, index) => {
                        const total = Number(c.total || 0);
                        const isCheapest = index === 0;
                        
                        return (
                          <div
                            key={c.courier}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                              borderBottom: index < 2 ? "1px solid #e2e8f0" : "none",
                              marginTop: index === 0 ? "8px" : "0",
                              background: isCheapest ? "rgba(22, 163, 74, 0.08)" : "transparent",
                              borderRadius: isCheapest ? "6px" : "0",
                              paddingLeft: isCheapest ? "8px" : "0",
                              paddingRight: isCheapest ? "8px" : "0"
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ 
                                fontWeight: "600", 
                                color: isCheapest ? "#16a34a" : "#334155",
                                fontSize: isCheapest ? "14px" : "13px"
                              }}>
                                #{index + 1}
                              </span>
                              <span style={{ fontWeight: "500", color: "#0f172a" }}>
                                {courierMap[c.courier] || c.courier}
                              </span>
                              {isCheapest && (
                                <span style={{ 
                                  background: "#16a34a", 
                                  color: "#fff", 
                                  fontSize: "10px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontWeight: "600"
                                }}>
                                  Cheapest
                                </span>
                              )}
                            </span>
                            <span style={{ 
                              fontWeight: isCheapest ? "700" : "500",
                              color: isCheapest ? "#16a34a" : "#0f172a"
                            }}>
                              ₹{total}
                            </span>
                          </div>
                        );
                      })}
                      
                      {courierRates.length > 3 && (
                        <div style={{
                          textAlign: "center",
                          marginTop: "10px",
                          fontSize: "12px",
                          color: "#94a3b8"
                        }}>
                          +{courierRates.length - 3} more couriers available
                        </div>
                      )}
                    </div>

                    {/* Courier Comparison Table */}
                    {courierRates.length > 0 && (
                      <div style={styles.comparisonCard}>
                        <div style={styles.comparisonTitle}>
                          <FaSortAmountUp style={{ color: "#64748b" }} />
                          All Courier Comparison
                        </div>

                        <table
                          className="comparison-table"
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                          }}
                        >
                          <thead>
                            <tr>
                              <th style={{ textAlign: "left", padding: "8px" }}>
                                Courier
                              </th>
                              <th style={{ textAlign: "center", padding: "8px" }}>
                                Forward
                              </th>
                              <th style={{ textAlign: "center", padding: "8px" }}>
                                COD
                              </th>
                              <th style={{ textAlign: "center", padding: "8px" }}>
                                ETA
                              </th>
                              <th style={{ textAlign: "right", padding: "8px" }}>
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {courierRates.slice(0, 5).map((c, index) => {
                              const total = Number(c.total || 0);
                              const isCheapest = index === 0;
                              const eta = c.eta || etaMap[c.courier] || "N/A";

                              return (
                                <tr
                                  key={c.courier}
                                  style={{
                                    borderTop: "1px solid #e2e8f0",
                                    background: isCheapest ? "#f0fdf4" : "transparent"
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "10px 8px",
                                    }}
                                  >
                                    {courierMap[c.courier] || c.courier}
                                    {isCheapest && (
                                      <span
                                        style={{
                                          marginLeft: 4,
                                          color: "#16a34a",
                                          fontWeight: 600,
                                          fontSize: "11px"
                                        }}
                                      >
                                        ⭐ Cheapest
                                      </span>
                                    )}
                                  </td>

                                  <td
                                    style={{
                                      textAlign: "center",
                                      padding: "10px 8px",
                                    }}
                                  >
                                    ₹{c.forwardRate || 0}
                                  </td>

                                  <td
                                    style={{
                                      textAlign: "center",
                                      padding: "10px 8px",
                                    }}
                                  >
                                    ₹{c.codCharge || 0}
                                  </td>

                                  <td
                                    style={{
                                      textAlign: "center",
                                      padding: "10px 8px",
                                      color: "#475569"
                                    }}
                                  >
                                    {eta}
                                  </td>

                                  <td
                                    style={{
                                      textAlign: "right",
                                      fontWeight: isCheapest ? "700" : "600",
                                      padding: "10px 8px",
                                      color: isCheapest ? "#15803d" : "#0f172a"
                                    }}
                                  >
                                    ₹{total}
                                  </td>
                                </tr>
                              );
                            })}
                            
                            {courierRates.length > 5 && (
                              <tr>
                                <td colSpan="5" style={{
                                  textAlign: "center",
                                  padding: "10px",
                                  color: "#94a3b8",
                                  fontSize: "12px"
                                }}>
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
                  <div style={styles.noRatesText}>
                    No rate cards found. Please contact admin.
                  </div>
                ) : null}

                {/* Dynamic Courier Dropdown */}
                <div style={styles.formGroup}>
                  <div style={styles.label}>
                    <FaTruck style={styles.labelIcon} />
                    <span>Select Courier <span style={styles.requiredStar}>*</span></span>
                    {recommended && (
                      <span style={{ 
                        marginLeft: "auto", 
                        fontSize: "11px", 
                        color: "#15803d",
                        fontWeight: "500"
                      }}>
                        ⭐ Best: {courierMap[recommended.courier] || recommended.courier}
                      </span>
                    )}
                  </div>
                  <select
                    name="courier"
                    value={formData.courier}
                    onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
                    style={{
                      ...styles.select,
                      borderColor: recommended && formData.courier === (courierMap[recommended.courier] || recommended.courier) ? "#86efac" : "#e2e8f0",
                      background: recommended && formData.courier === (courierMap[recommended.courier] || recommended.courier) ? "#f0fdf4" : "#fff"
                    }}
                    required
                  >
                    <option value="">Choose a courier partner</option>
                    {courierRates.map((c) => (
                      <option
                        key={c.courier}
                        value={courierMap[c.courier] || c.courier}
                      >
                        {courierMap[c.courier] || c.courier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Insurance Toggle */}
                {currentOrder && !isBulk && (
                  <div 
                    className="insurance-toggle"
                    style={{
                      ...styles.insuranceToggle,
                      ...(insuranceEnabled ? styles.insuranceToggleActive : {})
                    }}
                    onClick={() => setInsuranceEnabled(!insuranceEnabled)}
                  >
                    <div style={styles.insuranceLeft}>
                      <FaShieldAlt style={styles.insuranceIcon} />
                      <div>
                        <div style={styles.insuranceLabel}>
                          ☑ Add Insurance
                        </div>
                        <div style={styles.insuranceSubtext}>
                          Protect your shipment (₹{INSURANCE_CHARGE})
                        </div>
                      </div>
                    </div>
                    <div style={{
                      ...styles.insuranceSwitch,
                      ...(insuranceEnabled ? styles.insuranceSwitchActive : {})
                    }}>
                      <div style={{
                        ...styles.insuranceSwitchKnob,
                        ...(insuranceEnabled ? styles.insuranceSwitchKnobActive : {})
                      }} />
                    </div>
                  </div>
                )}

                {/* Bulk Insurance Toggle */}
                {isBulk && (
                  <div 
                    className="insurance-toggle"
                    style={{
                      ...styles.insuranceToggle,
                      ...(insuranceEnabled ? styles.insuranceToggleActive : {})
                    }}
                    onClick={() => setInsuranceEnabled(!insuranceEnabled)}
                  >
                    <div style={styles.insuranceLeft}>
                      <FaShieldAlt style={styles.insuranceIcon} />
                      <div>
                        <div style={styles.insuranceLabel}>
                          ☑ Add Insurance to All
                        </div>
                        <div style={styles.insuranceSubtext}>
                          Protect all shipments (₹{INSURANCE_CHARGE} each)
                        </div>
                      </div>
                    </div>
                    <div style={{
                      ...styles.insuranceSwitch,
                      ...(insuranceEnabled ? styles.insuranceSwitchActive : {})
                    }}>
                      <div style={{
                        ...styles.insuranceSwitchKnob,
                        ...(insuranceEnabled ? styles.insuranceSwitchKnobActive : {})
                      }} />
                    </div>
                  </div>
                )}

                {/* Cost Preview */}
                <div style={styles.costPreviewCard}>
                  <h4 style={styles.costPreviewTitle}>
                    {isBulk ? `💰 Bulk Cost Preview (per order)` : `💰 Shipment Cost Preview`}
                  </h4>
                  <div style={styles.costRow}>
                    <span>Shipping Charge</span>
                    <span>₹{pricing.shippingCharge}</span>
                  </div>
                  <div style={styles.costRow}>
                    <span>COD Charge</span>
                    <span>₹{pricing.codCharge}</span>
                  </div>
                  <div style={styles.costRow}>
                    <span>Fuel Charge</span>
                    <span>₹{pricing.fuelCharge}</span>
                  </div>
                  
                  {insuranceEnabled && (
                    <div style={styles.costRow}>
                      <span>🛡️ Insurance Charge</span>
                      <span>₹{INSURANCE_CHARGE}</span>
                    </div>
                  )}
                  
                  <hr style={styles.costDivider} />
                  <div style={styles.costTotal}>
                    <span>Total per Order</span>
                    <span style={{ color: "#ea580c" }}>₹{totalCharge}</span>
                  </div>
                  
                  {isBulk && bulkOrderIds.length > 0 && (
                    <div style={{
                      ...styles.costTotal,
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "2px solid #e2e8f0"
                    }}>
                      <span>Total for {bulkOrderIds.length} Orders</span>
                      <span style={{ color: "#ea580c", fontSize: "18px" }}>
                        ₹{totalCharge * bulkOrderIds.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Wallet Preview */}
                <div style={styles.walletCard}>
                  <div style={styles.walletRow}>
                    <span>💰 Wallet Balance</span>
                    <span style={styles.walletBalance}>₹{walletBalance}</span>
                  </div>
                  <div style={styles.walletRow}>
                    <span>Required Amount</span>
                    <span style={styles.walletRequired}>
                      {isBulk ? `₹${totalCharge * bulkOrderIds.length}` : `₹${totalCharge}`}
                    </span>
                  </div>
                  
                  {isInsufficientBalance ? (
                    <>
                      <div style={styles.walletRow}>
                        <span>Shortfall</span>
                        <span style={styles.shortfallText}>
                          ₹{isBulk ? shortfall * bulkOrderIds.length : shortfall}
                        </span>
                      </div>
                      <div style={styles.insufficientText}>
                        ⚠️ Please recharge ₹{isBulk ? shortfall * bulkOrderIds.length : shortfall} to proceed
                      </div>
                    </>
                  ) : (
                    <div style={styles.walletRow}>
                      <span>Balance After Shipment</span>
                      <span style={styles.walletAfter}>
                        ₹{isBulk ? Math.max(0, walletBalance - (totalCharge * bulkOrderIds.length)) : balanceAfterShipment}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div style={styles.buttonWrapper}>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    style={!isFormValid ? styles.submitButtonDisabled : styles.submitButton}
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