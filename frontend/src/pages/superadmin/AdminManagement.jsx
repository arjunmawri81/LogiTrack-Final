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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/all-admins");
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.log(err);
    }
  };

  const createAdmin = async () => {
    try {
      await api.post("/admin/create-admin", form);

      setForm({
        name: "",
        email: "",
        password: "",
      });

      fetchAdmins();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Admin Management
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Manage platform administrators and permissions
        </p>
      </div>

      {/* STATS CARD */}
      <div
        style={{
          width: "320px",
          background:
            "linear-gradient(135deg,#2563eb,#1d4ed8)",
          borderRadius: "20px",
          padding: "22px",
          color: "#ffffff",
          marginBottom: "25px",
          boxShadow:
            "0 12px 25px rgba(37,99,235,.18)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            opacity: "0.9",
            marginBottom: "10px",
          }}
        >
          Total Administrators
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "800",
            lineHeight: "1",
          }}
        >
          {admins.length}
        </div>
      </div>

      {/* CREATE ADMIN */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
          }}
        >
          Create New Admin
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <button
          onClick={createAdmin}
          style={btnStyle}
        >
          Create Admin
        </button>
      </div>

      {/* ADMIN TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
          boxShadow:
            "0 8px 20px rgba(15,23,42,.05)",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: "700",
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
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
            </tr>
          </thead>

          <tbody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr
                  key={admin._id}
                  style={{
                    background: "#ffffff",
                  }}
                >
                  <td style={tdStyle}>
                    {admin.name}
                  </td>

                  <td style={tdStyle}>
                    {admin.email}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "7px 14px",
                        borderRadius: "999px",
                        fontWeight: "600",
                        fontSize: "13px",
                        display: "inline-block",
                      }}
                    >
                      {admin.role}
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
                    padding: "40px",
                    color: "#64748b",
                    background: "#ffffff",
                    fontSize: "15px",
                  }}
                >
                  No Administrators Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: "14px",
  background: "#f8fafc",
  color: "#111827",
};

const btnStyle = {
  padding: "12px 22px",
  background: "#f97316",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const thStyle = {
  padding: "18px 24px",
  textAlign: "left",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#374151",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default AdminManagement;