import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { FaCalculator, FaTruck, FaClock, FaRupeeSign, FaBox, FaRulerCombined, FaCreditCard } from "react-icons/fa";

const RateCalculator = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [height, setHeight] = useState("");
  const [paymentType, setPaymentType] = useState("PREPAID");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRates = () => {
    if (!pickup || !delivery || !weight) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setRates([
        {
          courier: "Delhivery",
          service: "Surface",
          price: 120,
          days: 3,
          cod: true,
        },
        {
          courier: "DTDC",
          service: "Air",
          price: 135,
          days: 2,
          cod: true,
        },
        {
          courier: "XpressBees",
          service: "Surface",
          price: 110,
          days: 4,
          cod: true,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const calculateVolumetricWeight = () => {
    if (!length || !breadth || !height) return 0;
    const l = parseFloat(length) || 0;
    const b = parseFloat(breadth) || 0;
    const h = parseFloat(height) || 0;
    return (l * b * h) / 5000;
  };

  const volumetricWeight = calculateVolumetricWeight();
  const actualWeight = parseFloat(weight) || 0;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  const getShippingCharge = () => {
    if (!rates || rates.length === 0) return 0;
    const cheapest = rates.reduce((min, r) => r.price < min.price ? r : min);
    return cheapest.price || 0;
  };

  const shippingCharge = getShippingCharge();
  const fuelSurcharge = Math.round(shippingCharge * 0.08);
  const insuranceCharge = shippingCharge > 500 ? Math.round(shippingCharge * 0.02) : 0;
  const gst = Math.round((shippingCharge + fuelSurcharge + insuranceCharge) * 0.18);
  const totalCharge = shippingCharge + fuelSurcharge + insuranceCharge + gst;

  const getCheapestRate = () => {
    if (!rates || rates.length === 0) return null;
    return rates.reduce((min, r) => r.price < min.price ? r : min);
  };

  const getFastestRate = () => {
    if (!rates || rates.length === 0) return null;
    return rates.reduce((min, r) => r.days < min.days ? r : min);
  };

  const cheapest = getCheapestRate();
  const fastest = getFastestRate();

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f0f2f5",
      fontFamily: "'Inter', -apple-system, sans-serif",
    },
    sidebar: {
      width: "280px",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      padding: "32px",
      overflowX: "hidden",
    },
    header: {
      marginBottom: "28px",
    },
    pageTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0,
    },
    mainCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      border: "1px solid #e8ecf1",
      marginBottom: "28px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#334155",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    required: {
      color: "#ef4444",
      fontSize: "14px",
    },
    input: {
      padding: "12px 14px",
      border: "1.5px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#fafbfc",
      color: "#0f172a",
      width: "100%",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#f97316",
      background: "#ffffff",
      boxShadow: "0 0 0 4px rgba(249, 115, 22, 0.08)",
    },
    select: {
      padding: "12px 14px",
      border: "1.5px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#fafbfc",
      color: "#0f172a",
      width: "100%",
      boxSizing: "border-box",
      cursor: "pointer",
    },
    buttonRow: {
      display: "flex",
      alignItems: "flex-end",
    },
    button: {
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      color: "#fff",
      border: "none",
      padding: "12px 32px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      transition: "all 0.2s ease",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
      height: "48px",
    },
    buttonDisabled: {
      background: "#94a3b8",
      color: "#fff",
      border: "none",
      padding: "12px 32px",
      borderRadius: "12px",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "not-allowed",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      height: "48px",
    },
    resultsSection: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
    resultCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "24px 28px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      border: "1px solid #e8ecf1",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    tableWrapper: {
      overflowX: "auto",
      marginTop: "4px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "550px",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      background: "#f8fafc",
      borderBottom: "2px solid #e8ecf1",
    },
    td: {
      padding: "14px 16px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
    },
    badge: (bg, color) => ({
      background: bg,
      color: color,
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "10px",
      fontWeight: "600",
      display: "inline-block",
      marginLeft: "8px",
    }),
    chargesGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    chargeItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid #f1f5f9",
    },
    chargeLabel: {
      color: "#64748b",
      fontSize: "14px",
    },
    chargeValue: {
      fontWeight: "600",
      color: "#0f172a",
      fontSize: "14px",
    },
    totalAmount: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#f97316",
    },
    weightGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    weightItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid #f1f5f9",
    },
    weightLabel: {
      color: "#64748b",
      fontSize: "14px",
    },
    weightValue: {
      fontWeight: "600",
      color: "#0f172a",
      fontSize: "14px",
    },
    noteBox: {
      background: "#f8fafc",
      padding: "14px 18px",
      borderRadius: "12px",
      borderLeft: "4px solid #f97316",
    },
    noteText: {
      fontSize: "13px",
      color: "#64748b",
      margin: 0,
      lineHeight: "1.6",
    },
    icon: {
      color: "#f97316",
      fontSize: "18px",
    },
    courierName: {
      fontWeight: "600",
      color: "#0f172a",
    },
    priceHighlight: {
      fontWeight: "700",
      color: "#f97316",
    },
    divider: {
      border: "none",
      borderTop: "2px solid #e8ecf1",
      margin: "16px 0",
    },
    codBadge: (cod) => ({
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      background: cod ? "#dcfce7" : "#f1f5f9",
      color: cod ? "#166534" : "#94a3b8",
    }),
    statusBadge: {
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#94a3b8",
    },
    emptyIcon: {
      fontSize: "48px",
      color: "#e2e8f0",
      marginBottom: "16px",
    },
  };

  const desktopStyles = `
    .input-field:focus {
      border-color: #f97316 !important;
      background: #ffffff !important;
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08) !important;
    }
    .select-field:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08) !important;
    }
    .btn-calculate:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35) !important;
    }
    .btn-calculate:active {
      transform: translateY(0);
    }
    tr:hover td {
      background: #fafbfc !important;
    }
    @media (max-width: 768px) {
      .rate-content {
        padding: 16px !important;
      }
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      .charges-grid {
        grid-template-columns: 1fr !important;
      }
      .weight-grid {
        grid-template-columns: 1fr !important;
      }
      .main-card {
        padding: 20px !important;
      }
    }
  `;

  return (
    <>
      <style>{desktopStyles}</style>
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <Sidebar />
        </div>

        <div className="rate-content" style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>
              <FaCalculator style={styles.icon} /> Rate Calculator
            </h1>
            <p style={styles.pageSubtitle}>Get instant courier shipping rates and compare options</p>
          </div>

          {/* Form Card */}
          <div style={styles.mainCard}>
            <div className="form-grid" style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaTruck size={14} /> Pickup Pincode <span style={styles.required}>*</span>
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter pickup pincode"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaTruck size={14} /> Delivery Pincode <span style={styles.required}>*</span>
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter delivery pincode"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaBox size={14} /> Weight (kg) <span style={styles.required}>*</span>
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaRulerCombined size={14} /> Length (cm)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaRulerCombined size={14} /> Breadth (cm)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter breadth"
                  value={breadth}
                  onChange={(e) => setBreadth(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaRulerCombined size={14} /> Height (cm)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaCreditCard size={14} /> Payment Type
                </label>
                <select
                  className="select-field"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => e.target.style = { ...styles.select, ...styles.inputFocus }}
                  onBlur={(e) => e.target.style = styles.select}
                >
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div style={{ ...styles.formGroup, ...styles.buttonRow }}>
                <button
                  className="btn-calculate"
                  style={loading ? styles.buttonDisabled : styles.button}
                  onClick={calculateRates}
                  disabled={loading}
                >
                  {loading ? (
                    <>⏳ Calculating...</>
                  ) : (
                    <>🚀 Calculate Rates</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {rates ? (
            <div style={styles.resultsSection}>
              {/* Rate Table */}
              <div style={styles.resultCard}>
                <div style={styles.sectionTitle}>
                  <FaTruck /> Available Courier Rates
                  <span style={styles.statusBadge}>{rates.length} options</span>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Courier</th>
                        <th style={styles.th}>Service</th>
                        <th style={styles.th}>Rate</th>
                        <th style={styles.th}>ETA</th>
                        <th style={styles.th}>COD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.map((rate) => (
                        <tr key={rate.courier}>
                          <td style={styles.td}>
                            <span style={styles.courierName}>{rate.courier}</span>
                            {rate.price === cheapest?.price && (
                              <span style={styles.badge("#dcfce7", "#166534")}>⭐ Cheapest</span>
                            )}
                            {rate.days === fastest?.days && (
                              <span style={styles.badge("#dbeafe", "#1d4ed8")}>⚡ Fastest</span>
                            )}
                          </td>
                          <td style={styles.td}>{rate.service}</td>
                          <td style={styles.td}>
                            <span style={styles.priceHighlight}>₹{rate.price}</span>
                          </td>
                          <td style={styles.td}>
                            <FaClock style={{ fontSize: "12px", color: "#94a3b8", marginRight: "4px" }} />
                            {rate.days} Days
                          </td>
                          <td style={styles.td}>
                            <span style={styles.codBadge(rate.cod)}>
                              {rate.cod ? "✅ Yes" : "❌ No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charges & Weight Side by Side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Estimated Charges */}
                <div style={styles.resultCard}>
                  <div style={styles.sectionTitle}>
                    <FaRupeeSign /> Estimated Charges
                  </div>

                  <div>
                    <div style={styles.chargeItem}>
                      <span style={styles.chargeLabel}>Shipping</span>
                      <span style={styles.chargeValue}>₹{shippingCharge}</span>
                    </div>
                    <div style={styles.chargeItem}>
                      <span style={styles.chargeLabel}>Fuel Surcharge (8%)</span>
                      <span style={styles.chargeValue}>₹{fuelSurcharge}</span>
                    </div>
                    <div style={styles.chargeItem}>
                      <span style={styles.chargeLabel}>Insurance</span>
                      <span style={styles.chargeValue}>₹{insuranceCharge}</span>
                    </div>
                    <div style={styles.chargeItem}>
                      <span style={styles.chargeLabel}>GST (18%)</span>
                      <span style={styles.chargeValue}>₹{gst}</span>
                    </div>
                    <hr style={styles.divider} />
                    <div style={{ ...styles.chargeItem, borderBottom: "none", paddingTop: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                        Total
                      </span>
                      <span style={styles.totalAmount}>₹{totalCharge}</span>
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "13px", color: "#94a3b8" }}>
                      Payment: <strong>{paymentType}</strong>
                      {paymentType === "COD" && (
                        <span style={{ marginLeft: "12px", color: "#d97706" }}>
                          ⚡ COD charges may apply
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chargeable Weight */}
                <div style={styles.resultCard}>
                  <div style={styles.sectionTitle}>
                    <FaBox /> Chargeable Weight
                  </div>

                  <div>
                    <div style={styles.weightItem}>
                      <span style={styles.weightLabel}>Actual Weight</span>
                      <span style={styles.weightValue}>{actualWeight.toFixed(2)} kg</span>
                    </div>
                    <div style={styles.weightItem}>
                      <span style={styles.weightLabel}>Volumetric Weight</span>
                      <span style={styles.weightValue}>
                        {volumetricWeight > 0 ? volumetricWeight.toFixed(2) : "N/A"} kg
                      </span>
                    </div>
                    <hr style={styles.divider} />
                    <div style={{ ...styles.weightItem, borderBottom: "none", paddingTop: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                        Chargeable Weight
                      </span>
                      <span style={{ fontSize: "20px", fontWeight: "700", color: "#f97316" }}>
                        {chargeableWeight > 0 ? chargeableWeight.toFixed(2) : "N/A"} kg
                      </span>
                    </div>
                    <div style={styles.noteBox}>
                      <p style={styles.noteText}>
                        <strong>Note:</strong> Chargeable weight is the greater of actual weight 
                        and volumetric weight (L×B×H / 5000). This determines the final shipping cost.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...styles.resultCard, ...styles.emptyState }}>
              <div style={styles.emptyIcon}>📦</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>
                No Rates Calculated Yet
              </div>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                Fill in the details above and click "Calculate Rates" to see courier options
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RateCalculator;