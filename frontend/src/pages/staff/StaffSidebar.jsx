import { NavLink, Link } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaTruck,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";

import "./StaffSidebar.css";

const StaffSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">LogiTrack</h2>
        <span className="logo-subtitle">
          STAFF PANEL
        </span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/staff/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/staff/orders"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/staff/shipments"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaTruck />
            <span>Shipments</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/staff/tracking"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaSearch />
            <span>Tracking</span>
          </NavLink>
        </li>
      </ul>

      <div className="logout-section">
        <Link
          to="/login"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
          }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default StaffSidebar;