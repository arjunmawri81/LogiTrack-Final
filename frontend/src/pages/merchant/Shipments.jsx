import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

import {
  FaTruck,
  FaSearch,
} from "react-icons/fa";

import "./Shipments.css";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await api.get(
        "/shipments"
      );

      setShipments(
        response.data.shipments || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="shipments-content">

        <div className="page-header">
          <div>
            <h1>
              Shipments Management
            </h1>

            <p>
              Track and manage all shipments
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="stats-grid">

          <div className="stats-card">
            <FaTruck className="stats-icon blue" />

            <h4>Total Shipments</h4>

            <h2>
              {shipments.length}
            </h2>
          </div>

        </div>

        {/* Search */}

        <div className="filter-bar">

          <div className="search-box">

            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search AWB..."
            />

          </div>

        </div>

        {/* Table */}

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>AWB</th>
                <th>Customer</th>
                <th>Courier</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {shipments.length > 0 ? (
                shipments.map(
                  (shipment) => (
                    <tr
                      key={shipment._id}
                    >
                      <td>
                        {shipment.awb}
                      </td>

                      <td>
                        {
                          shipment
                            .orderId
                            ?.customerName
                        }
                      </td>

                      <td>
                        {
                          shipment.courier
                        }
                      </td>

                      <td>
                        {
                          shipment.status
                        }
                      </td>

                      <td>
                        {new Date(
                          shipment.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    No Shipments Found
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

export default Shipments;