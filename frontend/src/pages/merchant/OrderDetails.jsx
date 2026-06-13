import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);

      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading Order...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>No Order Found</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Order Details
          </h1>

          <button
            onClick={() => navigate("/merchant/orders")}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>

        {/* Customer Details */}
        <div style={card}>
          <h2 style={title}>Customer Details</h2>

          <p style={text}>
            <b>Name:</b> {order.customerName}
          </p>

          <p style={text}>
            <b>Phone:</b> {order.customerPhone}
          </p>

          <p style={text}>
            <b>Email:</b> {order.customerEmail}
          </p>
        </div>

        {/* Address Details */}
        <div style={card}>
          <h2 style={title}>Address Details</h2>

          <p style={text}>{order.customerAddress}</p>

          <p style={text}>
            {order.city}, {order.state} - {order.pincode}
          </p>
        </div>

        {/* Product Details */}
        <div style={card}>
          <h2 style={title}>Product Details</h2>

          <p style={text}>
            <b>Product:</b> {order.productName}
          </p>

          <p style={text}>
            <b>SKU:</b> {order.sku}
          </p>

          <p style={text}>
            <b>Quantity:</b> {order.quantity}
          </p>
        </div>

        {/* Package Details */}
        <div style={card}>
          <h2 style={title}>Package Details</h2>

          <p style={text}>
            <b>Weight:</b> {order.weight} KG
          </p>

          <p style={text}>
            <b>Dimensions:</b>{" "}
            {order.length} × {order.breadth} × {order.height} cm
          </p>
        </div>

        {/* Payment Details */}
        <div style={card}>
          <h2 style={title}>Payment Details</h2>

          <p style={text}>
            <b>Mode:</b> {order.paymentMode}
          </p>

          <p style={text}>
            <b>Amount:</b> ₹{order.amount}
          </p>

          <p style={text}>
            <b>Shipping Charge:</b> ₹{order.shippingCharge}
          </p>
        </div>

        {/* Status */}
        <div style={card}>
          <h2 style={title}>Order Status</h2>

          <span
            style={{
              background:
                order.status === "DELIVERED"
                  ? "#dcfce7"
                  : order.status === "CANCELLED"
                  ? "#fee2e2"
                  : "#fef3c7",
              color:
                order.status === "DELIVERED"
                  ? "#166534"
                  : order.status === "CANCELLED"
                  ? "#991b1b"
                  : "#92400e",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            {order.status}
          </span>
        </div>

        <button
          onClick={() =>
            navigate("/merchant/create-shipment", {
              state: { order },
            })
          }
          style={{
            background: "#f97316",
            color: "#fff",
            border: "none",
            padding: "14px 22px",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "20px",
            fontWeight: "600",
          }}
        >
          Create Shipment
        </button>
      </div>
    </div>
  );
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "20px",
};

const title = {
  marginBottom: "15px",
  color: "#0f172a",
};

const text = {
  color: "#111827",
  fontSize: "15px",
  marginBottom: "8px",
};

export default OrderDetails;