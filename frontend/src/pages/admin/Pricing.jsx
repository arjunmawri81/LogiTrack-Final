import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import {
  FaRupeeSign,
  FaTruck,
  FaWeightHanging,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSync,
  FaBoxes,
} from "react-icons/fa";
import "./Pricing.css";

const Pricing = () => {
  const navigate = useNavigate();
  const [rateCards, setRateCards] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError("");

      const [rateCardsRes, couriersRes] = await Promise.allSettled([
        api.get("/ratecards/merchant/default"),
        api.get("/couriers/active/list"),
      ]);

      let cardsData = [];
      if (rateCardsRes.status === "fulfilled" && rateCardsRes.value.data?.success) {
        cardsData = rateCardsRes.value.data.rateCards || [];
      }

      let activeCouriers = [];
      if (couriersRes.status === "fulfilled" && couriersRes.value.data?.success) {
        activeCouriers = couriersRes.value.data.couriers || [];
      }
      setCouriers(activeCouriers);

      // Transform rate cards into individual slab pricing items for display
      const pricingList = [];

      if (cardsData.length > 0) {
        cardsData.forEach((card) => {
          const courierName = card.courier?.name || card.courierPartner || "Standard Courier";
          const courierCode = (card.courier?.code || courierName.substring(0, 2)).toUpperCase();
          const gstRate = card.gst || 18;

          const slabs = [
            { slab: "500 gm", base: card.forwardRates?.rate500gm || 40 },
            { slab: "1 Kg", base: card.forwardRates?.rate1kg || 60 },
            { slab: "2 Kg", base: card.forwardRates?.rate2kg || 95 },
            { slab: "3 Kg", base: card.forwardRates?.rate3kg || 135 },
            { slab: "5 Kg", base: card.forwardRates?.rate5kg || 210 },
          ];

          slabs.forEach((s) => {
            const gstAmount = Math.round((s.base * gstRate) / 100);
            const finalPrice = s.base + gstAmount;

            pricingList.push({
              id: `${card._id}_${s.slab}`,
              cardId: card._id,
              merchantId: card.merchantId || "default",
              courier: courierName,
              code: courierCode,
              serviceType: card.serviceType || "Surface",
              weightSlab: s.slab,
              basePrice: s.base,
              gst: gstRate,
              margin: gstAmount,
              finalPrice: finalPrice,
              odaCharge: card.odaCharge || 0,
              handlingCharge: card.handlingCharge || 0,
            });
          });
        });
      } else if (activeCouriers.length > 0) {
        // Fallback pricing generated from active couriers if ratecards not yet saved
        activeCouriers.forEach((courier) => {
          const baseRate = courier.baseRate || 45;
          const slabs = [
            { slab: "500 gm", base: baseRate },
            { slab: "1 Kg", base: Math.round(baseRate * 1.4) },
            { slab: "2 Kg", base: Math.round(baseRate * 2.2) },
          ];

          slabs.forEach((s) => {
            const margin = Math.round(s.base * 0.18);
            pricingList.push({
              id: `${courier._id}_${s.slab}`,
              cardId: courier._id,
              merchantId: "default",
              courier: courier.name,
              code: (courier.code || courier.name.substring(0, 2)).toUpperCase(),
              serviceType: "Surface",
              weightSlab: s.slab,
              basePrice: s.base,
              gst: 18,
              margin: margin,
              finalPrice: s.base + margin,
              odaCharge: 0,
              handlingCharge: 0,
            });
          });
        });
      }

      setRateCards(pricingList);
      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error("Failed to load pricing data:", err);
      setError("Failed to load pricing rates. Please try again.");
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtering
  const filteredPricing = rateCards.filter((item) => {
    const matchesSearch =
      item.courier.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());

    const matchesCourier =
      !courierFilter || item.courier.toLowerCase() === courierFilter.toLowerCase();

    const matchesWeight =
      !weightFilter || item.weightSlab.toLowerCase() === weightFilter.toLowerCase();

    return matchesSearch && matchesCourier && matchesWeight;
  });

  // Calculate Summary Stats
  const totalRules = rateCards.length;
  const uniqueCouriersCount = new Set(rateCards.map((item) => item.courier)).size || couriers.length;
  const uniqueSlabsCount = new Set(rateCards.map((item) => item.weightSlab)).size;
  const avgShippingCost =
    totalRules > 0
      ? Math.round(rateCards.reduce((acc, curr) => acc + curr.finalPrice, 0) / totalRules)
      : 0;

  // Get distinct list of couriers & weight slabs for dropdowns
  const availableCouriers = Array.from(new Set(rateCards.map((item) => item.courier)));
  const availableWeightSlabs = Array.from(new Set(rateCards.map((item) => item.weightSlab)));

  return (
    <div className="pricing-container">
      <AdminSidebar />
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <div className="pricing-header-left">
            <h1>Pricing & Rate Cards</h1>
            <p>Manage system default courier pricing rules, weight slabs, and shipping rates</p>
          </div>
          <div className="pricing-header-actions">
            <button
              onClick={() => fetchPricingData(true)}
              className="pricing-btn-secondary"
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? "revenue-refresh-btn-spin" : ""} size={13} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/admin/ratecard/default")}
              className="pricing-btn-primary"
            >
              <FaPlus size={13} /> Manage Default Rate Cards
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="pricing-stats-grid">
          <div className="pricing-stat-card">
            <div>
              <div className="pricing-stat-label">Total Pricing Rules</div>
              <h2 className="pricing-stat-value">{totalRules}</h2>
            </div>
            <div className="pricing-stat-icon" style={{ background: "#eff6ff" }}>
              <FaBoxes color="#2563eb" size={20} />
            </div>
          </div>

          <div className="pricing-stat-card">
            <div>
              <div className="pricing-stat-label">Courier Partners</div>
              <h2 className="pricing-stat-value">{uniqueCouriersCount}</h2>
            </div>
            <div className="pricing-stat-icon" style={{ background: "#fef3c7" }}>
              <FaTruck color="#d97706" size={20} />
            </div>
          </div>

          <div className="pricing-stat-card">
            <div>
              <div className="pricing-stat-label">Weight Slabs</div>
              <h2 className="pricing-stat-value">{uniqueSlabsCount}</h2>
            </div>
            <div className="pricing-stat-icon" style={{ background: "#dcfce7" }}>
              <FaWeightHanging color="#166534" size={20} />
            </div>
          </div>

          <div className="pricing-stat-card">
            <div>
              <div className="pricing-stat-label">Avg Shipping Rate</div>
              <h2 className="pricing-stat-value">₹{avgShippingCost}</h2>
            </div>
            <div className="pricing-stat-icon" style={{ background: "#fefce8" }}>
              <FaRupeeSign color="#ca8a04" size={20} />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="pricing-filter-container">
          <div className="pricing-search-wrapper">
            <FaSearch className="pricing-search-icon" />
            <input
              type="text"
              placeholder="Search courier name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pricing-search-input"
            />
          </div>

          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="pricing-filter-select"
          >
            <option value="">All Couriers</option>
            {availableCouriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
            className="pricing-filter-select"
          >
            <option value="">All Weight Slabs</option>
            {availableWeightSlabs.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Table */}
        <div className="pricing-table-container">
          <div className="pricing-table-wrapper">
            {loading ? (
              <div className="pricing-empty-state">Loading pricing rules...</div>
            ) : (
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th className="pricing-th">COURIER & SERVICE</th>
                    <th className="pricing-th">WEIGHT SLAB</th>
                    <th className="pricing-th">BASE PRICE</th>
                    <th className="pricing-th">GST / MARGIN</th>
                    <th className="pricing-th">FINAL PRICE</th>
                    <th className="pricing-th">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPricing.length > 0 ? (
                    filteredPricing.map((item) => (
                      <tr key={item.id}>
                        <td className="pricing-td">
                          <div className="pricing-courier-info">
                            <div className="pricing-courier-avatar">{item.code}</div>
                            <div>
                              <span className="pricing-courier-name">{item.courier}</span>
                              <span className="pricing-service-badge">{item.serviceType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="pricing-td">
                          <span className="pricing-weight-badge">{item.weightSlab}</span>
                        </td>
                        <td className="pricing-td">
                          <span className="pricing-price-cell">₹{item.basePrice}</span>
                        </td>
                        <td className="pricing-td">
                          <span className="pricing-margin-cell">+{item.gst}% (₹{item.margin})</span>
                        </td>
                        <td className="pricing-td">
                          <span className="pricing-final-price">₹{item.finalPrice}</span>
                        </td>
                        <td className="pricing-td">
                          <button
                            className="pricing-action-btn-edit"
                            onClick={() => navigate(`/admin/ratecard/${item.merchantId}`)}
                            title="Edit Rate Card"
                          >
                            <FaEdit size={12} /> Edit Rate Card
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="pricing-empty-state">
                        No pricing rules found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;