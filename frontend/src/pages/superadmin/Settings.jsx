import { useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../services/api";
import { FaLock, FaKey, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return alert("All password fields are required.");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return alert("New password and confirm password do not match.");
    }

    if (formData.newPassword.length < 8) {
      return alert("New password must be at least 8 characters long.");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      return alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.");
    }

    if (formData.currentPassword === formData.newPassword) {
      return alert("New password cannot be the same as current password.");
    }

    try {
      setLoading(true);

      const res = await api.put("/admin/change-password", formData);

      alert(res.data.message || "Password changed successfully!");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="settings-container">
        
        {/* HEADER SECTION */}
        <div className="page-header">
          <h1 className="page-title">
            SuperAdmin Settings
          </h1>
          <p className="page-subtitle">
            Manage your superadmin account security and password preferences
          </p>
        </div>

        {/* CHANGE PASSWORD FORM CARD */}
        <div className="form-card">
          <div className="card-header-flex">
            <div className="header-icon-wrapper">
              <FaShieldAlt className="header-icon" />
            </div>
            <div>
              <h2 className="form-title" style={{ margin: 0 }}>
                Change Password
              </h2>
              <p className="form-subtitle" style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                Update your account password to ensure your platform remains secure.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
            <div className="input-group-custom">
              <label className="input-label">Current Password</label>
              <div className="password-input-wrapper">
                <FaKey className="field-icon" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="text-input"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="input-group-custom">
              <label className="input-label">New Password</label>
              <div className="password-input-wrapper">
                <FaLock className="field-icon" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password (min 8 characters)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="text-input"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="input-group-custom">
              <label className="input-label">Confirm New Password</label>
              <div className="password-input-wrapper">
                <FaLock className="field-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="text-input"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="save-btn"
              style={{ marginTop: "12px" }}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* STATIC SYSTEM METADATA DATAGRID */}
        <div className="table-card">
          <h2 className="form-title">
            Platform Information
          </h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Platform Name</td>
                <td style={{ fontWeight: "700", color: "#0f172a" }}>MyParcelPoint</td>
              </tr>

              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Version</td>
                <td style={{ fontFamily: "monospace", color: "#0f172a", fontSize: "14px" }}>v1.0.0</td>
              </tr>

              <tr>
                <td style={{ fontWeight: "600", color: "#475569" }}>Environment</td>
                <td>
                  <span className="env-badge">
                    Production
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default Settings;