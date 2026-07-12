import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { FaArrowLeft, FaSave, FaTimes, FaSpinner, FaBox, FaCreditCard, FaTruck, FaRupeeSign, FaTag } from "react-icons/fa";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    city: "",
    state: "",
    pincode: "",

    productName: "",
    sku: "",
    quantity: 1,

    weight: "",
    length: "",
    breadth: "",
    height: "",

    paymentMode: "PREPAID",
    amount: "",
    shippingCharge: "",

    courierPartner: "",
    notes: "",

    status: "NEW",
  });

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}`);

      setFormData({
        customerName: res.data.order.customerName || "",
        customerPhone: res.data.order.customerPhone || "",
        customerEmail: res.data.order.customerEmail || "",
        customerAddress: res.data.order.customerAddress || "",
        city: res.data.order.city || "",
        state: res.data.order.state || "",
        pincode: res.data.order.pincode || "",

        productName: res.data.order.productName || "",
        sku: res.data.order.sku || "",
        quantity: res.data.order.quantity || 1,

        weight: res.data.order.weight || "",
        length: res.data.order.length || "",
        breadth: res.data.order.breadth || "",
        height: res.data.order.height || "",

        paymentMode: res.data.order.paymentMode || "PREPAID",
        amount: res.data.order.amount || "",
        shippingCharge: res.data.order.shippingCharge || "",

        courierPartner: res.data.order.courierPartner || "",
        notes: res.data.order.notes || "",

        status: res.data.order.status || "NEW",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/admin/orders/${id}`, formData);
      alert("✅ Order Updated Successfully");
      navigate("/admin/orders");
    } catch (error) {
      console.log(error);
      alert("❌ Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "#fef3c7",
      READY_FOR_PICKUP: "#d1fae5",
      SHIPPED: "#e0e7ff",
      OUT_FOR_DELIVERY: "#dbeafe",
      DELIVERED: "#dcfce7",
      NDR: "#fee2e2",
      RTO: "#fee2e2",
      CANCELLED: "#f1f5f9",
    };
    return colors[status] || "#ffffff";
  };

  const getStatusTextColor = (status) => {
    const colors = {
      NEW: "#92400e",
      READY_FOR_PICKUP: "#065f46",
      SHIPPED: "#1e3a8a",
      OUT_FOR_DELIVERY: "#1e40af",
      DELIVERED: "#065f46",
      NDR: "#991b1b",
      RTO: "#991b1b",
      CANCELLED: "#475569",
    };
    return colors[status] || "#475569";
  };

  if (fetching) {
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <FaSpinner size={40} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "16px", color: "#64748b" }}>Loading order details...</p>
          </div>
        </div>
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
          padding: "30px 35px",
          overflowY: "auto",
        }}
      >
        {/* Back Button & Heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => navigate("/admin/orders")}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              fontSize: "14px",
              fontWeight: "500",
              color: "#475569",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#f97316";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <FaArrowLeft size={14} /> Back
          </button>

          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Edit Order
            </h1>
            <p style={{ color: "#64748b", marginTop: "2px", fontSize: "14px" }}>
              Update customer, product and courier details
            </p>
          </div>
        </div>

        {/* Premium Order Information Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
            border: "1px solid #fed7aa",
            borderRadius: "14px",
            padding: "18px 24px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(249,115,22,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {/* Order ID */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(249,115,22,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTag size={14} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Order ID
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#9a3412" }}>#{id.slice(0, 12)}...</div>
              </div>
            </div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(249,115,22,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaBox size={14} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Status
                </div>
                <span
                  style={{
                    background: getStatusColor(formData.status),
                    color: getStatusTextColor(formData.status),
                    padding: "2px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-block",
                  }}
                >
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Payment */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(249,115,22,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaCreditCard size={14} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Payment
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#9a3412" }}>{formData.paymentMode}</div>
              </div>
            </div>

            {/* Courier */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(249,115,22,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTruck size={14} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Courier
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: formData.courierPartner ? "#9a3412" : "#94a3b8" }}>
                  {formData.courierPartner || "Not Assigned"}
                </div>
              </div>
            </div>
          </div>

          {/* Amount - Highlighted */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              padding: "8px 20px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}
          >
            <FaRupeeSign size={16} color="#fff" />
            <div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Amount
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>₹{formData.amount || 0}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={updateOrder}
          style={{
            background: "#fff",
            padding: "28px 30px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "grid",
            gap: "18px",
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          {/* Customer Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "3px", height: "20px", background: "#f97316", borderRadius: "2px" }} />
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Customer Details
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Customer Name"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Customer Phone"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <input
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="Customer Email"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                rows="2"
                placeholder="Customer Address"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Product Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "3px", height: "20px", background: "#f97316", borderRadius: "2px" }} />
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Product Details
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Product Name"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SKU"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount (₹)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Dimensions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "3px", height: "20px", background: "#f97316", borderRadius: "2px" }} />
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Dimensions & Weight
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Length (cm)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                type="number"
                name="breadth"
                value={formData.breadth}
                onChange={handleChange}
                placeholder="Breadth (cm)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />

              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height (cm)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Payment & Courier */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "3px", height: "20px", background: "#f97316", borderRadius: "2px" }} />
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Payment & Courier
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="PREPAID">PREPAID</option>
                <option value="COD">COD</option>
              </select>

              <input
                type="number"
                name="shippingCharge"
                value={formData.shippingCharge}
                onChange={handleChange}
                placeholder="Shipping Charge (₹)"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  background: "#fafbfc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#fafbfc";
                }}
              />
            </div>

            <select
              name="courierPartner"
              value={formData.courierPartner}
              onChange={handleChange}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                background: "#fafbfc",
                marginTop: "12px",
                width: "100%",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#f97316";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">Select Courier</option>
              <option value="DTDC">DTDC</option>
              <option value="Delhivery">Delhivery</option>
              <option value="XpressBees">XpressBees</option>
              <option value="Ecom Express">Ecom Express</option>
              <option value="Blue Dart">Blue Dart</option>
            </select>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Status & Notes */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "3px", height: "20px", background: "#f97316", borderRadius: "2px" }} />
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
                Status & Notes
              </h3>
            </div>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                background: "#fafbfc",
                width: "100%",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#f97316";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="NEW">NEW</option>
              <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="NDR">NDR</option>
              <option value="RTO">RTO</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              rows="3"
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginTop: "12px",
                background: "#fafbfc",
                width: "100%",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#f97316";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.08)";
                e.currentTarget.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#fafbfc";
              }}
            />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 32px",
                background: loading ? "#94a3b8" : "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
                transition: "all 0.3s",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#ea580c";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#f97316";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Order
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              style={{
                padding: "12px 32px",
                background: "#fff",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#f97316";
                e.currentTarget.style.color = "#f97316";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#475569";
              }}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrder;