import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    const ok = window.confirm(
      "Delete this user?"
    );

    if (!ok) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SuperAdminLayout>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "10px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "10px",
          }}
        >
          User Management 👥
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Manage all platform users
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td style={tdStyle}>
                      {user.name}
                    </td>

                    <td style={tdStyle}>
                      {user.email}
                    </td>

                    <td style={tdStyle}>
                      {user.role}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          background:
                            user.isBlocked
                              ? "#fee2e2"
                              : "#dcfce7",

                          color:
                            user.isBlocked
                              ? "#dc2626"
                              : "#15803d",

                          padding:
                            "6px 12px",

                          borderRadius:
                            "999px",

                          fontSize: "12px",

                          fontWeight: "600",
                        }}
                      >
                        {user.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          deleteUser(
                            user._id
                          )
                        }
                        style={{
                          padding:
                            "8px 14px",
                          border: "none",
                          borderRadius:
                            "8px",
                          background:
                            "#dc2626",
                          color: "#fff",
                          cursor:
                            "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                    }}
                  >
                    No Users Found
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

const thStyle = {
  textAlign: "left",
  padding: "14px",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default UserManagement;