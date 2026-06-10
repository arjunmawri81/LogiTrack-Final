import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./Wallet.css";

const Wallet = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    transactions: [],
  });

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await api.get("/wallet");

      setWallet(response.data.wallet);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="wallet-container">
        <h1>Wallet</h1>

        <div className="balance-card">
          <h2>Available Balance</h2>

          <p>
            ₹{wallet.balance}
          </p>

          <button className="recharge-btn">
            Recharge Wallet
          </button>
        </div>

        <div className="transactions-card">
          <h2>Recent Transactions</h2>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {wallet.transactions?.length >
              0 ? (
                wallet.transactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction._id
                      }
                    >
                      <td>
                        {new Date(
                          transaction.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {
                          transaction.type
                        }
                      </td>

                      <td>
                        ₹
                        {
                          transaction.amount
                        }
                      </td>

                      <td>
                        {
                          transaction.description
                        }
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
                    No Transactions
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

export default Wallet;