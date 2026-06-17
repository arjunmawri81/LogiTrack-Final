import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import api from "../../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);

      console.log("ORDER DATA =>", response.data);

      setOrder(response.data.order);
    } catch (error) {
      console.log("ORDER ERROR =>", error);
    }
  };

  if (!order) {
    return (
      <div
        style={{
          padding: "50px",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Loading Order Details...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "280px",
          padding: "20px 30px",
        }}
      >
        <AdminTopbar />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#0f172a",
          }}
        >
          Order Details
        </h1>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            color: "#111827",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <strong>Order Number:</strong> {order.orderNumber}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Customer Name:</strong> {order.customerName}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Phone:</strong> {order.customerPhone}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Email:</strong>{" "}
            {order.customerEmail || "N/A"}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Address:</strong>{" "}
            {order.customerAddress}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>City:</strong>{" "}
            {order.city || "N/A"}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>State:</strong>{" "}
            {order.state || "N/A"}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Pincode:</strong>{" "}
            {order.pincode || "N/A"}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Product:</strong>{" "}
            {order.productName}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Quantity:</strong>{" "}
            {order.quantity}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Payment Mode:</strong>{" "}
            {order.paymentMode}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Amount:</strong> ₹{order.amount}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Status:</strong>{" "}
            {order.status}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>Created:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;