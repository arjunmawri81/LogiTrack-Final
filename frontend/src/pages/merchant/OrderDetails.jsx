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
      <div style={{ padding: "40px", background: "#111827", minHeight: "100vh", color: "#f1f5f9" }}>
        <h2>Loading Order...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "40px", background: "#111827", minHeight: "100vh", color: "#f1f5f9" }}>
        <h2>No Order Found</h2>
      </div>
    );
  }

  return (
    <div
      className="merchant-page-container"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#111827",
      }}
    >
      <div className="merchant-sidebar-container" style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <div
        className="merchant-main-container"
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
              color: "#f1f5f9",
            }}
          >
            Order Details
          </h1>

          <button
            onClick={() => navigate("/merchant/orders")}
            style={{
              background: "#1c2333",
              color: "#f1f5f9",
              border: "1px solid #2a3a52",
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
          <h2 style={title}>Package & Volumetric Details</h2>

          {(() => {
            const l = parseFloat(order.length) || 0;
            const b = parseFloat(order.breadth) || 0;
            const h = parseFloat(order.height) || 0;
            const actWt = parseFloat(order.weight) || 0;
            const vol = l * b * h;
            const volWt = vol > 0 ? vol / 5000 : 0;
            const billableWt = Math.max(actWt, volWt);

            return (
              <>
                <p style={text}>
                  <b>Actual Weight:</b> {order.weight} KG
                </p>

                <p style={text}>
                  <b>Dimensions (L × B × H):</b>{" "}
                  {order.length && order.breadth && order.height
                    ? `${order.length} × ${order.breadth} × ${order.height} cm`
                    : "N/A"}
                </p>

                <p style={text}>
                  <b>Total Volume:</b>{" "}
                  {vol > 0 ? `${vol.toLocaleString()} cm³` : "N/A"}
                </p>

                <p style={text}>
                  <b>Volumetric Weight:</b>{" "}
                  {volWt > 0 ? `${volWt.toFixed(2)} KG (Formula: L × B × H ÷ 5000)` : "N/A"}
                </p>

                <p style={{ ...text, color: "#4ade80", fontWeight: "700" }}>
                  <b>Billable / Chargeable Weight:</b>{" "}
                  {billableWt > 0 ? `${billableWt.toFixed(2)} KG` : "N/A"}
                </p>
              </>
            );
          })()}
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
                  ? "rgba(34,197,94,0.15)"
                  : order.status === "CANCELLED"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(234,179,8,0.15)",
              color:
                order.status === "DELIVERED"
                  ? "#4ade80"
                  : order.status === "CANCELLED"
                  ? "#f87171"
                  : "#facc15",
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
  background: "#1c2333",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #2a3a52",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};

const title = {
  marginBottom: "15px",
  color: "#f1f5f9",
  fontSize: "18px",
};

const text = {
  color: "#a0aec0",
  fontSize: "15px",
  marginBottom: "8px",
};

export default OrderDetails;