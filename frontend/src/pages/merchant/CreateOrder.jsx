import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  
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
    warehouseId: "",
    insuranceEnabled: false,
    sendWhatsAppNotification: true,
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      const activeW = (res.data.warehouses || []).filter((w) => w.isActive);
      setWarehouses(activeW);
      if (activeW.length > 0) {
        setFormData((prev) => ({ ...prev, warehouseId: activeW[0]._id }));
      }
    } catch (err) {
      setWarehouses([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

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
            Create and manage customer orders with warehouse, insurance, and notification preferences
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
            {/* Pickup & Warehouse Settings */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Pickup Warehouse Location</h2>
            </div>

            <div style={fullWidthStyle}>
              <label style={labelStyle}>Select Pickup Warehouse *</label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                required
                style={{
                  ...inputStyle,
                  background: "#f8fafc",
                  fontWeight: "600",
                  borderColor: "#cbd5e1"
                }}
              >
                <option value="">-- Select Pickup Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    🏬 {w.name} ({w.city}, {w.pincode}) - {w.contactPhone || w.phone || 'Active'}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details Section */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Customer Details</h2>
            </div>
            
            <input 
              name="customerName" 
              placeholder="Customer Name *" 
              value={formData.customerName} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
            <input 
              name="customerPhone" 
              placeholder="Phone Number *" 
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
              placeholder="Pincode *" 
              value={formData.pincode} 
              onChange={handleChange} 
              required
              style={inputStyle} 
            />
            
            <input 
              name="city" 
              placeholder="City *" 
              value={formData.city} 
              onChange={handleChange} 
              required
              style={inputStyle} 
            />
            <input 
              name="state" 
              placeholder="State *" 
              value={formData.state} 
              onChange={handleChange} 
              required
              style={inputStyle} 
            />
            
            <textarea 
              name="customerAddress" 
              placeholder="Full Delivery Address *" 
              value={formData.customerAddress} 
              onChange={handleChange} 
              required 
              style={{...inputStyle, ...fullWidthStyle}}
              rows="3"
            />

            {/* Product & Package Section */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Product & Package Details</h2>
            </div>
            
            <input 
              name="productName" 
              placeholder="Product Name *" 
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
              <h2 style={sectionTitle}>Payment & Order Value</h2>
            </div>
            
            <input 
              type="number" 
              name="amount" 
              placeholder="Order Value (₹) *" 
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

            {/* Insurance & Notification Preferences */}
            <div style={fullWidthStyle}>
              <h2 style={sectionTitle}>Insurance & Notification Options</h2>
            </div>

            <div
              style={{
                ...fullWidthStyle,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                <div>
                  <span>🛡️ Enable Parcel Loss & Damage Insurance Cover (₹12)</span>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>
                    Protects package against lost or damaged transit shipments up to ₹5,000.
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="insuranceEnabled"
                  checked={formData.insuranceEnabled}
                  onChange={handleChange}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
              </label>

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }} />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                <div>
                  <span>📱 Send Instant WhatsApp & SMS Delivery Tracking Updates</span>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>
                    Sends live tracking link and delivery status updates to customer automatically.
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="sendWhatsAppNotification"
                  checked={formData.sendWhatsAppNotification}
                  onChange={handleChange}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
              </label>
            </div>
            
            <textarea
              name="notes"
              placeholder="Order Notes (Optional)"
              value={formData.notes}
              onChange={handleChange}
              style={{...inputStyle, ...fullWidthStyle}}
              rows="2"
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
  fontSize: "16px", 
  color: "#1e293b", 
  margin: "12px 0 6px 0",
  fontWeight: "700",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "6px",
  display: "block",
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