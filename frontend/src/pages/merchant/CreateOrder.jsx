import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    notes: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const length = parseFloat(formData.length);
    const breadth = parseFloat(formData.breadth);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (!weight || weight <= 0) {
      alert("Weight is mandatory and must be greater than 0");
      setLoading(false);
      return;
    }

    if (!length || length <= 0 || !breadth || breadth <= 0 || !height || height <= 0) {
      alert("Length, Breadth, and Height dimensions are mandatory and must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      await api.post("/orders", formData);
      alert("Order Created Successfully");
      navigate("/merchant/orders", { replace: true });
    } catch (error) {
      alert(error?.response?.data?.message || "Order Creation Failed");
    } finally {
      setLoading(false);
    }
  };

  // Grid styles using inline
  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: "280px",
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowX: "hidden",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Create Order
          </h1>
          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Create and manage customer orders
          </p>
        </div>
        
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div style={gridStyles}>
            {/* Customer Details Section */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Customer Details</h2>
            </div>
            
            <input 
              name="customerName" 
              placeholder="Customer Name" 
              value={formData.customerName} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
            <input 
              name="customerPhone" 
              placeholder="Phone Number" 
              value={formData.customerPhone} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
            
            <input 
              name="customerEmail" 
              placeholder="Email Address" 
              value={formData.customerEmail} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <input 
              name="pincode" 
              placeholder="Pincode" 
              value={formData.pincode} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            
            <input 
              name="city" 
              placeholder="City" 
              value={formData.city} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            <input 
              name="state" 
              placeholder="State" 
              value={formData.state} 
              onChange={handleChange} 
              style={inputStyle} 
            />
            
            <textarea 
              name="customerAddress" 
              placeholder="Full Address" 
              value={formData.customerAddress} 
              onChange={handleChange} 
              required 
              style={{...inputStyle, ...fullWidthStyle}}
              rows="3"
            />

            {/* Product & Package Section */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Product & Package</h2>
            </div>
            
            <input 
              name="productName" 
              placeholder="Product Name" 
              value={formData.productName} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
            <input 
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
            <input 
              type="number" 
              name="weight" 
              placeholder="Weight (kg) *" 
              value={formData.weight} 
              onChange={handleChange} 
              required
              min="0.01"
              step="any"
              style={inputStyle} 
            />
            
            <input 
              type="number" 
              name="length" 
              placeholder="Length (cm) *" 
              value={formData.length} 
              onChange={handleChange} 
              required
              min="0.01"
              step="any"
              style={inputStyle} 
            />
            <input 
              type="number" 
              name="breadth" 
              placeholder="Breadth (cm) *" 
              value={formData.breadth} 
              onChange={handleChange} 
              required
              min="0.01"
              step="any"
              style={inputStyle} 
            />
            
            <input 
              type="number" 
              name="height" 
              placeholder="Height (cm) *" 
              value={formData.height} 
              onChange={handleChange} 
              required
              min="0.01"
              step="any"
              style={{...inputStyle, ...fullWidthStyle}}
            />
            
            {/* Payment Details Section */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Payment Details</h2>
            </div>
            
            <input 
              type="number" 
              name="amount" 
              placeholder="Order Amount" 
              value={formData.amount} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
            <select 
              name="paymentMode" 
              value={formData.paymentMode} 
              onChange={handleChange} 
              style={inputStyle}
            >
              <option value="PREPAID">PREPAID</option>
              <option value="COD">COD</option>
            </select>
            
            <textarea
              name="notes"
              placeholder="Order Notes (Optional)"
              value={formData.notes}
              onChange={handleChange}
              style={{...inputStyle, ...fullWidthStyle}}
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              padding: "15px 30px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "17px",
              height: "55px",
              marginTop: "20px",
              width: "100%",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "#ea580c";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "#f97316";
              }
            }}
          >
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

const sectionTitle = { 
  fontSize: "18px", 
  color: "#1e293b", 
  margin: "10px 0",
  fontWeight: "600",
};

const inputStyle = { 
  width: "100%", 
  padding: "12px", 
  borderRadius: "10px", 
  border: "1px solid #e2e8f0", 
  fontSize: "14px",
  boxSizing: "border-box",
  transition: "border-color 0.3s ease",
};

export default CreateOrder;