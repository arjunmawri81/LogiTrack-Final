import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { FaCalculator, FaTruck, FaClock, FaRupeeSign, FaBox, FaRulerCombined, FaCreditCard } from "react-icons/fa";
import "./RateCalculator.css"; 

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

  return (
    <div className="rate-container">
      <div className="rate-sidebar">
        <Sidebar />
      </div>

      <div className="rate-content">
        {/* Header */}
        <div className="rate-header">
          <h1 className="rate-title">
            <FaCalculator className="rate-title-icon" /> Rate Calculator
          </h1>
          <p className="rate-subtitle">Get instant courier shipping rates and compare options</p>
        </div>

        {/* Form Card */}
        <div className="rate-main-card">
          <div className="rate-form-grid">
            <div className="rate-form-group">
              <label className="rate-label">
                <FaTruck size={14} /> Pickup Pincode <span className="rate-required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter pickup pincode"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaTruck size={14} /> Delivery Pincode <span className="rate-required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter delivery pincode"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaBox size={14} /> Weight (kg) <span className="rate-required">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaRulerCombined size={14} /> Length (cm)
              </label>
              <input
                type="number"
                placeholder="Enter length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaRulerCombined size={14} /> Breadth (cm)
              </label>
              <input
                type="number"
                placeholder="Enter breadth"
                value={breadth}
                onChange={(e) => setBreadth(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaRulerCombined size={14} /> Height (cm)
              </label>
              <input
                type="number"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="rate-input"
              />
            </div>

            <div className="rate-form-group">
              <label className="rate-label">
                <FaCreditCard size={14} /> Payment Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="rate-select"
              >
                <option value="PREPAID">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>

            <div className="rate-form-group rate-button-group">
              <button
                className={`rate-btn ${loading ? 'rate-btn-disabled' : ''}`}
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
          <div className="rate-results">
            {/* Rate Table */}
            <div className="rate-result-card">
              <div className="rate-section-title">
                <FaTruck /> Available Courier Rates
                <span className="rate-status-badge">{rates.length} options</span>
              </div>

              <div className="rate-table-wrapper">
                <table className="rate-table">
                  <thead>
                    <tr>
                      <th className="rate-th">Courier</th>
                      <th className="rate-th">Service</th>
                      <th className="rate-th">Rate</th>
                      <th className="rate-th">ETA</th>
                      <th className="rate-th">COD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate) => (
                      <tr key={rate.courier} className="rate-row">
                        <td className="rate-td">
                          <span className="rate-courier-name">{rate.courier}</span>
                          {rate.price === cheapest?.price && (
                            <span className="rate-badge rate-badge-cheapest">⭐ Cheapest</span>
                          )}
                          {rate.days === fastest?.days && (
                            <span className="rate-badge rate-badge-fastest">⚡ Fastest</span>
                          )}
                        </td>
                        <td className="rate-td">{rate.service}</td>
                        <td className="rate-td">
                          <span className="rate-price">₹{rate.price}</span>
                        </td>
                        <td className="rate-td">
                          <FaClock className="rate-clock-icon" />
                          {rate.days} Days
                        </td>
                        <td className="rate-td">
                          <span className={`rate-cod-badge ${rate.cod ? 'rate-cod-yes' : 'rate-cod-no'}`}>
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
            <div className="rate-charges-grid">
              {/* Estimated Charges */}
              <div className="rate-result-card">
                <div className="rate-section-title">
                  <FaRupeeSign /> Estimated Charges
                </div>

                <div>
                  <div className="rate-charge-item">
                    <span className="rate-charge-label">Shipping</span>
                    <span className="rate-charge-value">₹{shippingCharge}</span>
                  </div>
                  <div className="rate-charge-item">
                    <span className="rate-charge-label">Fuel Surcharge (8%)</span>
                    <span className="rate-charge-value">₹{fuelSurcharge}</span>
                  </div>
                  <div className="rate-charge-item">
                    <span className="rate-charge-label">Insurance</span>
                    <span className="rate-charge-value">₹{insuranceCharge}</span>
                  </div>
                  <div className="rate-charge-item">
                    <span className="rate-charge-label">GST (18%)</span>
                    <span className="rate-charge-value">₹{gst}</span>
                  </div>
                  <hr className="rate-divider" />
                  <div className="rate-charge-item rate-charge-total">
                    <span className="rate-charge-total-label">Total</span>
                    <span className="rate-total-amount">₹{totalCharge}</span>
                  </div>
                  <div className="rate-payment-note">
                    Payment: <strong>{paymentType}</strong>
                    {paymentType === "COD" && (
                      <span className="rate-cod-note">⚡ COD charges may apply</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chargeable Weight */}
              <div className="rate-result-card">
                <div className="rate-section-title">
                  <FaBox /> Chargeable Weight
                </div>

                <div>
                  <div className="rate-weight-item">
                    <span className="rate-weight-label">Actual Weight</span>
                    <span className="rate-weight-value">{actualWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="rate-weight-item">
                    <span className="rate-weight-label">Volumetric Weight</span>
                    <span className="rate-weight-value">
                      {volumetricWeight > 0 ? volumetricWeight.toFixed(2) : "N/A"} kg
                    </span>
                  </div>
                  <hr className="rate-divider" />
                  <div className="rate-weight-item rate-weight-total">
                    <span className="rate-weight-total-label">Chargeable Weight</span>
                    <span className="rate-chargeable-weight">
                      {chargeableWeight > 0 ? chargeableWeight.toFixed(2) : "N/A"} kg
                    </span>
                  </div>
                  <div className="rate-note-box">
                    <p className="rate-note-text">
                      <strong>Note:</strong> Chargeable weight is the greater of actual weight 
                      and volumetric weight (L×B×H / 5000). This determines the final shipping cost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rate-empty-state">
            <div className="rate-empty-icon">📦</div>
            <div className="rate-empty-title">No Rates Calculated Yet</div>
            <div className="rate-empty-text">
              Fill in the details above and click "Calculate Rates" to see courier options
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateCalculator;