import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Settings.css";

const Settings = () => {
  const [loading, setLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const changePassword = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      return alert("Please fill all fields.");
    }

    if (
      passwords.newPassword !==
      passwords.confirmPassword
    ) {
      return alert("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await api.put(
        "/merchant/change-password",
        passwords
      );

      alert(
        res.data.message ||
          "Password Changed Successfully"
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="settings-container">
        <h1>Settings</h1>

        <div className="settings-card">
          <h2>Change Password</h2>

          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={handleChange}
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={handleChange}
          />

          <button
            className="save-btn"
            onClick={changePassword}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;