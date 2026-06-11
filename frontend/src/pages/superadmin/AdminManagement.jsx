import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // State handles for input focus tracking & button hover animation via inline styles
  const [focusedInput, setFocusedInput] = useState(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/all-admins");
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Error fetching administrators:", err);
    }
  };

  const createAdmin = async () => {
    try {
      await api.post("/admin/create-admin", form);
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error("Error creating administrator:", err);
    }
  };

  // Base font framework style across the page
  const fontStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  // Shared input layout configuration logic
  const getInputStyle = (id) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px",
    borderRadius: "12px",
    border: focusedInput === id ? "1px solid #3b82f6" : "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    fontWeight: "500",
    background: focusedInput === id ? "#ffffff" : "#f8fafc",
    color: "#0f172a",
    boxShadow: focusedInput === id ? "0 0 0 4px rgba(59, 130, 246, 0.1)" : "none",
    transition: "all 0.2s ease-in-out",
  });

  return (
    <SuperAdminLayout>
      <div style={{ ...fontStyle, maxWidth: "1400px", margin: "0 auto", padding: "10px" }}>
        
        {/* HEADER */}
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 6px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Admin Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            Manage platform administrators and permissions
          </p>
        </div>

        {/* STATS CARD */}
        <div
          style={{
            width: "300px",
            background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
            borderRadius: "16px",
            padding: "24px",
            color: "#ffffff",
            marginBottom: "35px",
            boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.15), 0 8px 10px -6px rgba(29, 78, 216, 0.15)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#93c5fd",
              marginBottom: "12px",
            }}
          >
            Total Administrators
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: "800",
              lineHeight: "1",
              letterSpacing: "-0.03em",
            }}
          >
            {admins.length}
          </div>
        </div>

        {/* CREATE ADMIN FORM CONTAINER */}
        <div
          style={{
            background: "#ffffff",
            padding: "26px",
            borderRadius: "16px",
            marginBottom: "35px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 24px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Create New Admin
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={getInputStyle("name")}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={getInputStyle("email")}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={getInputStyle("password")}
            />
          </div>

          <button
            onClick={createAdmin}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              padding: "13px 26px",
              background: isBtnHovered ? "#ea580c" : "#f97316",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: isBtnHovered ? "0 4px 12px rgba(249, 115, 22, 0.25)" : "none",
              transition: "all 0.15s ease-in-out",
            }}
          >
            Create Admin
          </button>
        </div>

        {/* ADMIN TABLE CONTAINER */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            overflowX: "auto",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Administrator List
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
              </tr>
            </thead>

            <tbody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin._id} style={{ background: "#ffffff" }}>
                    <td style={tdStyle}>{admin.name}</td>
                    <td style={tdStyle}>{admin.email}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontWeight: "600",
                          fontSize: "12px",
                          display: "inline-block",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {admin.role || "Admin"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: "#94a3b8",
                      background: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    No Administrators Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Static Structural CSS Layout Specifications
const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  color: "#475569",
  fontWeight: "600",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "500",
  borderBottom: "1px solid #f1f5f9",
};

export default AdminManagement;