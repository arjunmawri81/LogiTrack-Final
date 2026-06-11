import SuperAdminLayout from "./SuperAdminLayout";

const AuditLogs = () => {
  const logs = [
    {
      user: "Super Admin",
      action: "Created Admin",
      date: "Today",
    },
    {
      user: "Admin",
      action: "Deleted Order",
      date: "Yesterday",
    },
    {
      user: "Admin",
      action: "Approved Merchant",
      date: "2 Days Ago",
    },
    {
      user: "Super Admin",
      action: "Updated Commission",
      date: "3 Days Ago",
    },
  ];

  // Helper utility function to determine color tone matching action type severity
  const getActionBadgeStyle = (action) => {
    const act = action.toLowerCase();
    if (act.includes("delete") || act.includes("remove")) {
      return { bg: "#fee2e2", text: "#991b1b" }; // Red
    }
    if (act.includes("create") || act.includes("approve")) {
      return { bg: "#dcfce7", text: "#166534" }; // Green
    }
    return { bg: "#f1f5f9", text: "#334155" }; // Neutral Charcoal Tint
  };

  // Base font framework rule across all page elements
  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  return (
    <SuperAdminLayout>
      <div style={{ ...fontStyle, maxWidth: "1400px", margin: "0 auto", padding: "10px" }}>
        
        {/* HEADER SECTION */}
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 6px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Audit Logs
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Monitor platform activities and administrator actions
          </p>
        </div>

        {/* PERFORMANCE STATS METRIC CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* TOTAL SYSTEM EVENTS CONTROL */}
          <div style={cardBlue}>
            <div style={{ ...cardLabel, color: "#93c5fd" }}>
              Total Activities
            </div>
            <div style={cardValue}>
              {logs.length}
            </div>
          </div>

          {/* PRIVILEGED ADMIN ACTIONS TRACKER */}
          <div style={cardGreen}>
            <div style={{ ...cardLabel, color: "#a7f3d0" }}>
              Admin Actions
            </div>
            <div style={cardValue}>
              3
            </div>
          </div>

          {/* HISTORICAL ROLLING DELTA CARD */}
          <div style={cardOrange}>
            <div style={{ ...cardLabel, color: "#ffedd5" }}>
              Recent Logs
            </div>
            <div style={cardValue}>
              4
            </div>
          </div>
        </div>

        {/* LOG CONTEXT-AWARE FILTER SEARCH CONTROLLER */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search activity logs by user or operation..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1e293b",
              background: "#ffffff",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              transition: "border-color 0.15s ease",
            }}
          />
        </div>

        {/* AUDIT LOG MASTER DATA GRID */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            overflowX: "auto",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Activity Logs
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, index) => {
                const badgeStyle = getActionBadgeStyle(log.action);
                return (
                  <tr key={index} style={{ background: "#ffffff" }}>
                    
                    <td style={{ ...tdStyle, fontWeight: "600", color: "#0f172a" }}>
                      {log.user}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          background: badgeStyle.bg,
                          color: badgeStyle.text,
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-block",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, color: "#64748b", fontWeight: "500" }}>
                      {log.date}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Global Layout CSS Metric Tokens Definitions
const cardLabel = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "12px",
};

const cardValue = {
  fontSize: "38px",
  fontWeight: "800",
  lineHeight: "1",
  letterSpacing: "-0.03em",
};

const cardBlue = {
  background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.15), 0 8px 10px -6px rgba(29, 78, 216, 0.15)",
};

const cardGreen = {
  background: "linear-gradient(135deg, #065f46, #10b981)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.15)",
};

const cardOrange = {
  background: "linear-gradient(135deg, #c2410c, #ea580c)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.15), 0 8px 10px -6px rgba(234, 88, 12, 0.15)",
};

const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  color: "#475569",
  fontWeight: "600",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "500",
  borderBottom: "1px solid #f1f5f9",
};

export default AuditLogs;