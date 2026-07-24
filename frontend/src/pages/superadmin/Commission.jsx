import { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import "./Commission.css";

const Commission = () => {
  const [commission, setCommission] = useState({
    totalRevenue: 0,
    commissionRate: 10,
    totalCommission: 0,
    monthlyCommission: 0,
    todayCommission: 0,
    activeMerchants: 0,
    netRevenue: 0,
  });

  const [merchantBreakdown, setMerchantBreakdown] = useState([]);

  useEffect(() => {
    fetchCommission();
  }, []);

  const fetchCommission = async () => {
    try {
      const res = await api.get("/admin/commission");
      setCommission({
        totalRevenue: res.data.totalRevenue || 0,
        commissionRate: res.data.commissionRate || 10,
        totalCommission: res.data.totalCommission || 0,
        monthlyCommission: res.data.monthlyCommission || 0,
        todayCommission: res.data.todayCommission || 0,
        activeMerchants: res.data.activeMerchants || 0,
        netRevenue: res.data.netRevenue || 0,
      });
      setMerchantBreakdown(res.data.merchantBreakdown || []);
    } catch (error) {
      console.error("Error retrieving platform commission metrics:", error);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="commission-container">
        
        {/* HEADER SECTION */}
        <div className="page-header">
          <h1 className="page-title">
            Commission Management
          </h1>
          <p className="page-subtitle">
            Platform commission tracking and earnings analytics
          </p>
        </div>

        {/* ANALYTICS KPI CARDS GRID */}
        <div className="kpi-grid">
          <div className="card-blue">
            <div className="card-label">
              Total Revenue
            </div>
            <div className="card-value">
              ₹{commission.totalRevenue.toLocaleString()}
            </div>
          </div>

          <div className="card-green">
            <div className="card-label">
              Net Revenue
            </div>
            <div className="card-value">
              ₹{commission.netRevenue?.toLocaleString()}
            </div>
          </div>

          <div className="card-orange">
            <div className="card-label">
              Total Commission
            </div>
            <div className="card-value">
              ₹{commission.totalCommission.toLocaleString()}
            </div>
          </div>

          <div className="card-blue">
            <div className="card-label">
              Monthly Commission
            </div>
            <div className="card-value">
              ₹{commission.monthlyCommission.toLocaleString()}
            </div>
          </div>

          <div className="card-green">
            <div className="card-label">
              Today's Commission
            </div>
            <div className="card-value">
              ₹{commission.todayCommission.toLocaleString()}
            </div>
          </div>

          <div className="card-orange">
            <div className="card-label">
              Active Merchants
            </div>
            <div className="card-value">
              {commission.activeMerchants}
            </div>
          </div>
        </div>

        {/* MERCHANT COMMISSION TABLE */}
        <div className="table-card">
          <h2 className="table-title">
            Merchant Commission Breakdown
          </h2>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Merchant</th>
                  <th style={{ textAlign: "center" }}>Orders</th>
                  <th style={{ textAlign: "right" }}>Revenue</th>
                  <th style={{ textAlign: "right" }}>Commission</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {merchantBreakdown
                  .filter((merchant) => merchant.revenue > 0)
                  .map((merchant) => (
                    <tr key={merchant.merchantId}>
                      <td style={{ fontWeight: "600", color: "#0f172a" }}>
                        {merchant.merchantName}
                      </td>
                      <td style={{ textAlign: "center", color: "#475569" }}>
                        {merchant.orders}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "500", color: "#0f172a" }}>
                        ₹{merchant.revenue.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "#166534" }}>
                        ₹{merchant.commission.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`status-badge ${merchant.status === "ACTIVE" ? "active" : "pending"}`}
                        >
                          {merchant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default Commission;