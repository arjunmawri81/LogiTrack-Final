import SuperAdminLayout from "./SuperAdminLayout";
import "./OrderManagement.css";

const OrderManagement = () => {
  const orders = [
    {
      id: "ORD123",
      merchant: "ABC Pvt Ltd",
      amount: 500,
      status: "Delivered",
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="order-mgmt-container">
        <div className="page-header">
          <h1 className="page-title">Order Management 📦</h1>
          <p className="page-subtitle">Platform order tracking and management</p>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: "600", color: "#0f172a" }}>{order.id}</td>
                  <td>{order.merchant}</td>
                  <td style={{ fontWeight: "600" }}>₹{order.amount}</td>
                  <td>
                    <span className="status-badge">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default OrderManagement;