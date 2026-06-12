import { useEffect, useState } from "react";
import WarehouseSidebar from "./WarehouseSidebar";
import api from "../../services/api";
import jsPDF from "jspdf";

const PickupSheet = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");

      const readyOrders = (res.data.orders || []).filter(
        (o) => o.status === "READY_FOR_PICKUP"
      );

      setOrders(readyOrders);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadPickupSheet = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("LOGITRACK PICKUP SHEET", 20, 20);

    let y = 40;

    orders.forEach((order, index) => {
      doc.text(
        `${index + 1}. ${order.orderNumber} - ${order.customerName}`,
        20,
        y
      );

      y += 10;
    });

    doc.save("PickupSheet.pdf");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <WarehouseSidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1>Pickup Sheet</h1>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          <h3>
            Ready For Pickup Orders : {orders.length}
          </h3>

          <button
            onClick={downloadPickupSheet}
            style={{
              padding: "12px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Download Pickup Sheet
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            marginTop: "20px",
            borderRadius: "12px",
            overflow: "hidden",
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
                  background: "#0f172a",
                  color: "#fff",
                }}
              >
                <th style={th}>Order No</th>
                <th style={th}>Customer</th>
                <th style={th}>Phone</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td style={td}>{order.orderNumber}</td>
                    <td style={td}>{order.customerName}</td>
                    <td style={td}>{order.customerPhone}</td>
                    <td style={td}>{order.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No Pickup Orders Found
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

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

export default PickupSheet;