import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

const RTO = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetchRTO();
  }, []);

  const fetchRTO = async () => {
    try {
      const res = await api.get("/admin/shipments");

      const rtoShipments =
        (res.data.shipments || []).filter(
          (s) => s.status === "RTO"
        );

      setShipments(rtoShipments);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <h1>RTO Management</h1>

        <table
          style={{
            width: "100%",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th>AWB</th>
              <th>Courier</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {shipments.map((s) => (
              <tr key={s._id}>
                <td>{s.awb}</td>
                <td>{s.courier}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RTO;