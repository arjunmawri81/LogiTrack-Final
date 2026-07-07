import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import "./Settings.css";

const Settings = () => {
  const [loading, setLoading] = useState(false);
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
    
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("Passwords do not match.");
    }

    if (formData.newPassword.length < 8) {
      return alert("Password must be at least 8 characters.");
    }

    if (formData.currentPassword === formData.newPassword) {
      return alert("New password cannot be same as current password.");
    }
    
    try {
      setLoading(true);

      const res = await api.put(
        "/admin/change-password",
        formData
      );

      alert(res.data.message || "Password changed successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <AdminSidebar />
      
      <div className="settings-main">
        <div className="settings-content">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage your account password and security preferences.</p>
          </div>
          
          <div className="settings-card">
            <div className="card-header">
              <div>
                <h2>Change Password</h2>
                <p>Update your password to keep your account secure</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <span className="input-hint">
                  Must be at least 8 characters with uppercase, lowercase & number
                </span>
              </div>
              
              <div className="input-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;