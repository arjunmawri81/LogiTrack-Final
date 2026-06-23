import { Link, NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaClipboardList,
  FaTruck,
  FaWallet,
  FaFileInvoice,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTicketAlt, // ✅ ADDED
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const role = localStorage.getItem("role");

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">LogiTrack</h2>
        <span className="logo-subtitle">
          {role === "ADMIN" ? "ADMIN PANEL" : "MERCHANT PANEL"}
        </span>
      </div>

      <div className="sidebar-profile">
        <div className="avatar">AS</div>
        <div className="profile-info">
          <h4>Arjun Singh</h4>
          <span>
            {role === "ADMIN"
              ? "Administrator"
              : "Merchant"}
          </span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {role === "ADMIN" ? (
          <>
            <li>
              <NavLink
                to="/admin/dashboard"
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
                to="/admin/users"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaUser />
                <span>Users</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/merchants"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaBox />
                <span>Merchants</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/orders"
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
                to="/admin/shipments"
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
                to="/admin/couriers"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaTruck />
                <span>Couriers</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/pricing"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaWallet />
                <span>Pricing</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/revenue"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaChartBar />
                <span>Revenue</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaFileInvoice />
                <span>Reports</span>
              </NavLink>
            </li>

            {/* ✅ ADMIN SUPPORT TICKETS */}
            <li>
              <NavLink
                to="/admin/tickets"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaTicketAlt />
                <span>Support Tickets</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaCog />
                <span>Settings</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/merchant/dashboard"
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
                to="/merchant/orders"
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
                to="/merchant/create-shipment"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaBox />
                <span>Create Shipment</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/shipments"
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
                to="/merchant/tracking"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaTruck />
                <span>Tracking</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/wallet"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaWallet />
                <span>Wallet</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/invoices"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaFileInvoice />
                <span>Invoices</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/billing"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaFileInvoice />
                <span>Billing</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/serviceability"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaTruck />
                <span>Serviceability</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/rate-calculator"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaWallet />
                <span>Rate Calculator</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/reports"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaChartBar />
                <span>Reports</span>
              </NavLink>
            </li>

            {/* ✅ MERCHANT SUPPORT TICKETS */}
            <li>
              <NavLink
                to="/merchant/tickets"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaTicketAlt />
                <span>Support Tickets</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/profile"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaUser />
                <span>Profile</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/merchant/settings"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <FaCog />
                <span>Settings</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="logout-section">
        <Link to="/login">
          <FaSignOutAlt />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;