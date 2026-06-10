import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./CreateShipment.css";

const CreateShipment = () => {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    orderId: "",
    courier: "",
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/shipments",
        formData
      );

      alert(
        res.data.message ||
          "Shipment Created Successfully"
      );

      setFormData({
        orderId: "",
        courier: "",
      });
    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Shipment Creation Failed"
      );
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="shipment-content">
        <div className="page-header">
          <h1>Create Shipment</h1>
        </div>

        <form
          className="shipment-form"
          onSubmit={handleSubmit}
        >
          <div className="form-card">
            <h2>Select Order</h2>

            <select
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Order
              </option>

              {orders.map((order) => (
                <option
                  key={order._id}
                  value={order._id}
                >
                  {order.customerName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-card">
            <h2>Select Courier</h2>

            <select
              name="courier"
              value={formData.courier}
              onChange={handleChange}
              required
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
          </div>

          <button
            type="submit"
            className="submit-btn"
          >
            Create Shipment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;