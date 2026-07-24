import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import "./UserManagement.css";

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
      <div className="user-mgmt-container">
        <h1 className="page-title">
          User Management 👥
        </h1>

        <p className="page-subtitle">
          Manage all platform users
        </p>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.role}
                    </td>

                    <td>
                      <span className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}>
                        {user.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          deleteUser(
                            user._id
                          )
                        }
                        className="delete-btn"
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

export default UserManagement;