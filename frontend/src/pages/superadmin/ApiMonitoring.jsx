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
            API Monitoring
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Monitor API health, response time and failures
          </p>
        </div>

        {/* METRICS & PERFORMANCE KPI CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {/* TOTAL API ENDPOINTS CONTROL */}
          <div style={cardBlue}>
            <div style={{ ...cardLabel, color: "#93c5fd" }}>
              Total APIs
            </div>
            <div style={cardValue}>
              12
            </div>
          </div>

          {/* ACTIVE SYSTEM METRIC CARD */}
          <div style={cardGreen}>
            <div style={{ ...cardLabel, color: "#a7f3d0" }}>
              Healthy APIs
            </div>
            <div style={cardValue}>
              10
            </div>
          </div>

          {/* OUTAGE TRACKER CARD */}
          <div style={cardRed}>
            <div style={{ ...cardLabel, color: "#fca5a5" }}>
              Failed APIs
            </div>
            <div style={cardValue}>
              2
            </div>
          </div>
        </div>

        {/* LIVE INFRASTRUCTURE STATUS DATAGRID */}
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
            API Status Report
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
                <th style={thStyle}>API Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Response Time</th>
              </tr>
            </thead>

            <tbody>
              {apis.map((api, index) => (
                <tr key={index} style={{ background: "#ffffff" }}>
                  
                  <td style={{ ...tdStyle, fontWeight: "600", color: "#0f172a" }}>
                    {api.name}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: api.status === "Active" ? "#dcfce7" : "#fee2e2",
                        color: api.status === "Active" ? "#166534" : "#991b1b",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "inline-block",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {api.status}
                    </span>
                  </td>

                  <td 
                    style={{ 
                      ...tdStyle, 
                      fontFamily: "monospace", 
                      fontSize: "14px",
                      fontWeight: "600",
                      color: api.response === "Timeout" ? "#b91c1c" : "#475569" 
                    }}
                  >
                    {api.response}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Fixed CSS Styling Specifications
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

const cardRed = {
  background: "linear-gradient(135deg, #991b1b, #ef4444)",
  borderRadius: "16px",
  padding: "24px",
  color: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.15), 0 8px 10px -6px rgba(239, 68, 68, 0.15)",
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

export default ApiMonitoring;