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

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Audit Logs
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Monitor platform activities and administrator actions
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={cardBlue}>
          <div style={cardLabel}>
            Total Activities
          </div>

          <div style={cardValue}>
            {logs.length}
          </div>
        </div>

        <div style={cardGreen}>
          <div style={cardLabel}>
            Admin Actions
          </div>

          <div style={cardValue}>
            3
          </div>
        </div>

        <div style={cardOrange}>
          <div style={cardLabel}>
            Recent Logs
          </div>

          <div style={cardValue}>
            4
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Search activity logs..."
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            outline: "none",
            fontSize: "14px",
            background: "#ffffff",
          }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: "700",
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
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  {log.user}
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      background: "#dbeafe",
                      color: "#2563eb",
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    {log.action}
                  </span>
                </td>

                <td style={tdStyle}>
                  {log.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const cardLabel = {
  fontSize: "14px",
  fontWeight: "500",
  opacity: "0.9",
  marginBottom: "10px",
};

const cardValue = {
  fontSize: "42px",
  fontWeight: "800",
  lineHeight: "1",
};

const cardBlue = {
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(37,99,235,.18)",
};

const cardGreen = {
  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(34,197,94,.18)",
};

const cardOrange = {
  background:
    "linear-gradient(135deg,#f97316,#ea580c)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(249,115,22,.18)",
};

const thStyle = {
  padding: "18px 24px",
  textAlign: "left",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#374151",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default AuditLogs;