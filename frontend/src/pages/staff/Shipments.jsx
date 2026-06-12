import { useEffect, useState } from "react";
import StaffSidebar from "./StaffSidebar";
import api from "../../services/api";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await api.get("/admin/shipments");
      setShipments(res.data.shipments || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <StaffSidebar />

      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          📦 Staff Shipments
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          View all shipments
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
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
              <tr
                style={{
                  background: "#f1f5f9",
                }}
              >
                <th style={thStyle}>AWB</th>
                <th style={thStyle}>Courier</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Pickup Date</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment._id}>
                    <td style={tdStyle}>{shipment.awb}</td>

                    <td style={tdStyle}>
                      {shipment.courier}
                    </td>

                    <td style={tdStyle}>
                      {shipment.status}
                    </td>

                    <td style={tdStyle}>
                      {shipment.pickupDate
                        ? new Date(
                            shipment.pickupDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td style={tdStyle}>
                      {new Date(
                        shipment.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "20px",
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

const thStyle = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default Shipments;