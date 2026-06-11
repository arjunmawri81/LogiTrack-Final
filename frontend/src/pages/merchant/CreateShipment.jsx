import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const CreateShipment = () => {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({ orderId: "", courier: "" });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data.orders || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post("/shipments", formData); alert("Success!"); } 
    catch (err) { alert("Failed"); }
  };

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>
      <div style={{ flex: 1, padding: "20px" }}>
        <form onSubmit={handleSubmit} style={{ background: "#ffffff", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", maxWidth: "500px", margin: "auto" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Create Shipment</h2>
          <select name="orderId" onChange={(e) => setFormData({...formData, orderId: e.target.value})} style={{ width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <option value="">Select Order</option>
            {orders.map(o => <option key={o._id} value={o._id}>{o.customerName}</option>)}
          </select>
          <select name="courier" onChange={(e) => setFormData({...formData, courier: e.target.value})} style={{ width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <option value="">Select Courier</option>
            <option value="DTDC">DTDC</option>
            <option value="Delhivery">Delhivery</option>
          </select>
          <button type="submit" style={{ width: "100%", background: "#f97316", color: "white", padding: "12px", borderRadius: "8px", border: "none" }}>Submit</button>
        </form>
      </div>
    </div>
  );
};
export default CreateShipment;