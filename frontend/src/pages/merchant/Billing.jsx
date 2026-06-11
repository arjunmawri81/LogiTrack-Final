import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/billing");
      setInvoices(res.data.invoices || []);
    } catch (error) { console.log(error); }
  };

  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paid = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "PENDING").reduce((sum, i) => sum + i.amount, 0);

  const s = {
    container: { display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    main: { flex: 1, padding: "30px", overflowX: "hidden" },
    card: { background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", flex: 1, minWidth: "200px" },
    statTitle: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", margin: 0 },
    statVal: { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "5px 0 0 0" },
    th: { textAlign: "left", padding: "16px", background: "#f1f5f9", color: "#1e293b", fontSize: "12px", textTransform: "uppercase" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", color: "#334155" }
  };

  return (
    <div style={s.container}>
      <div style={{ width: "280px", flexShrink: 0 }}><Sidebar /></div>

      <main style={s.main}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "25px" }}>Billing & Invoices</h1>

        {/* Summary Grid */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          {[ {title: "Total Billing", val: total}, {title: "Paid", val: paid}, {title: "Pending", val: pending} ].map((stat, i) => (
            <div key={i} style={s.card}>
              <h3 style={s.statTitle}>{stat.title}</h3>
              <p style={s.statVal}>₹{stat.val.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div style={{ ...s.card, padding: 0, overflowX: "auto" }}>
          <h2 style={{ padding: "20px", margin: 0, fontSize: "18px" }}>Invoice History</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                {["Invoice ID", "Date", "Amount", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={s.td}>{inv.invoiceNumber}</td>
                  <td style={s.td}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>₹{inv.amount.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={{ 
                      background: inv.status === "PAID" ? "#dcfce7" : "#fef3c7", 
                      color: inv.status === "PAID" ? "#166534" : "#92400e",
                      padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" 
                    }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No Invoices Found</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Billing;