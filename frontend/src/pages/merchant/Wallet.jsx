import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaWallet, FaPlus } from "react-icons/fa";
import "./Wallet.css";

const Wallet = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    transactions: [],
  });

  const [amount, setAmount] = useState("");

  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    fetchWallet();
    fetchSummary();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWallet(res.data.wallet);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/wallet/summary");

      setSummary({
        totalCredit: res.data.totalCredit || 0,
        totalDebit: res.data.totalDebit || 0,
        totalTransactions: res.data.totalTransactions || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const rechargeWallet = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      await api.post("/wallet/recharge", {
        amount: Number(amount),
      });

      alert("Wallet Recharged Successfully");

      setAmount("");

      fetchWallet();
      fetchSummary();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Recharge Failed"
      );
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-sidebar-wrapper">
        <Sidebar />
      </div>

      <main className="wallet-main">
        <h1 className="wallet-title">My Wallet</h1>
        <p className="wallet-subtitle">
          Manage your wallet and transactions
        </p>

        {/* Balance */}
        <div className="wallet-balance-card">
          <div>
            <p className="wallet-balance-label">
              Available Balance
            </p>

            <h2 className="wallet-balance-amount">
              ₹{Number(wallet.balance || 0).toFixed(2)}
            </h2>
          </div>

          <FaWallet className="wallet-balance-icon" />
        </div>

        {/* Summary Cards */}
        <div className="wallet-summary-grid">
          <div className="wallet-summary-card">
            <h4 className="wallet-summary-label">
              Total Credit
            </h4>

            <h2 className="wallet-summary-value-green">
              ₹{Number(summary.totalCredit || 0).toFixed(2)}
            </h2>
          </div>

          <div className="wallet-summary-card">
            <h4 className="wallet-summary-label">
              Total Debit
            </h4>

            <h2 className="wallet-summary-value-red">
              ₹{Number(summary.totalDebit || 0).toFixed(2)}
            </h2>
          </div>

          <div className="wallet-summary-card">
            <h4 className="wallet-summary-label">
              Transactions
            </h4>

            <h2 className="wallet-summary-value-dark">
              {summary.totalTransactions}
            </h2>
          </div>
        </div>

        {/* Recharge */}
        <div className="wallet-card">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Recharge Wallet</h3>
          </div>
          <div className="wallet-input-wrapper">
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="wallet-input"
            />

            <button
              onClick={rechargeWallet}
              className="wallet-btn"
            >
              <FaPlus />
              Recharge Now
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="wallet-card">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Recent Transactions</h3>
          </div>

          <div className="wallet-table-wrapper">
            <table className="wallet-table">
              <thead>
                <tr className="wallet-table-head">
                  <th className="wallet-th">Date</th>
                  <th className="wallet-th">Type</th>
                  <th className="wallet-th">Amount</th>
                  <th className="wallet-th">Description</th>
                </tr>
              </thead>

              <tbody>
                {wallet.transactions?.length > 0 ? (
                  [...wallet.transactions]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    )
                    .map((t, index) => (
                      <tr key={index}>
                        <td className="wallet-td">
                          {new Date(
                            t.createdAt
                          ).toLocaleDateString('en-GB')}
                        </td>

                        <td className="wallet-td">
                          <span className={`wallet-type-badge ${t.type === 'CREDIT' ? 'wallet-type-credit' : 'wallet-type-debit'}`}>
                            {t.type}
                          </span>
                        </td>

                        <td className="wallet-td">
                          <span className="wallet-amount">
                            ₹{Number(t.amount || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="wallet-td">
                          <span className="wallet-description">
                            {t.description}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="wallet-empty"
                    >
                      No Transactions Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;