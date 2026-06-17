import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  FaRupeeSign,
  FaPercentage,
  FaTruck,
  FaWeightHanging,
  FaEdit,
  FaPlus,
  FaTrash,
  FaSearch,
} from "react-icons/fa";

const Pricing = () => {
  // Pricing data
  const pricingData = [
    { courier: "DTDC", code: "DT", weightSlab: "500 gm", basePrice: 40, margin: 5, finalPrice: 45 },
    { courier: "Delhivery", code: "DL", weightSlab: "1 Kg", basePrice: 57, margin: 8, finalPrice: 65 },
    { courier: "Blue Dart", code: "BD", weightSlab: "2 Kg", basePrice: 95, margin: 10, finalPrice: 105 },
    { courier: "XpressBees", code: "XB", weightSlab: "500 gm", basePrice: 38, margin: 6, finalPrice: 44 },
    { courier: "Ecom Express", code: "EE", weightSlab: "1 Kg", basePrice: 52, margin: 7, finalPrice: 59 },
    { courier: "Shadowfax", code: "SF", weightSlab: "2 Kg", basePrice: 88, margin: 9, finalPrice: 97 },
  ];

  // Updated styles matching admin theme
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    mainContent: {
      flex: 1,
      marginLeft: "280px",
      padding: "20px 30px",
      overflowX: "auto"
    },
    // Header Section - Simple like Orders page
    headerBlock: {
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "white",
      padding: "20px 24px",
      borderRadius: "12px",
      border: "1px solid #eef2f6"
    },
    headerLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    },
    headerTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    headerSubtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: 0
    },
    addButton: {
      background: "#3b82f6",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    // Stats Cards - White with blue accents
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "25px"
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #eef2f6",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer"
    },
    statInfo: {
      flex: 1
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: "8px",
      letterSpacing: "0.5px"
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0f172a",
      margin: 0
    },
    statIconWrapper: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    // Search + Filters Row - White card
    filterContainer: {
      background: "white",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid #eef2f6",
      marginBottom: "25px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap"
    },
    searchWrapper: {
      flex: 1,
      minWidth: "200px",
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      color: "#94a3b8",
      fontSize: "14px"
    },
    searchInput: {
      width: "100%",
      padding: "10px 12px 10px 38px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#334155",
      background: "#f8fafc",
      transition: "all 0.2s",
      outline: "none"
    },
    filterGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    filterSelect: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      fontSize: "13px",
      color: "#334155",
      outline: "none",
      minWidth: "150px",
      cursor: "pointer"
    },
    // Table Container - White background
    tableContainer: {
      background: "white",
      borderRadius: "12px",
      border: "1px solid #eef2f6",
      overflow: "hidden"
    },
    tableWrapper: {
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white"
    },
    th: {
      textAlign: "left",
      padding: "14px 20px",
      background: "#f8fafc",
      color: "#475569",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "16px 20px",
      borderBottom: "1px solid #f1f5f9",
      color: "#1e293b",
      fontSize: "14px",
      background: "white"
    },
    courierInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    courierAvatar: {
      width: "38px",
      height: "38px",
      background: "#3b82f6",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "11px",
      fontWeight: "700"
    },
    courierName: {
      fontWeight: "600",
      color: "#0f172a"
    },
    priceCell: {
      fontWeight: "600",
      color: "#0f172a"
    },
    marginCell: {
      fontWeight: "600",
      color: "#10b981"
    },
    finalPriceCell: {
      fontWeight: "700",
      color: "#3b82f6",
      fontSize: "15px"
    },
    weightBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      background: "#f1f5f9",
      color: "#475569"
    },
    actionGroup: {
      display: "flex",
      gap: "6px"
    },
    actionBtn: {
      background: "white",
      border: "1px solid #e2e8f0",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#64748b",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px"
    },
    actionBtnEdit: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#3b82f6",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px"
    },
    actionBtnDelete: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#ef4444",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px"
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Header Section - Simple like Orders page */}
        <div style={styles.headerBlock}>
          <div style={styles.headerLeft}>
            <h1 style={styles.headerTitle}>Pricing Management</h1>
            <p style={styles.headerSubtitle}>Manage courier pricing rules and shipping rates</p>
          </div>
          <button style={styles.addButton}>
            <FaPlus size={14} /> Add Pricing Rule
          </button>
        </div>

        {/* Stats Cards - Updated labels */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Total Pricing Rules</div>
              <h2 style={styles.statValue}>24</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#eff6ff" }}>
              <FaTruck color="#3b82f6" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Courier Partners</div>
              <h2 style={styles.statValue}>8</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaTruck color="#f59e0b" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Weight Slabs</div>
              <h2 style={styles.statValue}>24</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#f0fdf4" }}>
              <FaWeightHanging color="#22c55e" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Average Shipping Cost</div>
              <h2 style={styles.statValue}>₹58</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fefce8" }}>
              <FaRupeeSign color="#eab308" size={22} />
            </div>
          </div>
        </div>

        {/* Search + Filters Row */}
        <div style={styles.filterContainer}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search courier..."
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect}>
              <option value="">All Couriers</option>
              <option>DTDC</option>
              <option>Delhivery</option>
              <option>Blue Dart</option>
              <option>XpressBees</option>
              <option>Ecom Express</option>
              <option>Shadowfax</option>
            </select>
            <select style={styles.filterSelect}>
              <option value="">All Weight Slabs</option>
              <option>500 gm</option>
              <option>1 Kg</option>
              <option>2 Kg</option>
              <option>3 Kg</option>
              <option>5 Kg</option>
            </select>
          </div>
        </div>

        {/* Pricing Table - White background */}
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>COURIER</th>
                  <th style={styles.th}>WEIGHT SLAB</th>
                  <th style={styles.th}>BASE PRICE</th>
                  <th style={styles.th}>MARGIN</th>
                  <th style={styles.th}>FINAL PRICE</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      <div style={styles.courierInfo}>
                        <div style={styles.courierAvatar}>
                          {item.code}
                        </div>
                        <span style={styles.courierName}>{item.courier}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.weightBadge}>{item.weightSlab}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priceCell}>₹{item.basePrice}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.marginCell}>+₹{item.margin}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.finalPriceCell}>₹{item.finalPrice}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button style={styles.actionBtnEdit} title="Edit">
                          <FaEdit size={13} /> Edit
                        </button>
                        <button style={styles.actionBtnDelete} title="Delete">
                          <FaTrash size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;