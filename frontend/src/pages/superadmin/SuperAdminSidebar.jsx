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
} from "react-icons/fa";


const SuperAdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <h2 className="logo">LogiTrack</h2>
        <span className="logo-subtitle">
          Super Admin Panel
        </span>
      </div>

      <div className="sidebar-profile">
        <div className="avatar">SA</div>

        <div className="profile-info">
          <h4>Super Admin</h4>
          <span>Platform Owner</span>
        </div>
      </div>

      <ul className="sidebar-menu">

        <li>
          <NavLink to="/superadmin/dashboard">
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/admins">
            <FaUserShield />
            <span>Admins</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/merchants">
            <FaUsers />
            <span>Merchants</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/commission">
            <FaMoneyBillWave />
            <span>Commission</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/revenue">
            <FaChartBar />
            <span>Revenue</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/api-monitoring">
            <FaServer />
            <span>API Monitoring</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/audit-logs">
            <FaClipboardList />
            <span>Audit Logs</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/superadmin/settings">
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </li>

      </ul>

      <div
        className="logout-section"
        onClick={logout}
        style={{ cursor: "pointer" }}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </div>

    </div>
  );
};

export default SuperAdminSidebar;