import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import "./AdminManagement.css";

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
      const res = await api.get("/admin/admins");
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Error fetching administrators:", err);
    }
  };

  const createAdmin = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      await api.post("/admin/admins", form);
      alert("Admin Created Successfully");
      setForm({
        name: "",
        email: "",
        password: "",
      });
      fetchAdmins();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed To Create Admin");
    }
  };

  const deleteAdmin = async (id) => {
    const ok = window.confirm("Delete this admin?");
    if (!ok) return;

    try {
      await api.delete(`/admin/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="admin-mgmt-container">
        
        {/* HEADER */}
        <div className="page-header">
          <h1 className="page-title">
            Admin Management
          </h1>
          <p className="page-subtitle">
            Manage platform administrators and permissions
          </p>
        </div>

        {/* STATS CARD */}
        <div className="stats-card">
          <div className="stats-card-label">
            Total Administrators
          </div>
          <div className="stats-card-value">
            {admins.length}
          </div>
        </div>

        {/* CREATE ADMIN FORM */}
        <div className="form-card">
          <h2 className="form-title">
            Create New Admin
          </h2>

          <div className="form-grid">
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
            <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" />
          </div>

          <button onClick={createAdmin} className="submit-btn">
            Create Admin
          </button>
        </div>

        {/* ADMIN TABLE */}
        <div className="table-card">
          <h2 className="form-title">
            Administrator List
          </h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className="role-badge">
                        {admin.role || "ADMIN"}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => deleteAdmin(admin._id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
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

export default AdminManagement;