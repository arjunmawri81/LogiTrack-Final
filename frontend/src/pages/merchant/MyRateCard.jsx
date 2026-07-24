import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import {
  FaTruck,
  FaPlane,
  FaSearch,
  FaSync,
  FaTags,
  FaInfoCircle,
  FaCheckCircle,
  FaRupeeSign,
  FaBox,
} from "react-icons/fa";

const MyRateCard = () => {
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");
  const [rateTypeFilter, setRateTypeFilter] = useState("ALL");

  useEffect(() => {
    fetchMyRateCards();
  }, []);

  const fetchMyRateCards = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch via /ratecards/my-ratecards endpoint
      const res = await api.get("/ratecards/my-ratecards");
      if (res.data && res.data.success) {
        setRateCards(res.data.rateCards || []);
      } else {
        setError("Failed to load rate cards.");
      }
    } catch (err) {
      console.error("Error fetching merchant rate cards:", err);
      setError(err.response?.data?.message || "Failed to load rate cards.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Rate Cards
  const filteredRateCards = useMemo(() => {
    return rateCards.filter((card) => {
      const courierName = card.courier?.name || card.courierPartner || "";
      const matchesSearch = courierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesService =
        serviceTypeFilter === "ALL" || card.serviceType === serviceTypeFilter;

      const isCustom = card.pricingType === "MERCHANT" || !card.isDefault;
      const matchesType =
        rateTypeFilter === "ALL" ||
        (rateTypeFilter === "CUSTOM" && isCustom) ||
        (rateTypeFilter === "STANDARD" && !isCustom);

      return matchesSearch && matchesService && matchesType;
    });
  }, [rateCards, searchQuery, serviceTypeFilter, rateTypeFilter]);

  const customCount = useMemo(() => {
    return rateCards.filter((c) => c.pricingType === "MERCHANT" || !c.isDefault).length;
  }, [rateCards]);

  const standardCount = useMemo(() => {
    return rateCards.filter((c) => c.pricingType === "DEFAULT" || c.isDefault).length;
  }, [rateCards]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR WRAPPER */}
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "32px 40px", overflowX: "hidden", minWidth: 0 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FaTags color="#3b82f6" /> My Rate Cards & Pricing
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
              View your contracted courier shipping rates, weight slabs, and zone pricing
            </p>
          </div>

          <button
            onClick={fetchMyRateCards}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <FaSync /> Refresh Rates
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "28px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Total Couriers</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "8px 0 0" }}>{rateCards.length}</h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Active courier partnerships</p>
          </div>

          <div style={{ background: "#eff6ff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #bfdbfe", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase" }}>🎯 Custom Rates</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1e40af", margin: "8px 0 0" }}>{customCount}</h2>
            <p style={{ fontSize: "12px", color: "#3b82f6", margin: "4px 0 0" }}>Discounted merchant-specific plans</p>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>📋 Standard Rates</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#334155", margin: "8px 0 0" }}>{standardCount}</h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>Platform baseline rate cards</p>
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f1f5f9", padding: "10px 16px", borderRadius: "12px", flex: 1, minWidth: "240px" }}>
            <FaSearch color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by courier name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px", color: "#0f172a" }}
            />
          </div>

          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", fontSize: "14px", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Modes (Surface & Air)</option>
            <option value="Surface">🚛 Surface Only</option>
            <option value="Air">✈️ Air Only</option>
          </select>

          <select
            value={rateTypeFilter}
            onChange={(e) => setRateTypeFilter(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#ffffff", fontSize: "14px", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Rate Types</option>
            <option value="CUSTOM">🎯 Custom Rates Only</option>
            <option value="STANDARD">📋 Standard Rates Only</option>
          </select>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "16px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            Loading your rate cards...
          </div>
        )}

        {error && (
          <div style={{ padding: "16px 20px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "14px", color: "#991b1b", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* RATE CARDS TABLE */}
        {!loading && !error && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "16px 20px" }}>Courier Partner</th>
                    <th style={{ padding: "16px 20px" }}>Mode</th>
                    <th style={{ padding: "16px 20px" }}>Pricing Type</th>
                    <th style={{ padding: "16px 20px" }}>Weight Slabs (Forward)</th>
                    <th style={{ padding: "16px 20px" }}>Zone Rates</th>
                    <th style={{ padding: "16px 20px" }}>COD Charge</th>
                    <th style={{ padding: "16px 20px" }}>Fuel & Taxes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRateCards.length > 0 ? (
                    filteredRateCards.map((card) => {
                      const courierName = card.courier?.name || card.courierPartner || "Courier";
                      const isCustom = card.pricingType === "MERCHANT" || !card.isDefault;
                      const fw = card.forwardRates || {};
                      const zn = card.zoneRates || {};

                      const isConfigured =
                        card.isActive !== false &&
                        card.enabled !== false &&
                        ((fw.rate500gm || 0) > 0 || (fw.rate1kg || 0) > 0 || (fw.rate2kg || 0) > 0);

                      return (
                        <tr key={card._id || `${courierName}_${card.serviceType}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {/* Courier Name & Logo */}
                          <td style={{ padding: "18px 20px", fontWeight: "700", color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {card.serviceType === "Air" ? (
                                <FaPlane color="#2563eb" size={16} />
                              ) : (
                                <FaTruck color="#ea580c" size={16} />
                              )}
                              <span>{courierName}</span>
                            </div>
                          </td>

                          {/* Mode */}
                          <td style={{ padding: "18px 20px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: card.serviceType === "Air" ? "#eff6ff" : "#fff7ed",
                                color: card.serviceType === "Air" ? "#1d4ed8" : "#c2410c",
                              }}
                            >
                              {card.serviceType || "Surface"}
                            </span>
                          </td>

                          {/* Pricing Type Badge */}
                          <td style={{ padding: "18px 20px" }}>
                            {!isConfigured ? (
                              <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: "#fef3c7", color: "#b45309" }}>
                                🚫 Not Configured
                              </span>
                            ) : isCustom ? (
                              <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: "#dcfce7", color: "#15803d" }}>
                                🎯 Custom Rate
                              </span>
                            ) : (
                              <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#f1f5f9", color: "#64748b" }}>
                                📋 Standard Rate
                              </span>
                            )}
                          </td>

                          {/* Forward Weight Slabs */}
                          <td style={{ padding: "18px 20px", color: "#334155" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span><strong>500g:</strong> ₹{fw.rate500gm || 0}</span>
                                <span><strong>1kg:</strong> ₹{fw.rate1kg || 0}</span>
                                <span><strong>2kg:</strong> ₹{fw.rate2kg || 0}</span>
                                {fw.rate5kg > 0 && <span><strong>5kg:</strong> ₹{fw.rate5kg}</span>}
                                <span><strong>Add'l kg:</strong> ₹{fw.additionalKg || 0}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Not Configured</span>
                            )}
                          </td>

                          {/* Zone Rates */}
                          <td style={{ padding: "18px 20px", color: "#334155" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span>🏙️ <strong>Local:</strong> ₹{zn.local || 0}</span>
                                <span>🗺️ <strong>Regional:</strong> ₹{zn.regional || 0}</span>
                                <span>🇮🇳 <strong>National:</strong> ₹{zn.national || 0}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Not Configured</span>
                            )}
                          </td>

                          {/* COD Charge */}
                          <td style={{ padding: "18px 20px", color: "#334155" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span><strong>Fixed:</strong> ₹{card.codCharge || 0}</span>
                                <span><strong>Percentage:</strong> {card.codPercentage || 0}%</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>

                          {/* Fuel & GST */}
                          <td style={{ padding: "18px 20px", color: "#334155" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span><strong>Fuel Fee:</strong> ₹{card.fuelCharge || 0}</span>
                                <span><strong>GST:</strong> {card.gst !== undefined ? card.gst : 18}%</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                        No Rate Cards match your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRateCard;
