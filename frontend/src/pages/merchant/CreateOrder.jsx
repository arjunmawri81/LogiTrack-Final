import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateOrder = () => {
  const navigate = useNavigate();

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
    quantity: "",

    weight: "",
    length: "",
    breadth: "",
    height: "",

    paymentMode: "PREPAID",

    amount: "",
    shippingCharge: "",

    courierPartner: "",
    notes: "",
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
            fontSize: "36px",
            fontWeight: "800",
            marginBottom: "10px",
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
          Create a new shipment order
        </p>

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "1000px",
            boxShadow:
              "0 10px 25px rgba(15,23,42,.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* CUSTOMER DETAILS */}

            <h2 style={sectionTitle}>
              Customer Details
            </h2>

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

            <input
              type="email"
              name="customerEmail"
              placeholder="Customer Email"
              value={formData.customerEmail}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* ADDRESS */}

            <h2 style={sectionTitle}>
              Address Details
            </h2>

            <textarea
              name="customerAddress"
              placeholder="Customer Address"
              value={formData.customerAddress}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                minHeight: "100px",
              }}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* PRODUCT */}

            <h2 style={sectionTitle}>
              Product Details
            </h2>

            <input
              type="text"
              name="productName"
              placeholder="Product Name"
              value={formData.productName}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="text"
              name="sku"
              placeholder="SKU"
              value={formData.sku}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* PACKAGE */}

            <h2 style={sectionTitle}>
              Package Details
            </h2>

            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="number"
              name="length"
              placeholder="Length"
              value={formData.length}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="number"
              name="breadth"
              placeholder="Breadth"
              value={formData.breadth}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="number"
              name="height"
              placeholder="Height"
              value={formData.height}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* PAYMENT */}

            <h2 style={sectionTitle}>
              Payment & Shipping
            </h2>

            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="PREPAID">
                PREPAID
              </option>

              <option value="COD">
                COD
              </option>
            </select>

            <input
              type="number"
              name="amount"
              placeholder="Order Amount"
              value={formData.amount}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="number"
              name="shippingCharge"
              placeholder="Shipping Charge"
              value={formData.shippingCharge}
              onChange={handleChange}
              style={inputStyle}
            />

            <select
              name="courierPartner"
              value={formData.courierPartner}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">
                Select Courier
              </option>

              <option value="DTDC">
                DTDC
              </option>

              <option value="Delhivery">
                Delhivery
              </option>

              <option value="XpressBees">
                XpressBees
              </option>
            </select>

            {/* NOTES */}

            <h2 style={sectionTitle}>
              Additional Notes
            </h2>

            <textarea
              name="notes"
              placeholder="Notes"
              value={formData.notes}
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "100px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
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

const sectionTitle = {
  marginBottom: "15px",
  marginTop: "25px",
  color: "#111827",
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

const buttonStyle = {
  background: "#f97316",
  color: "#fff",
  border: "none",
  padding: "14px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "20px",
};

export default CreateOrder;