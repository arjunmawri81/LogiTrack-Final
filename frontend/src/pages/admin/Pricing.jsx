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

  // Inline styles matching Dashboard
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
    welcomeSection: {
      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
      borderRadius: "20px",
      padding: "24px 30px",
      marginBottom: "30px",
      color: "white"
    },
    welcomeTitle: {
      fontSize: "24px",
      fontWeight: "700",
      margin: "0 0 8px 0"
    },
    welcomeSubtitle: {
      fontSize: "14px",
      opacity: 0.9,
      margin: 0
    },
    headerBlock: {
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    headerTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 6px 0"
    },
    headerSubtitle: {
      fontSize: "13px",
      color: "#64748b",
      margin: 0
    },
    addButton: {
      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "transform 0.2s"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginBottom: "30px"
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
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
    // Performance/Margin Section
    marginBox: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "30px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    marginTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0"
    },
    progressItem: {
      marginBottom: "20px"
    },
    progressHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#334155"
    },
    progressBar: {
      background: "#f1f5f9",
      height: "8px",
      borderRadius: "99px",
      overflow: "hidden"
    },
    progressFill: {
      background: "linear-gradient(90deg, #7c3aed, #5b21b6)",
      height: "100%",
      borderRadius: "99px",
      transition: "width 0.3s ease"
    },
    // Table Section - WHITE BACKGROUND
    tableContainer: {
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #eef2f6"
    },
    tableHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #eef2f6",
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    tableTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
    },
    filterGroup: {
      display: "flex",
      gap: "10px"
    },
    filterSelect: {
      padding: "8px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "13px",
      color: "#334155"
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
      padding: "16px 20px",
      background: "#f8fafc",
      color: "#475569",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #eef2f6"
    },
    td: {
      padding: "18px 20px",
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
      width: "40px",
      height: "40px",
      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "12px",
      fontWeight: "700"
    },
    courierName: {
      fontWeight: "600",
      color: "#0f172a"
    },
    priceCell: {
      fontWeight: "700",
      color: "#0f172a"
    },
    marginCell: {
      fontWeight: "600",
      color: "#10b981"
    },
    finalPriceCell: {
      fontWeight: "800",
      color: "#7c3aed",
      fontSize: "16px"
    },
    weightBadge: {
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#f1f5f9",
      color: "#475569"
    },
    actionGroup: {
      display: "flex",
      gap: "8px"
    },
    actionBtn: {
      background: "white",
      border: "1px solid #e2e8f0",
      padding: "8px 12px",
      borderRadius: "10px",
      cursor: "pointer",
      color: "#64748b",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>💰 Pricing Management</h1>
          <p style={styles.welcomeSubtitle}>
            Manage courier rates, margins and shipping slabs across all partners
          </p>
        </div>

        {/* Header with Add Button */}
        <div style={styles.headerBlock}>
          <div>
            <h1 style={styles.headerTitle}>💲 Pricing Management</h1>
            <p style={styles.headerSubtitle}>Manage courier rates, margins and shipping slabs</p>
          </div>
          <button style={styles.addButton}>
            <FaPlus size={14} /> Add Pricing Rule
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Courier Partners</div>
              <h2 style={styles.statValue}>8</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dbeafe" }}>
              <FaTruck color="#3b82f6" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Weight Slabs</div>
              <h2 style={styles.statValue}>24</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fef3c7" }}>
              <FaWeightHanging color="#f59e0b" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Avg Shipping Rate</div>
              <h2 style={styles.statValue}>₹58</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#dcfce7" }}>
              <FaRupeeSign color="#10b981" size={22} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statInfo}>
              <div style={styles.statLabel}>Avg Margin</div>
              <h2 style={styles.statValue}>12%</h2>
            </div>
            <div style={{ ...styles.statIconWrapper, background: "#fee2e2" }}>
              <FaPercentage color="#ef4444" size={22} />
            </div>
          </div>
        </div>

        {/* Margin Overview Section */}
        <div style={styles.marginBox}>
          <h2 style={styles.marginTitle}>📈 Margin Overview</h2>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>DTDC Margin Usage</span>
              <span>78%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "78%" }} />
            </div>
          </div>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>Delhivery Margin Usage</span>
              <span>91%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "91%" }} />
            </div>
          </div>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>Blue Dart Margin Usage</span>
              <span>65%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "65%" }} />
            </div>
          </div>
          <div style={styles.progressItem}>
            <div style={styles.progressHeader}>
              <span>XpressBees Margin Usage</span>
              <span>82%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: "82%" }} />
            </div>
          </div>
        </div>

        {/* Pricing Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Courier Pricing Matrix</h3>
            <div style={styles.filterGroup}>
              <select style={styles.filterSelect}>
                <option>All Couriers</option>
                <option>DTDC</option>
                <option>Delhivery</option>
                <option>Blue Dart</option>
                <option>XpressBees</option>
              </select>
              <select style={styles.filterSelect}>
                <option>All Weight Slabs</option>
                <option>500 gm</option>
                <option>1 Kg</option>
                <option>2 Kg</option>
              </select>
            </div>
          </div>
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
                        <button style={styles.actionBtn} title="Edit">
                          <FaEdit size={13} />
                        </button>
                        <button style={styles.actionBtn} title="Delete">
                          <FaTrash size={13} />
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