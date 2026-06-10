import "./AdminTopbar.css";
import {
  FaBell,
  FaSearch,
  FaEnvelope,
} from "react-icons/fa";

const AdminTopbar = () => {
  return (
    <div className="admin-topbar">

      <div className="topbar-left">
        <h2>Welcome Back, Admin 👋</h2>

        <p>
          Manage merchants, couriers and platform operations
        </p>

        <span className="dashboard-date">
          Last Login: Today, 10:25 AM
        </span>
      </div>

      <div className="topbar-right">

        {/* Search */}

        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search merchants, orders..."
          />
        </div>

        {/* Messages */}

        <button className="icon-btn">
          <FaEnvelope />
        </button>

        {/* Notifications */}

        <button className="icon-btn notification-btn">
          <FaBell />

          <span className="notification-badge">
            5
          </span>
        </button>

      </div>

    </div>
  );
};

export default AdminTopbar;