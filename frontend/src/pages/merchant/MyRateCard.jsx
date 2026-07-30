import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import {
  FaTruck,
  FaPlane,
  FaSearch,
  FaSync,
  FaTags,
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* SIDEBAR WRAPPER */}
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "30px 36px", overflowX: "hidden", minWidth: 0 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FaTags color="#2563eb" size={22} /> My Rate Cards & Pricing
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              View your contracted courier shipping rates, weight slabs, and zone pricing
            </p>
          </div>

          <button
            onClick={fetchMyRateCards}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <FaSync className={loading ? "spin-icon" : ""} size={12} /> Refresh Rates
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Total Couriers</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "6px 0 0" }}>{rateCards.length}</h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Active courier partnerships</p>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#16a34a", textTransform: "uppercase" }}>Custom Rates</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#15803d", margin: "6px 0 0" }}>{customCount}</h2>
            <p style={{ fontSize: "12px", color: "#16a34a", margin: "4px 0 0" }}>Discounted merchant plans</p>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Standard Rates</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#334155", margin: "6px 0 0" }}>{standardCount}</h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>Baseline rate cards</p>
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", flex: 1, minWidth: "240px" }}>
            <FaSearch color="#94a3b8" size={13} />
            <input
              type="text"
              placeholder="Search courier name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#0f172a" }}
            />
          </div>

          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Modes (Surface & Air)</option>
            <option value="Surface">Surface Only</option>
            <option value="Air">Air Only</option>
          </select>

          <select
            value={rateTypeFilter}
            onChange={(e) => setRateTypeFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Rate Types</option>
            <option value="CUSTOM">Custom Rates Only</option>
            <option value="STANDARD">Standard Rates Only</option>
          </select>
        </div>

        {/* LOADING & ERROR */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "14px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            Loading rate cards...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", color: "#991b1b", fontSize: "14px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* ORIGINAL RATE CARDS TABLE */}
        {!loading && !error && (
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "600" }}>
                    <th style={{ padding: "14px 18px" }}>Courier Partner</th>
                    <th style={{ padding: "14px 16px" }}>Mode</th>
                    <th style={{ padding: "14px 16px" }}>Pricing Type</th>
                    <th style={{ padding: "14px 16px" }}>Weight Slabs (Forward)</th>
                    <th style={{ padding: "14px 16px" }}>Zone Rates</th>
                    <th style={{ padding: "14px 16px" }}>COD Charge</th>
                    <th style={{ padding: "14px 18px" }}>Fuel & Taxes</th>
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
                        <tr key={card._id || `${courierName}_${card.serviceType}`} style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "top" }}>
                          {/* Courier Name */}
                          <td style={{ padding: "16px 18px", fontWeight: "700", color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                              {card.serviceType === "Air" ? (
                                <FaPlane color="#2563eb" size={14} />
                              ) : (
                                <FaTruck color="#ea580c" size={14} />
                              )}
                              <span>{courierName}</span>
                            </div>
                          </td>

                          {/* Mode */}
                          <td style={{ padding: "16px 16px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: card.serviceType === "Air" ? "#eff6ff" : "#fff7ed",
                                color: card.serviceType === "Air" ? "#1d4ed8" : "#c2410c",
                                display: "inline-block",
                                marginTop: "2px"
                              }}
                            >
                              {card.serviceType || "Surface"}
                            </span>
                          </td>

                          {/* Pricing Type Badge */}
                          <td style={{ padding: "16px 16px" }}>
                            {!isConfigured ? (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "#fef3c7", color: "#b45309", display: "inline-block", marginTop: "2px" }}>
                                Not Configured
                              </span>
                            ) : isCustom ? (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "#dcfce7", color: "#15803d", display: "inline-block", marginTop: "2px" }}>
                                Custom Rate
                              </span>
                            ) : (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "#f1f5f9", color: "#64748b", display: "inline-block", marginTop: "2px" }}>
                                Standard Rate
                              </span>
                            )}
                          </td>

                          {/* Forward Weight Slabs */}
                          <td style={{ padding: "16px 16px", minWidth: "140px" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span><strong>500g:</strong> ₹{fw.rate500gm || 0}</span>
                                <span><strong>1kg:</strong> ₹{fw.rate1kg || 0}</span>
                                <span><strong>2kg:</strong> ₹{fw.rate2kg || 0}</span>
                                {fw.rate5kg > 0 && <span><strong>5kg:</strong> ₹{fw.rate5kg}</span>}
                                <span><strong>Add'l:</strong> ₹{fw.additionalKg || 0} / kg</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>

                          {/* Zone Rates */}
                          <td style={{ padding: "16px 16px", minWidth: "120px" }}>
                            {isConfigured ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span><strong>Local:</strong> ₹{zn.local || 0}</span>
                                <span><strong>Regional:</strong> ₹{zn.regional || 0}</span>
                                <span><strong>National:</strong> ₹{zn.national || 0}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>

                          {/* COD Charge */}
                          <td style={{ padding: "16px 16px", minWidth: "120px" }}>
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
                          <td style={{ padding: "16px 18px", minWidth: "120px" }}>
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MyRateCard;
