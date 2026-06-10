import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

import {
  FaStore,
  FaUserCheck,
  FaBan,
  FaWallet,
  FaEye,
  FaSearch,
} from "react-icons/fa";

import "./Admin.css";

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get(
        "/admin/users"
      );

      const merchantUsers =
        response.data.users.filter(
          (user) =>
            user.role === "MERCHANT"
        );

      setMerchants(merchantUsers);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              🏢 Merchants Management
            </h1>

            <p className="page-subtitle">
              Manage merchants, wallets and account status
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="courier-stats">

          <div className="courier-stat-card">
            <FaStore className="stat-icon blue" />
            <h4>Total Merchants</h4>
            <h2>{merchants.length}</h2>
          </div>

          <div className="courier-stat-card">
            <FaUserCheck className="stat-icon green" />
            <h4>Active Merchants</h4>
            <h2>{merchants.length}</h2>
          </div>

          <div className="courier-stat-card">
            <FaBan className="stat-icon red" />
            <h4>Blocked Accounts</h4>
            <h2>0</h2>
          </div>

          <div className="courier-stat-card">
            <FaWallet className="stat-icon orange" />
            <h4>Total Wallet Balance</h4>
            <h2>₹0</h2>
          </div>

        </div>

        {/* Search */}

        <div className="merchant-search">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search merchants..."
          />

        </div>

        {/* Table */}

        <div className="admin-table-section">

          <h2>Merchant List</h2>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Wallet</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {merchants.length > 0 ? (
                merchants.map((merchant) => (
                  <tr key={merchant._id}>

                    <td>
                      <div className="courier-info">

                        <div className="courier-avatar">
                          {merchant.name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </div>

                        {merchant.name}

                      </div>
                    </td>

                    <td>{merchant.name}</td>

                    <td>{merchant.email}</td>

                    <td>₹0</td>

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
                    colSpan="6"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    No Merchants Found
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

export default Merchants;