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
      padding: 0,
      marginBottom: "20px",
      overflow: "hidden",
    },

    cardHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e2e8f0",
      background: "#fff",
    },

    cardTitle: {
      margin: 0,
      color: "#0f172a",
      fontSize: "18px",
      fontWeight: "700",
    },

    inputWrapper: {
      padding: "24px",
    },

    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      marginBottom: "15px",
      outline: "none",
      fontSize: "14px",
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
      transition: "all 0.2s ease",
    },

    tableHead: {
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
    },

    th: {
      padding: "16px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "600",
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    td: {
      padding: "18px 16px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
      background: "#ffffff",
    },

    tableWrapper: {
      overflowX: "auto",
      padding: "0",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "600px",
    },

    typeBadge: (type) => ({
      color: type === "CREDIT" ? "#16a34a" : "#dc2626",
      fontWeight: "700",
      fontSize: "13px",
      background: type === "CREDIT" ? "#dcfce7" : "#fee2e2",
      padding: "4px 12px",
      borderRadius: "100px",
      display: "inline-block",
    }),
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
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          My Wallet
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "24px",
          }}
        >
          Manage your wallet and transactions
        </p>

        {/* Balance */}
        <div style={s.balanceCard}>
          <div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              Available Balance
            </p>

            <h2
              style={{
                marginTop: "10px",
                fontSize: "42px",
                fontWeight: "700",
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
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Credit
            </h4>

            <h2 style={{ color: "#16a34a", fontWeight: "700" }}>
              ₹{summary.totalCredit}
            </h2>
          </div>

          <div style={s.summaryCard}>
            <h4
              style={{
                color: "#64748b",
                marginBottom: "10px",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Debit
            </h4>

            <h2 style={{ color: "#dc2626", fontWeight: "700" }}>
              ₹{summary.totalDebit}
            </h2>
          </div>

          <div style={s.summaryCard}>
            <h4
              style={{
                color: "#64748b",
                marginBottom: "10px",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Transactions
            </h4>

            <h2 style={{ color: "#0f172a", fontWeight: "700" }}>
              {summary.totalTransactions}
            </h2>
          </div>
        </div>

        {/* Recharge */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Recharge Wallet</h3>
          </div>
          <div style={s.inputWrapper}>
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
        </div>

        {/* Transactions */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Recent Transactions</h3>
          </div>

          <div style={s.tableWrapper}>
            <table style={s.table}>
              <thead>
                <tr style={s.tableHead}>
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
                          ).toLocaleDateString('en-GB')}
                        </td>

                        <td style={s.td}>
                          <span style={s.typeBadge(t.type)}>
                            {t.type}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>
                            ₹{t.amount}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={{ color: "#475569" }}>
                            {t.description}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
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