import SuperAdminLayout from "./SuperAdminLayout";

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
      <h1>Order Management 📦</h1>

      <table className="table">
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
              <td>{order.id}</td>
              <td>{order.merchant}</td>
              <td>₹{order.amount}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SuperAdminLayout>
  );
};

export default OrderManagement;