import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import {
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaCog,
  FaShieldAlt,
  FaKey,
  FaDatabase,
  FaBell,
  FaUserLock,
  FaGlobe,
  FaLanguage,
  FaPalette,
  FaPlug,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const Settings = () => {
  // Settings categories
  const settingsCategories = [
    {
      id: 1,
      name: "Email Settings",
      icon: <FaEnvelope />,
      description: "SMTP configuration and email templates",
      status: "Configured",
      color: "#3b82f6",
      bg: "#dbeafe"
    },
    {
      id: 2,
      name: "SMS Settings",
      icon: <FaSms />,
      description: "OTP and notification SMS provider setup",
      status: "Pending",
      color: "#f59e0b",
      bg: "#fef3c7"
    },
    {
      id: 3,
      name: "WhatsApp Settings",
      icon: <FaWhatsapp />,
      description: "WhatsApp Business API integration",
      status: "Configured",
      color: "#10b981",
      bg: "#dcfce7"
    },
    {
      id: 4,
      name: "General Settings",
      icon: <FaCog />,
      description: "Company name, logo and platform config",
      status: "Configured",
      color: "#8b5cf6",
      bg: "#ede9fe"
    },
    {
      id: 5,
      name: "Security Settings",
      icon: <FaShieldAlt />,
      description: "2FA, session management and access control",
      status: "Active",
      color: "#ef4444",
      bg: "#fee2e2"
    },
    {
      id: 6,
      name: "API Keys",
      icon: <FaKey />,
      description: "Manage courier and third-party API keys",
      status: "Active",
      color: "#06b6d4",
      bg: "#cffafe"
    },
    {
      id: 7,
      name: "Notification Settings",
      icon: <FaBell />,
      description: "Push notifications and alerts configuration",
      status: "Pending",
      color: "#ec4899",
      bg: "#fce7f3"
    },
    {
      id: 8,
      name: "Database Backup",
      icon: <FaDatabase />,
      description: "Automated backup and recovery settings",
      status: "Configured",
      color: "#14b8a6",
      bg: "#ccfbf1"
    },
    {
      id: 9,
      name: "Role Management",
      icon: <FaUserLock />,
      description: "User roles, permissions and access levels",
      status: "Active",
      color: "#eab308",
      bg: "#fef9c3"
    },
    {
      id: 10,
      name: "Regional Settings",
      icon: <FaGlobe />,
      description: "Timezone, currency and localization",
      status: "Pending",
      color: "#a855f7",
      bg: "#f3e8ff"
    },
    {
      id: 11,
      name: "Language Settings",
      icon: <FaLanguage />,
      description: "Multi-language support configuration",
      status: "Pending",
      color: "#ec4899",
      bg: "#fce7f3"
    },
    {
      id: 12,
      name: "Appearance",
      icon: <FaPalette />,
      description: "Theme, branding and UI customization",
      status: "Configured",
      color: "#06b6d4",
      bg: "#cffafe"
    },
  ];

  // Stats data
  const stats = [
    { label: "Email Services", value: 3, icon: <FaEnvelope />, color: "#3b82f6", bg: "#dbeafe" },
    { label: "SMS Providers", value: 2, icon: <FaSms />, color: "#10b981", bg: "#dcfce7" },
    { label: "WhatsApp APIs", value: 1, icon: <FaWhatsapp />, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Security Status", value: "100%", icon: <FaShieldAlt />, color: "#ef4444", bg: "#fee2e2" },
  ];

  // Inline styles
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
      background: "linear-gradient(135deg, #475569, #334155)",
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
      marginBottom: "25px"
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
    // Settings Grid
    settingsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "24px",
      marginBottom: "30px"
    },
    settingsCard: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      position: "relative"
    },
    settingsIconWrapper: {
      width: "56px",
      height: "56px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px"
    },
    settingsIcon: {
      fontSize: "28px"
    },
    settingsName: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    settingsDescription: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0 0 16px 0",
      lineHeight: "1.5"
    },
    settingsFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "12px",
      paddingTop: "12px",
      borderTop: "1px solid #f1f5f9"
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "30px",
      fontSize: "11px",
      fontWeight: "600"
    },
    configBtn: {
      background: "#f1f5f9",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      color: "#475569",
      transition: "all 0.2s"
    },
    // Security Status Section
    securityBox: {
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid #eef2f6",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    securityTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 20px 0",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    securityGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px"
    },
    securityItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      background: "#f8fafc",
      borderRadius: "12px"
    },
    securityCheck: {
      width: "32px",
      height: "32px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Configured" || status === "Active") {
      return { ...styles.statusBadge, background: "#dcfce7", color: "#166534" };
    }
    if (status === "Pending") {
      return { ...styles.statusBadge, background: "#fef3c7", color: "#92400e" };
    }
    return { ...styles.statusBadge, background: "#fee2e2", color: "#991b1b" };
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>⚙️ Platform Settings</h1>
          <p style={styles.welcomeSubtitle}>
            Configure platform integrations, security settings and system preferences
          </p>
        </div>

        {/* Header */}
        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>System Configuration</h1>
          <p style={styles.headerSubtitle}>Configure platform integrations and security settings</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div style={styles.statCard} key={index}>
              <div style={styles.statInfo}>
                <div style={styles.statLabel}>{stat.label}</div>
                <h2 style={styles.statValue}>{stat.value}</h2>
              </div>
              <div style={{ ...styles.statIconWrapper, background: stat.bg }}>
                <div style={{ color: stat.color, fontSize: "22px" }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Settings Cards Grid */}
        <div style={styles.settingsGrid}>
          {settingsCategories.map((setting) => (
            <div style={styles.settingsCard} key={setting.id}>
              <div style={{ ...styles.settingsIconWrapper, background: setting.bg, color: setting.color }}>
                <div style={styles.settingsIcon}>{setting.icon}</div>
              </div>
              <h3 style={styles.settingsName}>{setting.name}</h3>
              <p style={styles.settingsDescription}>{setting.description}</p>
              <div style={styles.settingsFooter}>
                <span style={getStatusStyle(setting.status)}>{setting.status}</span>
                <button style={styles.configBtn}>Configure</button>
              </div>
            </div>
          ))}
        </div>

        {/* Security Status Section */}
        <div style={styles.securityBox}>
          <div style={styles.securityTitle}>
            <FaShieldAlt size={20} color="#3b82f6" />
            Security Status
          </div>
          <div style={styles.securityGrid}>
            <div style={styles.securityItem}>
              <div style={{ ...styles.securityCheck, background: "#dcfce7" }}>
                <FaCheckCircle size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>2FA Status</div>
                <div style={{ fontWeight: "600", color: "#0f172a" }}>Enabled</div>
              </div>
            </div>
            <div style={styles.securityItem}>
              <div style={{ ...styles.securityCheck, background: "#dcfce7" }}>
                <FaCheckCircle size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>SSL Certificate</div>
                <div style={{ fontWeight: "600", color: "#0f172a" }}>Valid</div>
              </div>
            </div>
            <div style={styles.securityItem}>
              <div style={{ ...styles.securityCheck, background: "#fef3c7" }}>
                <FaExclamationTriangle size={16} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Backup Status</div>
                <div style={{ fontWeight: "600", color: "#0f172a" }}>Last backup: 2 days ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div style={{ ...styles.securityBox, marginTop: "24px" }}>
          <div style={styles.securityTitle}>
            <FaKey size={20} color="#f59e0b" />
            Active API Integrations
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ background: "#f8fafc", padding: "12px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPlug size={14} color="#3b82f6" />
              <span style={{ fontWeight: "500" }}>DTDC API</span>
              <span style={{ ...styles.statusBadge, background: "#dcfce7", color: "#166534" }}>Connected</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "12px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPlug size={14} color="#3b82f6" />
              <span style={{ fontWeight: "500" }}>Delhivery API</span>
              <span style={{ ...styles.statusBadge, background: "#dcfce7", color: "#166534" }}>Connected</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "12px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPlug size={14} color="#ef4444" />
              <span style={{ fontWeight: "500" }}>Blue Dart API</span>
              <span style={{ ...styles.statusBadge, background: "#fee2e2", color: "#991b1b" }}>Disconnected</span>
            </div>
            <div style={{ background: "#f8fafc", padding: "12px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPlug size={14} color="#3b82f6" />
              <span style={{ fontWeight: "500" }}>XpressBees API</span>
              <span style={{ ...styles.statusBadge, background: "#dcfce7", color: "#166534" }}>Connected</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;