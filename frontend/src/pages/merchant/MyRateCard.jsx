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
    <div className="rate-container merchant-page-container" style={{ display: "flex", minHeight: "100vh", background: "#111827", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* SIDEBAR WRAPPER */}
      <div className="rate-sidebar merchant-sidebar-container" style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="rate-content merchant-main-container" style={{ flex: 1, padding: "30px 36px", overflowX: "hidden", minWidth: 0 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FaTags color="#f97316" size={22} /> My Rate Cards & Pricing
            </h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "4px 0 0" }}>
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
              background: "#1c2333",
              border: "1px solid #2a3a52",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#a0aec0",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            <FaSync className={loading ? "spin-icon" : ""} size={12} /> Refresh Rates
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#1c2333", borderRadius: "12px", padding: "18px 20px", border: "1px solid #2a3a52", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#8896b0", textTransform: "uppercase" }}>Total Couriers</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#f1f5f9", margin: "6px 0 0" }}>{rateCards.length}</h2>
            <p style={{ fontSize: "12px", color: "#8896b0", margin: "4px 0 0" }}>Active courier partnerships</p>
          </div>

          <div style={{ background: "#1c2333", borderRadius: "12px", padding: "18px 20px", border: "1px solid #2a3a52", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#4ade80", textTransform: "uppercase" }}>Custom Rates</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#4ade80", margin: "6px 0 0" }}>{customCount}</h2>
            <p style={{ fontSize: "12px", color: "#4ade80", margin: "4px 0 0" }}>Discounted merchant plans</p>
          </div>

          <div style={{ background: "#1c2333", borderRadius: "12px", padding: "18px 20px", border: "1px solid #2a3a52", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#8896b0", textTransform: "uppercase" }}>Standard Rates</span>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#f1f5f9", margin: "6px 0 0" }}>{standardCount}</h2>
            <p style={{ fontSize: "12px", color: "#8896b0", margin: "4px 0 0" }}>Baseline rate cards</p>
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div style={{ background: "#1c2333", padding: "14px 18px", borderRadius: "12px", border: "1px solid #2a3a52", marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#151c2c", padding: "8px 14px", borderRadius: "8px", border: "1px solid #2a3a52", flex: 1, minWidth: "240px" }}>
            <FaSearch color="#4f6080" size={13} />
            <input
              type="text"
              placeholder="Search courier name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#e8edf5" }}
            />
          </div>

          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #2a3a52", background: "#151c2c", fontSize: "13px", color: "#e8edf5", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Modes (Surface & Air)</option>
            <option value="Surface">Surface Only</option>
            <option value="Air">Air Only</option>
          </select>

          <select
            value={rateTypeFilter}
            onChange={(e) => setRateTypeFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #2a3a52", background: "#151c2c", fontSize: "13px", color: "#e8edf5", outline: "none", cursor: "pointer" }}
          >
            <option value="ALL">All Rate Types</option>
            <option value="CUSTOM">Custom Rates Only</option>
            <option value="STANDARD">Standard Rates Only</option>
          </select>
        </div>

        {/* LOADING & ERROR */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#8896b0", fontSize: "14px", background: "#1c2333", borderRadius: "12px", border: "1px solid #2a3a52" }}>
            Loading rate cards...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", color: "#f87171", fontSize: "14px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* ORIGINAL RATE CARDS TABLE */}
        {!loading && !error && (
          <div style={{ background: "#1c2333", borderRadius: "12px", border: "1px solid #2a3a52", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px", background: "#1c2333" }}>
                <thead>
                  <tr style={{ background: "#1e2640", borderBottom: "1px solid #2a3a52", color: "#8896b0", fontWeight: "600" }}>
                    <th style={{ padding: "14px 18px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Courier Partner</th>
                    <th style={{ padding: "14px 16px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Mode</th>
                    <th style={{ padding: "14px 16px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Pricing Type</th>
                    <th style={{ padding: "14px 16px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Weight Slabs (Forward)</th>
                    <th style={{ padding: "14px 16px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Zone Rates</th>
                    <th style={{ padding: "14px 16px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>COD Charge</th>
                    <th style={{ padding: "14px 18px", background: "#1e2640", color: "#8896b0", borderBottom: "1px solid #2a3a52" }}>Fuel &amp; Taxes</th>
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
                        <tr key={card._id || `${courierName}_${card.serviceType}`} style={{ background: "#1c2333", borderBottom: "1px solid #1e2a3a", verticalAlign: "top" }}>
                          {/* Courier Name */}
                          <td style={{ padding: "16px 18px", fontWeight: "700", color: "#f1f5f9", background: "#1c2333" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                              {card.serviceType === "Air" ? (
                                <FaPlane color="#60a5fa" size={14} />
                              ) : (
                                <FaTruck color="#f97316" size={14} />
                              )}
                              <span>{courierName}</span>
                            </div>
                          </td>

                          {/* Mode */}
                          <td style={{ padding: "16px 16px", background: "#1c2333" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: card.serviceType === "Air" ? "rgba(59,130,246,0.15)" : "rgba(249,115,22,0.15)",
                                color: card.serviceType === "Air" ? "#60a5fa" : "#f97316",
                                display: "inline-block",
                                marginTop: "2px"
                              }}
                            >
                              {card.serviceType || "Surface"}
                            </span>
                          </td>

                          {/* Pricing Type Badge */}
                          <td style={{ padding: "16px 16px", background: "#1c2333" }}>
                            {!isConfigured ? (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "rgba(234,179,8,0.15)", color: "#facc15", display: "inline-block", marginTop: "2px" }}>
                                Not Configured
                              </span>
                            ) : isCustom ? (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "rgba(34,197,94,0.15)", color: "#4ade80", display: "inline-block", marginTop: "2px" }}>
                                Custom Rate
                              </span>
                            ) : (
                              <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "#1a2235", color: "#8896b0", display: "inline-block", marginTop: "2px" }}>
                                Standard Rate
                              </span>
                            )}
                          </td>

                          {/* Weight Slabs */}
                          <td style={{ padding: "16px 16px", color: "#a0aec0", background: "#1c2333" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div>0.5 kg: <strong style={{ color: "#f1f5f9" }}>₹{fw.rate500gm || 0}</strong></div>
                              <div>1.0 kg: <strong style={{ color: "#f1f5f9" }}>₹{fw.rate1kg || 0}</strong></div>
                              <div>2.0 kg: <strong style={{ color: "#f1f5f9" }}>₹{fw.rate2kg || 0}</strong></div>
                              <div style={{ fontSize: "11px", color: "#8896b0" }}>
                                Add. 0.5kg: ₹{fw.additional500gm || 0}
                              </div>
                            </div>
                          </td>

                          {/* Zone Rates */}
                          <td style={{ padding: "16px 16px", color: "#a0aec0", background: "#1c2333" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div>Intra-City: <strong style={{ color: "#f1f5f9" }}>₹{zn.withinCity || 0}</strong></div>
                              <div>Intra-State: <strong style={{ color: "#f1f5f9" }}>₹{zn.withinState || 0}</strong></div>
                              <div>Metro: <strong style={{ color: "#f1f5f9" }}>₹{zn.metro || 0}</strong></div>
                              <div>Rest of India: <strong style={{ color: "#f1f5f9" }}>₹{zn.restOfIndia || 0}</strong></div>
                            </div>
                          </td>

                          {/* COD Charge */}
                          <td style={{ padding: "16px 16px", color: "#f1f5f9", fontWeight: "600", background: "#1c2333" }}>
                            ₹{card.codCharge || 0}
                            <span style={{ fontSize: "11px", fontWeight: "400", color: "#8896b0", display: "block" }}>
                              or {card.codPercent || 0}%
                            </span>
                          </td>

                          {/* Fuel & Taxes */}
                          <td style={{ padding: "16px 18px", color: "#a0aec0", background: "#1c2333" }}>
                            <div>Fuel Surcharge: <strong style={{ color: "#f1f5f9" }}>{card.fuelSurcharge || 0}%</strong></div>
                            <div>GST Rate: <strong style={{ color: "#f1f5f9" }}>{card.gstRate || 18}%</strong></div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#8896b0", background: "#1c2333" }}>
                        No matching rate cards found.
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
