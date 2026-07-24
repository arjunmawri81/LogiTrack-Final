import { NavLink, useNavigate } from "react-router-dom";
import "./SuperAdminSidebar.css";
import {
  FaHome,
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaChartBar,
  FaServer,
  FaCog,
  FaClipboardList,
  FaSignOutAlt,
  FaTruck,
} from "react-icons/fa";

const SuperAdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="superadmin-scope">
    <div className="sidebar">
      {/* BRAND HEADER CONTAINER */}
      <div className="sidebar-header">
        <h2 className="logo">LogiTrack</h2>
        <span className="logo-subtitle">Super Admin Panel</span>
      </div>

      {/* ADMIN IDENTITY PROFILE WRAPPER */}
      <div className="sidebar-profile">
        <div className="avatar">SA</div>
        <div className="profile-info">
          <h4>Super Admin</h4>
          <span>Platform Owner</span>
        </div>
      </div>

      {/* CORE NAVIGATION MENU */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/superadmin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <FaHome style={{ fontSize: "20px" }} />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/admins" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUserShield style={{ fontSize: "20px" }} />
            <span>Admins</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/merchants" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUsers style={{ fontSize: "20px" }} />
            <span>Merchants</span>
          </NavLink>
        </li>

        {/* Couriers Menu Item */}
        <li>
          <NavLink to="/superadmin/couriers" className={({ isActive }) => isActive ? "active" : ""}>
            <FaTruck style={{ fontSize: "20px" }} />
            <span>Couriers</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/commission" className={({ isActive }) => isActive ? "active" : ""}>
            <FaMoneyBillWave style={{ fontSize: "20px" }} />
            <span>Commission</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/revenue" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChartBar style={{ fontSize: "20px" }} />
            <span>Revenue</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/api-monitoring" className={({ isActive }) => isActive ? "active" : ""}>
            <FaServer style={{ fontSize: "20px" }} />
            <span>API Monitoring</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/audit-logs" className={({ isActive }) => isActive ? "active" : ""}>
            <FaClipboardList style={{ fontSize: "20px" }} />
            <span>Audit Logs</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/settings" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCog style={{ fontSize: "20px" }} />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>

      {/* ACCOUNT SESSION TERMINATION */}
      <div className="logout-section" onClick={logout}>
        <FaSignOutAlt style={{ fontSize: "18px" }} />
        <span>Logout</span>
      </div>
    </div>
    </div>
  );
};

export default SuperAdminSidebar;