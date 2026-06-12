import Sidebar from "../../components/Sidebar";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Orders",
      value: 245,
      color: "#2563eb",
    },
    {
      title: "Ready For Pickup",
      value: 56,
      color: "#f59e0b",
    },
    {
      title: "Dispatched Today",
      value: 34,
      color: "#10b981",
    },
    {
      title: "Manifest Generated",
      value: 18,
      color: "#8b5cf6",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Warehouse Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Manage dispatch operations and pickup workflow
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          {stats.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "16px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h4
                style={{
                  color: "#64748b",
                  marginBottom: "10px",
                }}
              >
                {item.title}
              </h4>

              <h2
                style={{
                  color: item.color,
                  fontSize: "32px",
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            marginTop: "30px",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h3>Recent Warehouse Activity</h3>

          <ul
            style={{
              marginTop: "15px",
              lineHeight: "35px",
            }}
          >
            <li>25 Orders Ready For Pickup</li>
            <li>12 Manifests Generated</li>
            <li>18 Orders Dispatched</li>
            <li>5 Pickup Requests Scheduled</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;