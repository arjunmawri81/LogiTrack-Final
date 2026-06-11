import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { FaWallet, FaPlus } from "react-icons/fa";

const Wallet = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWallet(res.data.wallet);
    } catch (error) { console.log(error); }
  };

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "30px", overflowX: "hidden" },
    card: { background: "#ffffff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "25px" },
    balanceCard: { background: "#0f172a", color: "#ffffff", padding: "30px", borderRadius: "16px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    btn: { background: "#f97316", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" },
    th: { textAlign: "left", padding: "16px", background: "#f1f5f9", color: "#1e293b", fontSize: "12px", textTransform: "uppercase" }
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>
      
      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "20px" }}>My Wallet</h1>

        {/* Balance Card - Dark Premium Look */}
        <div style={s.balanceCard}>
          <div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>Available Balance</p>
            <h2 style={{ margin: "5px 0 0 0", fontSize: "36px" }}>₹{wallet.balance.toFixed(2)}</h2>
          </div>
          <button style={s.btn}><FaPlus /> Recharge</button>
        </div>

        {/* Transactions Table */}
        <div style={{ ...s.card, padding: 0, overflowX: "auto" }}>
          <h2 style={{ padding: "20px", margin: 0, fontSize: "18px" }}>Recent Transactions</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                {["Date", "Type", "Amount", "Description"].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {wallet.transactions?.length > 0 ? wallet.transactions.map((t) => (
                <tr key={t._id}>
                  <td style={s.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <span style={{ color: t.type === "CREDIT" ? "#166534" : "#991b1b", fontWeight: "600" }}>{t.type}</span>
                  </td>
                  <td style={s.td}>₹{t.amount}</td>
                  <td style={s.td}>{t.description}</td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No Transactions</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Wallet;