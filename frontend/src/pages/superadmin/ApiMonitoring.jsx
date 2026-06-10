import SuperAdminLayout from "./SuperAdminLayout";

const ApiMonitoring = () => {
  const apis = [
    {
      name: "Login API",
      status: "Active",
      response: "120ms",
    },
    {
      name: "Orders API",
      status: "Active",
      response: "95ms",
    },
    {
      name: "Tracking API",
      status: "Failed",
      response: "Timeout",
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
          API Monitoring
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Monitor API health, response time and failures
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
            Total APIs
          </div>

          <div style={cardValue}>
            12
          </div>
        </div>

        <div style={cardGreen}>
          <div style={cardLabel}>
            Healthy APIs
          </div>

          <div style={cardValue}>
            10
          </div>
        </div>

        <div style={cardRed}>
          <div style={cardLabel}>
            Failed APIs
          </div>

          <div style={cardValue}>
            2
          </div>
        </div>
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
          API Status Report
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
              <th style={thStyle}>
                API Name
              </th>

              <th style={thStyle}>
                Status
              </th>

              <th style={thStyle}>
                Response Time
              </th>
            </tr>
          </thead>

          <tbody>
            {apis.map((api, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  {api.name}
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      background:
                        api.status === "Active"
                          ? "#dcfce7"
                          : "#fee2e2",
                      color:
                        api.status === "Active"
                          ? "#15803d"
                          : "#dc2626",
                      padding: "7px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    {api.status}
                  </span>
                </td>

                <td style={tdStyle}>
                  {api.response}
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

const cardRed = {
  background:
    "linear-gradient(135deg,#ef4444,#dc2626)",
  borderRadius: "20px",
  padding: "22px",
  color: "#fff",
  boxShadow:
    "0 12px 25px rgba(239,68,68,.18)",
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

export default ApiMonitoring;