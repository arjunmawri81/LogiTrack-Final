import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";
import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaUserClock,
  FaEye,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const totalAdmins = users.filter(
    (user) => user.role === "ADMIN" || user.role === "SUPER_ADMIN"
  ).length;

  const totalMerchants = users.filter(
    (user) => user.role === "MERCHANT"
  ).length;

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inline styles matching Dashboard with WHITE TABLE
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
    headerBlock: {
      marginBottom: "30px"
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 8px 0"
    },
    headerSubtitle: {
      fontSize: "14px",
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
      borderLeft: "4px solid",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      transition: "transform 0.2s, box-shadow 0.2s"
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
    searchBox: {
      display: "flex",
      alignItems: "center",
      background: "white",
      padding: "12px 20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "25px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      marginLeft: "12px",
      fontSize: "14px",
      background: "transparent"
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
      background: "white"
    },
    tableTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0
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
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    avatar: {
      width: "40px",
      height: "40px",
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "14px",
      fontWeight: "700"
    },
    userName: {
      fontWeight: "600",
      color: "#0f172a"
    },
    emailText: {
      color: "#64748b"
    },
    roleBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600"
    },
    statusBadge: {
      display: "inline-block",
      padding: "5px 14px",
      borderRadius: "30px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#dcfce7",
      color: "#166534"
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
    },
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#94a3b8",
      fontSize: "14px"
    }
  };

  const getRoleStyle = (role) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return { ...styles.roleBadge, background: "#dbeafe", color: "#1e40af" };
    }
    if (role === "MERCHANT") {
      return { ...styles.roleBadge, background: "#dcfce7", color: "#166534" };
    }
    return { ...styles.roleBadge, background: "#f1f5f9", color: "#475569" };
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminTopbar />

        <div style={styles.headerBlock}>
          <h1 style={styles.headerTitle}>👥 Users Management</h1>
          <p style={styles.headerSubtitle}>Manage platform users, admins and merchants</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeftColor: "#3b82f6" }}>
            <div style={styles.statLabel}>Total Users</div>
            <h2 style={styles.statValue}>{users.length}</h2>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: "#10b981" }}>
            <div style={styles.statLabel}>Admins</div>
            <h2 style={styles.statValue}>{totalAdmins}</h2>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: "#f59e0b" }}>
            <div style={styles.statLabel}>Merchants</div>
            <h2 style={styles.statValue}>{totalMerchants}</h2>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: "#ef4444" }}>
            <div style={styles.statLabel}>Pending Users</div>
            <h2 style={styles.statValue}>0</h2>
          </div>
        </div>

        {/* Search Box */}
        <div style={styles.searchBox}>
          <FaSearch color="#94a3b8" size={16} />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Users Table - WHITE BACKGROUND */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>User List</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>EMAIL</th>
                  <th style={styles.th}>ROLE</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td style={styles.td}>
                        <div style={styles.userInfo}>
                          <div style={styles.avatar}>
                            {user.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={styles.userName}>{user.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.emailText}>{user.email}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={getRoleStyle(user.role)}>{user.role}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>Active</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button style={styles.actionBtn} title="View">
                            <FaEye size={13} />
                          </button>
                          <button style={styles.actionBtn} title="Edit">
                            <FaEdit size={13} />
                          </button>
                          <button style={styles.actionBtn} title="Delete">
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      No Users Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;