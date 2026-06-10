import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaCog,
  FaShieldAlt,
  FaKey,
} from "react-icons/fa";

import "./Admin.css";

const Settings = () => {
  return (
    <div className="admin-dashboard">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              ⚙️ Platform Settings
            </h1>

            <p className="page-subtitle">
              Configure platform integrations and security settings
            </p>
          </div>
        </div>

        {/* Settings Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaEnvelope className="stat-icon blue" />
            <h4>Email Services</h4>
            <h2>3</h2>
          </div>

          <div className="courier-stat-card">
            <FaSms className="stat-icon green" />
            <h4>SMS Providers</h4>
            <h2>2</h2>
          </div>

          <div className="courier-stat-card">
            <FaWhatsapp className="stat-icon orange" />
            <h4>WhatsApp APIs</h4>
            <h2>1</h2>
          </div>

          <div className="courier-stat-card">
            <FaShieldAlt className="stat-icon red" />
            <h4>Security Status</h4>
            <h2>100%</h2>
          </div>

        </div>

        {/* Settings Cards */}

        <div className="settings-grid">

          <div className="settings-card">
            <FaEnvelope className="settings-icon" />
            <h3>Email Settings</h3>
            <p>SMTP configuration and email templates.</p>
          </div>

          <div className="settings-card">
            <FaSms className="settings-icon" />
            <h3>SMS Settings</h3>
            <p>OTP and notification SMS provider setup.</p>
          </div>

          <div className="settings-card">
            <FaWhatsapp className="settings-icon" />
            <h3>WhatsApp Settings</h3>
            <p>WhatsApp Business API integration.</p>
          </div>

          <div className="settings-card">
            <FaCog className="settings-icon" />
            <h3>General Settings</h3>
            <p>Company name, logo and platform config.</p>
          </div>

          <div className="settings-card">
            <FaShieldAlt className="settings-icon" />
            <h3>Security Settings</h3>
            <p>2FA, session management and access control.</p>
          </div>

          <div className="settings-card">
            <FaKey className="settings-icon" />
            <h3>API Keys</h3>
            <p>Manage courier and third-party API keys.</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;