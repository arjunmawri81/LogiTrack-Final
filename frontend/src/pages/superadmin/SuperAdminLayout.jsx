import SuperAdminSidebar from "./SuperAdminSidebar";
import "./SuperAdminLayout.css";

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="superadmin-layout">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <main className="superadmin-main">
        <div className="superadmin-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;