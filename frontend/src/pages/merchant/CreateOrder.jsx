import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateOrder = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post(
        "/orders",
        formData
      );

      alert(
        res.data.message ||
          "Order Created Successfully"
      );

      navigate("/merchant/orders");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Order Creation Failed"
      );
    } finally {
      setLoading(false);
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
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Create Order
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Add a new customer order
        </p>

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "800px",
            boxShadow:
              "0 10px 25px rgba(15,23,42,.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="customerName"
              placeholder="Customer Name"
              value={formData.customerName}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="text"
              name="customerPhone"
              placeholder="Customer Phone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <textarea
              name="customerAddress"
              placeholder="Customer Address"
              value={formData.customerAddress}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                minHeight: "120px",
              }}
            />

            <input
              type="number"
              name="amount"
              placeholder="Order Amount"
              value={formData.amount}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Creating..."
                : "Create Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: "15px",
};

export default CreateOrder;