import Sidebar from "../../components/Sidebar";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", flex: 1 }}>
        <h1>Staff Dashboard</h1>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          <h3>Welcome Staff User</h3>
          <p>
            Manage Orders, Shipments and Tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;