import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  FaTicketAlt,
  FaExclamationTriangle,
  FaUndoAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || "Arjun Singh";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* ===== HAMBURGER BUTTON ===== */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* ===== OVERLAY ===== */}
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={closeSidebar} />

      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">LogiTrack</h2>
          <span className="logo-subtitle">
            {role === "ADMIN" ? "ADMIN PANEL" : "MERCHANT PANEL"}
          </span>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">{userInitial}</div>
          <div className="profile-info">
            <h4>{userName}</h4>
            <span>{role === "ADMIN" ? "Administrator" : "Merchant"}</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          {role === "ADMIN" ? (
            // ===== ADMIN MENU =====
            <>
              <li>
                <NavLink to="/admin/dashboard" onClick={closeSidebar}>
                  <FaHome /> <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" onClick={closeSidebar}>
                  <FaUser /> <span>Users</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/merchants" onClick={closeSidebar}>
                  <FaBox /> <span>Merchants</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/orders" onClick={closeSidebar}>
                  <FaClipboardList /> <span>Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/shipments" onClick={closeSidebar}>
                  <FaTruck /> <span>Shipments</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/couriers" onClick={closeSidebar}>
                  <FaTruck /> <span>Couriers</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/pricing" onClick={closeSidebar}>
                  <FaWallet /> <span>Pricing</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/revenue" onClick={closeSidebar}>
                  <FaChartBar /> <span>Revenue</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/reports" onClick={closeSidebar}>
                  <FaFileInvoice /> <span>Reports</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/tickets" onClick={closeSidebar}>
                  <FaTicketAlt /> <span>Support Tickets</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/settings" onClick={closeSidebar}>
                  <FaCog /> <span>Settings</span>
                </NavLink>
              </li>
            </>
          ) : (
            // ===== MERCHANT MENU =====
            <>
              <li>
                <NavLink to="/merchant/dashboard" onClick={closeSidebar}>
                  <FaHome /> <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/orders" onClick={closeSidebar}>
                  <FaClipboardList /> <span>Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/create-shipment" onClick={closeSidebar}>
                  <FaBox /> <span>Create Shipment</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/shipments" onClick={closeSidebar}>
                  <FaTruck /> <span>Shipments</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/tracking" onClick={closeSidebar}>
                  <FaTruck /> <span>Tracking</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/ndr" onClick={closeSidebar}>
                  <FaExclamationTriangle /> <span>NDR</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/rto" onClick={closeSidebar}>
                  <FaUndoAlt /> <span>RTO</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/wallet" onClick={closeSidebar}>
                  <FaWallet /> <span>Wallet</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/invoices" onClick={closeSidebar}>
                  <FaFileInvoice /> <span>Invoices</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/billing" onClick={closeSidebar}>
                  <FaFileInvoice /> <span>Billing</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/serviceability" onClick={closeSidebar}>
                  <FaTruck /> <span>Serviceability</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/rate-calculator" onClick={closeSidebar}>
                  <FaWallet /> <span>Rate Calculator</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/reports" onClick={closeSidebar}>
                  <FaChartBar /> <span>Reports</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/tickets" onClick={closeSidebar}>
                  <FaTicketAlt /> <span>Support Tickets</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/profile" onClick={closeSidebar}>
                  <FaUser /> <span>Profile</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/merchant/settings" onClick={closeSidebar}>
                  <FaCog /> <span>Settings</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="logout-section">
          <Link to="/login" onClick={closeSidebar}>
            <FaSignOutAlt />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;