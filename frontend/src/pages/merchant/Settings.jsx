import Sidebar from "../../components/Sidebar";
import "./Settings.css";

const Settings = () => {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="settings-container">
        <h1>Settings</h1>

        <div className="settings-card">
          <h2>Account Settings</h2>

          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="setting-item">
            <label>SMS Notifications</label>
            <input type="checkbox" />
          </div>

          <div className="setting-item">
            <label>Two-Factor Authentication</label>
            <input type="checkbox" />
          </div>
        </div>

        <div className="settings-card">
          <h2>Change Password</h2>

          <input
            type="password"
            placeholder="Current Password"
          />

          <input
            type="password"
            placeholder="New Password"
          />

          <input
            type="password"
            placeholder="Confirm Password"
          />

          <button className="save-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;