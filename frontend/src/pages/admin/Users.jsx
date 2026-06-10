import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaUserClock,
  FaEye,
  FaSearch,
} from "react-icons/fa";

import "./Admin.css";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(
        "/admin/users"
      );

      setUsers(response.data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const totalAdmins = users.filter(
    (user) =>
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN"
  ).length;

  const totalMerchants = users.filter(
    (user) =>
      user.role === "MERCHANT"
  ).length;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">

        <div className="page-header">
          <div>
            <h1 className="page-title">
              👥 Users Management
            </h1>

            <p className="page-subtitle">
              Manage platform users, admins and merchants
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaUsers className="stat-icon blue" />
            <h4>Total Users</h4>
            <h2>{users.length}</h2>
          </div>

          <div className="courier-stat-card">
            <FaUserShield className="stat-icon green" />
            <h4>Admins</h4>
            <h2>{totalAdmins}</h2>
          </div>

          <div className="courier-stat-card">
            <FaUserTie className="stat-icon orange" />
            <h4>Merchants</h4>
            <h2>{totalMerchants}</h2>
          </div>

          <div className="courier-stat-card">
            <FaUserClock className="stat-icon red" />
            <h4>Pending Users</h4>
            <h2>0</h2>
          </div>

        </div>

        {/* Search */}

        <div className="merchant-search">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search users..."
          />

        </div>

        {/* Table */}

        <div className="admin-table-section">

          <h2>User List</h2>

          <table className="admin-table">

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
                      <div className="courier-info">

                        <div className="courier-avatar">
                          {user.name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </div>

                        {user.name}

                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>{user.role}</td>

                    <td>
                      <span className="active">
                        Active
                      </span>
                    </td>

                    <td>
                      <button className="admin-btn">
                        <FaEye />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
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
    </div>
  );
};

export default Users;