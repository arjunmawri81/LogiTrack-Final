import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaBox, FaTruck, FaArrowLeft, FaCheckCircle, FaShippingFast, FaWallet, FaRupeeSign } from "react-icons/fa";

const CreateShipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOrder = location.state?.order;

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

  useEffect(() => {
    fetchOrders();
    fetchWallet();
  }, []);

  useEffect(() => {
    if (formData.orderId && formData.courier) {
      calculatePricing();
    }
  }, [formData.orderId, formData.courier]);

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
      const res = await api.post("/rate-cards/calculate", {
        orderId: formData.orderId,
        courier: formData.courier
      });
      
      setPricing({
        shippingCharge: res.data.shippingCharge || 0,
        codCharge: res.data.codCharge || 0,
        fuelCharge: res.data.fuelCharge || 0,
        totalCharge: res.data.totalCharge || 0
      });
    } catch (error) {
      console.log("Using static pricing fallback");
      
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
    }
  };

  const currentOrder = orders.find(o => o._id === formData.orderId) || selectedOrder;

  const totalCharge = pricing.totalCharge || 0;
  
  // ✅ FIX 1: Proper balance calculations
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
      await api.post("/shipments", formData);
      alert("Shipment Created Successfully");
      navigate("/merchant/shipments");
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
      alignItems: "center",
      justifyContent: "center"
    },
    formContainer: {
      background: "#ffffff",
      borderRadius: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01)",
      width: "100%",
      maxWidth: "560px",
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
              <h2 style={styles.headerTitle}>Create Shipment</h2>
              <p style={styles.headerSubtitle}>Generate new shipment for order</p>
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
                {/* Selected Order Display */}
                {currentOrder && (
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

                {/* Order Selection */}
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

                {/* Courier Selection - ✅ Added all couriers */}
                <div style={styles.formGroup}>
                  <div style={styles.label}>
                    <FaTruck style={styles.labelIcon} />
                    <span>Select Courier <span style={styles.requiredStar}>*</span></span>
                  </div>
                  <select
                    name="courier"
                    value={formData.courier}
                    onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
                    style={styles.select}
                    required
                  >
                    <option value="">Choose a courier partner</option>
                    <option value="DTDC">📦 DTDC</option>
                    <option value="Delhivery">🚚 Delhivery</option>
                    <option value="XpressBees">🐝 XpressBees</option>
                    <option value="BlueDart">🔵 BlueDart</option>
                    <option value="Ecom">📦 Ecom</option>
                    <option value="Shadowfax">🟣 Shadowfax</option>
                  </select>
                </div>

                {/* Shipment Cost Preview */}
                <div style={styles.costPreviewCard}>
                  <h4 style={styles.costPreviewTitle}>💰 Shipment Cost Preview</h4>
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
                  <hr style={styles.costDivider} />
                  <div style={styles.costTotal}>
                    <span>Total Charge</span>
                    <span style={{ color: "#ea580c" }}>₹{pricing.totalCharge}</span>
                  </div>
                </div>

                {/* ✅ FIX 1: Wallet Preview with proper calculations */}
                <div style={styles.walletCard}>
                  <div style={styles.walletRow}>
                    <span>💰 Wallet Balance</span>
                    <span style={styles.walletBalance}>₹{walletBalance}</span>
                  </div>
                  <div style={styles.walletRow}>
                    <span>Required Amount</span>
                    <span style={styles.walletRequired}>₹{totalCharge}</span>
                  </div>
                  
                  {isInsufficientBalance ? (
                    <>
                      <div style={styles.walletRow}>
                        <span>Shortfall</span>
                        <span style={styles.shortfallText}>₹{shortfall}</span>
                      </div>
                      <div style={styles.insufficientText}>
                        ⚠️ Please recharge ₹{shortfall} to proceed
                      </div>
                    </>
                  ) : (
                    <div style={styles.walletRow}>
                      <span>Balance After Shipment</span>
                      <span style={styles.walletAfter}>₹{balanceAfterShipment}</span>
                    </div>
                  )}
                </div>

                {/* ✅ FIX 2: Submit Button with better UX text */}
                <div style={styles.buttonWrapper}>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    style={!isFormValid ? styles.submitButtonDisabled : styles.submitButton}
                  >
                    {loading ? (
                      <>⏳ Creating Shipment...</>
                    ) : !formData.orderId ? (
                      <>📋 Select an Order</>
                    ) : !formData.courier ? (
                      <>🚚 Select a Courier</>
                    ) : isInsufficientBalance ? (
                      <>💳 Recharge Wallet First</>
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