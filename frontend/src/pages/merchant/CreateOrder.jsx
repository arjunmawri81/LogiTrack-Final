import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "", customerPhone: "", customerEmail: "", customerAddress: "",
    city: "", state: "", pincode: "", productName: "", sku: "", quantity: 1,
    weight: "", length: "", breadth: "", height: "", paymentMode: "PREPAID",
    amount: "", shippingCharge: "", courierPartner: "", notes: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "30px", maxWidth: "1200px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "20px" }}>Create Order</h1>
        
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            <div style={{ gridColumn: "span 2" }}><h2 style={sectionTitle}>Customer Details</h2></div>
            <input name="customerName" placeholder="Name" value={formData.customerName} onChange={handleChange} required style={inputStyle} />
            <input name="customerPhone" placeholder="Phone" value={formData.customerPhone} onChange={handleChange} required style={inputStyle} />
            <input name="customerEmail" placeholder="Email" value={formData.customerEmail} onChange={handleChange} style={inputStyle} />
            <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} style={inputStyle} />
            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} style={inputStyle} />
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} style={inputStyle} />
            <textarea name="customerAddress" placeholder="Full Address" value={formData.customerAddress} onChange={handleChange} required style={{...inputStyle, gridColumn: "span 2"}} />

            <div style={{ gridColumn: "span 2" }}><h2 style={sectionTitle}>Product & Package</h2></div>
            <input name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} required style={inputStyle} />
            <input name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} style={inputStyle} />
            <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} style={inputStyle} />
            <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} style={inputStyle} />
            <input type="number" name="length" placeholder="Length (cm)" value={formData.length} onChange={handleChange} style={inputStyle} />
            <input type="number" name="breadth" placeholder="Breadth (cm)" value={formData.breadth} onChange={handleChange} style={inputStyle} />
            <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} style={inputStyle} />
            
            <div style={{ gridColumn: "span 2" }}><h2 style={sectionTitle}>Payment & Courier</h2></div>
            <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
              <option value="PREPAID">PREPAID</option>
              <option value="COD">COD</option>
            </select>
            <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required style={inputStyle} />
            <select name="courierPartner" value={formData.courierPartner} onChange={handleChange} style={inputStyle}>
              <option value="">Select Courier</option>
              <option value="DTDC">DTDC</option>
              <option value="Delhivery">Delhivery</option>
              <option value="XpressBees">XpressBees</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

const sectionTitle = { fontSize: "18px", color: "#1e293b", margin: "10px 0" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px" };
const buttonStyle = { background: "#f97316", color: "#fff", border: "none", padding: "15px 30px", borderRadius: "12px", cursor: "pointer", fontWeight: "600", marginTop: "20px", width: "100%" };

export default CreateOrder;