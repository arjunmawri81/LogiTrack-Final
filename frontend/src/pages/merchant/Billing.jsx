import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Billing.css";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/billing");

      setInvoices(
        response.data.invoices || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  const totalBilling = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );

  const paidBilling = invoices
    .filter(
      (invoice) =>
        invoice.status === "PAID"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const pendingBilling = invoices
    .filter(
      (invoice) =>
        invoice.status === "PENDING"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="billing-container">
        <h1>Billing & Invoices</h1>

        <div className="billing-summary">

          <div className="bill-card">
            <h3>Total Billing</h3>
            <p>₹{totalBilling}</p>
          </div>

          <div className="bill-card">
            <h3>Paid</h3>
            <p>₹{paidBilling}</p>
          </div>

          <div className="bill-card">
            <h3>Pending</h3>
            <p>₹{pendingBilling}</p>
          </div>

        </div>

        <div className="invoice-table">

          <h2>Invoices</h2>

          <table>

            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {invoices.length > 0 ? (
                invoices.map(
                  (invoice) => (
                    <tr
                      key={invoice._id}
                    >
                      <td>
                        {
                          invoice.invoiceNumber
                        }
                      </td>

                      <td>
                        {new Date(
                          invoice.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        ₹{invoice.amount}
                      </td>

                      <td>
                        {invoice.status}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    No Invoices Found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
};

export default Billing;