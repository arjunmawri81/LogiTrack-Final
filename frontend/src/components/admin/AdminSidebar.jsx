import { Link, NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaStore,
  FaTruck,
  FaRupeeSign,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaBox,
  FaExclamationTriangle,
  FaUndo,
} from "react-icons/fa";

import "./AdminSidebar.css"; // Merchant wala CSS use karo

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="logo">LogiTrack</h2>
        <span className="logo-subtitle">ADMIN PANEL</span>
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <div className="avatar">AS</div>

        <div className="profile-info">
          <h4>Arjun Singh</h4>
          <span>Administrator</span>
        </div>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUsers />
            <span>Users</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/merchants"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaStore />
            <span>Merchants</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/shipments"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBox />
            <span>Shipments</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/couriers"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTruck />
            <span>Couriers</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/ndr"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaExclamationTriangle />
            <span>NDR</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/rto"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUndo />
            <span>RTO</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/pricing"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaRupeeSign />
            <span>Pricing</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/cod"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaRupeeSign />
            <span>COD</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/revenue"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaChartBar />
            <span>Revenue</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className="logout-section">
        <Link to="/login">
          <FaSignOutAlt />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;