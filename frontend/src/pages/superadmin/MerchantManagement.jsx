import React, { useEffect, useState } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";

const MerchantManagement = () => {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await api.get("/admin/merchants");
      setMerchants(res.data.merchants || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SuperAdminLayout>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Merchant Management
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "17px",
          }}
        >
          Manage registered merchants and business accounts
        </p>
      </div>

      {/* STATS CARD */}
      <div
        style={{
          width: "350px",
          background:
            "linear-gradient(135deg,#f97316,#ea580c)",
          borderRadius: "20px",
          padding: "22px",
          color: "#ffffff",
          marginBottom: "30px",
          boxShadow:
            "0 12px 25px rgba(249,115,22,.20)",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: "500",
            marginBottom: "10px",
          }}
        >
          Total Merchants
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "800",
            lineHeight: "1",
          }}
        >
          {merchants.length}
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "25px",
          boxShadow:
            "0 10px 25px rgba(15,23,42,.06)",
          overflowX: "auto",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Merchant Directory
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Merchant</th>
              <th style={thStyle}>GST Number</th>
              <th style={thStyle}>PAN Number</th>
              <th style={thStyle}>Address</th>
            </tr>
          </thead>

          <tbody>
            {merchants.length > 0 ? (
              merchants.map((merchant) => (
                <tr
                  key={merchant._id}
                  style={{
                    background: "#ffffff",
                  }}
                >
                  <td style={tdStyle}>
                    {merchant.companyName || "N/A"}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "7px 14px",
                        borderRadius: "999px",
                        fontWeight: "600",
                        fontSize: "13px",
                        display: "inline-block",
                      }}
                    >
                      {merchant.userId?.name || "N/A"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {merchant.gstNumber || "N/A"}
                  </td>

                  <td style={tdStyle}>
                    {merchant.panNumber || "N/A"}
                  </td>

                  <td style={tdStyle}>
                    {merchant.address || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                    background: "#ffffff",
                    fontSize: "15px",
                  }}
                >
                  No Merchants Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const thStyle = {
  padding: "18px 24px",
  textAlign: "left",
  color: "#111827",
  fontWeight: "700",
  fontSize: "14px",
  background: "#f8fafc",
  borderBottom: "2px solid #e5e7eb",
};

const tdStyle = {
  padding: "18px 24px",
  color: "#374151",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
};

export default MerchantManagement;