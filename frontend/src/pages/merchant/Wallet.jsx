import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaWallet, FaPlus } from "react-icons/fa";

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

  const s = {
    container: {
      display: "flex",
      background: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
    },

    main: {
      flex: 1,
      padding: "30px",
    },

    balanceCard: {
      background:
        "linear-gradient(135deg,#0f172a,#1e293b)",
      color: "#fff",
      padding: "30px",
      borderRadius: "16px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    summaryCard: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      textAlign: "center",
    },

    card: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "25px",
      marginBottom: "20px",
    },

    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      marginBottom: "15px",
      outline: "none",
    },

    btn: {
      background: "#f97316",
      color: "#fff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    th: {
      padding: "14px",
      background: "#f1f5f9",
      textAlign: "left",
      fontSize: "12px",
      textTransform: "uppercase",
    },

    td: {
      padding: "14px",
      borderBottom: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      <main style={s.main}>
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "20px",
          }}
        >
          My Wallet
        </h1>

        {/* Balance */}
        <div style={s.balanceCard}>
          <div>
            <p style={{ margin: 0 }}>
              Available Balance
            </p>

            <h2
              style={{
                marginTop: "10px",
                fontSize: "42px",
              }}
            >
              ₹{wallet.balance || 0}
            </h2>
          </div>

          <FaWallet size={50} />
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={s.summaryCard}>
            <h4
              style={{
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Total Credit
            </h4>

            <h2 style={{ color: "#16a34a" }}>
              ₹{summary.totalCredit}
            </h2>
          </div>

          <div style={s.summaryCard}>
            <h4
              style={{
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Total Debit
            </h4>

            <h2 style={{ color: "#dc2626" }}>
              ₹{summary.totalDebit}
            </h2>
          </div>

          <div style={s.summaryCard}>
            <h4
              style={{
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Transactions
            </h4>

            <h2 style={{ color: "#0f172a" }}>
              {summary.totalTransactions}
            </h2>
          </div>
        </div>

        {/* Recharge */}
        <div style={s.card}>
          <h3>Recharge Wallet</h3>

          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            style={s.input}
          />

          <button
            onClick={rechargeWallet}
            style={s.btn}
          >
            <FaPlus />
            Recharge Now
          </button>
        </div>

        {/* Transactions */}
        <div style={s.card}>
          <h3>Recent Transactions</h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={s.th}>Date</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Description</th>
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
                      <td style={s.td}>
                        {new Date(
                          t.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td style={s.td}>
                        <span
                          style={{
                            color:
                              t.type === "CREDIT"
                                ? "#16a34a"
                                : "#dc2626",
                            fontWeight: "700",
                          }}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td style={s.td}>
                        ₹{t.amount}
                      </td>

                      <td style={s.td}>
                        {t.description}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No Transactions Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Wallet;