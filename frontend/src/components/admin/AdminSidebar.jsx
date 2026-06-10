import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaStore,
  FaTruck,
  FaRupeeSign,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import "./AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">

      {/* Logo */}

      <div className="admin-brand">
        <h2>LogiTrack</h2>
        <span>Super Admin Panel</span>
      </div>

      {/* Profile */}

      <div className="admin-profile">

        <div className="profile-avatar">
          AS
        </div>

        <div className="profile-info">
          <h4>Arjun Singh</h4>
          <span>Administrator</span>
        </div>

      </div>

      {/* Menu */}

      <ul className="admin-menu">

        <li>
          <NavLink to="/admin/dashboard">
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/users">
            <FaUsers />
            <span>Users</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/merchants">
            <FaStore />
            <span>Merchants</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/couriers">
            <FaTruck />
            <span>Couriers</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/pricing">
            <FaRupeeSign />
            <span>Pricing</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/revenue">
            <FaChartBar />
            <span>Revenue</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/reports">
            <FaChartBar />
            <span>Reports</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/settings">
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </li>

      </ul>

      {/* Logout */}

      <div className="logout-section">

        <NavLink to="/login">
          <FaSignOutAlt />
          <span>Logout</span>
        </NavLink>

      </div>

    </div>
  );
};

export default AdminSidebar;