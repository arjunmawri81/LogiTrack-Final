import SuperAdminSidebar from "./SuperAdminSidebar";

const SuperAdminLayout = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <main
        style={{
          marginLeft: "260px",
          width: "calc(100% - 260px)",

          padding: "40px",

          background: "#f8fafc",

          minHeight: "100vh",

          boxSizing: "border-box",

          overflowX: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;