import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaBox, FaTruck, FaArrowLeft, FaCheckCircle, FaShippingFast } from "react-icons/fa";

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/shipments", formData);
      alert("Shipment Created Successfully");
      navigate("/merchant/shipments");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
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
      border: "1px solid #fed7aa",
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
                {selectedOrder && (
                  <div style={styles.selectedOrderCard}>
                    <div style={styles.selectedOrderIcon}>
                      <FaBox />
                    </div>
                    <div style={styles.selectedOrderContent}>
                      <div style={styles.selectedOrderLabel}>Selected Order</div>
                      <div style={styles.selectedOrderValue}>
                        {selectedOrder.orderNumber || selectedOrder._id.slice(-6)} - {selectedOrder.customerName}
                      </div>
                    </div>
                    <FaCheckCircle style={{ color: "#16a34a", fontSize: "20px" }} />
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

                {/* Courier Selection */}
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
                  </select>
                </div>

                {/* Submit Button */}
                <div style={styles.buttonWrapper}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.submitButton,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? (
                      <>⏳ Creating Shipment...</>
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