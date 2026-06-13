import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateShipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOrder = location.state?.order;

  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    orderId: selectedOrder?._id || "",
    courier: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/shipments", formData);
      alert("Shipment Created Successfully");
      navigate("/merchant/shipments");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>
      <div style={{ flex: 1, padding: "30px" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            maxWidth: "500px",
            margin: "auto",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "25px", color: "#0f172a" }}>Create Shipment</h2>

          {selectedOrder && (
            <div
              style={{
                background: "#fff7ed",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                border: "1px solid #fdba74",
              }}
            >
              <strong>Selected Order:</strong> {selectedOrder.orderNumber || selectedOrder._id.slice(-6)} - {selectedOrder.customerName}
            </div>
          )}
          
          <select
            name="orderId"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            style={{ width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            required
          >
            <option value="">Select Order</option>
            {orders.map((o) => (
              <option key={o._id} value={o._id}>
                {`${o.orderNumber || o._id.slice(-6)} - ${o.customerName}`}
              </option>
            ))}
          </select>

          <select
            name="courier"
            onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
            style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            required
          >
            <option value="">Select Courier</option>
            <option value="DTDC">DTDC</option>
            <option value="Delhivery">Delhivery</option>
            <option value="XpressBees">XpressBees</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#fdba74" : "#f97316",
              color: "white",
              padding: "14px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Shipment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;