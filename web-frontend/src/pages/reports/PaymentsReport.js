import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ACCENT = "#f59e0b";

export default function PaymentsReport() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [paymentDate, setPaymentDate] = useState("");
  const [searchTransaction, setSearchTransaction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPayments(res.data.payments || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const typeLabels = {
    charge: { label: "Payment", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    refund: { label: "Refund", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
    deposit_release: { label: "Deposit Released", color: "#818cf8", bg: "rgba(99,102,241,0.15)" },
    deposit_capture: { label: "Deposit Captured", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    additional_charge: { label: "Additional Charge", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" }
  };

  const filtered = useMemo(() => payments.filter(p => {
    const matchDate = paymentDate
      ? new Date(p.paidAt || p.createdAt).toDateString() === new Date(paymentDate).toDateString()
      : true;
    const matchSearch = searchTransaction
      ? p._id.toLowerCase().includes(searchTransaction.toLowerCase())
      : true;
    return matchDate && matchSearch;
  }), [payments, paymentDate, searchTransaction]);

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 60px" }}>
      <BackButton navigate={navigate} />
      <ReportHeader
        icon="💰"
        color={ACCENT}
        title="Invoice Payments Log"
        subtitle="Every transaction across the platform — charges, refunds, and deposit movements."
        count={loading ? null : filtered.length}
        countLabel="transactions"
      />

      <FilterBar>
        <FilterField label="Transaction ID">
          <input
            type="text"
            placeholder="Search by ID…"
            value={searchTransaction}
            onChange={(e) => setSearchTransaction(e.target.value)}
            className="custom-input"
            style={{ minWidth: "220px" }}
          />
        </FilterField>
        <FilterField label="Filter by date">
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="custom-input" style={{ minWidth: "180px" }} />
        </FilterField>
        <button
          className="btn-base btn-secondary"
          onClick={() => { setSearchTransaction(""); setPaymentDate(""); }}
          disabled={!searchTransaction && !paymentDate}
        >
          Clear filters
        </button>
      </FilterBar>

      <ReportCard loading={loading} empty={!loading && filtered.length === 0} emptyText="No transactions match this filter.">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="custom-th">TRANSACTION ID</th>
              <th className="custom-th">CUSTOMER</th>
              <th className="custom-th">VEHICLE</th>
              <th className="custom-th">VEHICLE ID</th>
              <th className="custom-th">OWNER</th>
              <th className="custom-th">COMMISSION</th>
              <th className="custom-th">TYPE</th>
              <th className="custom-th">AMOUNT</th>
              <th className="custom-th">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              let typeInfo = typeLabels[p.type];
              if (!typeInfo) {
                if (p.amount < 0) typeInfo = typeLabels.refund;
                else if (p.status === "cancelled" || p.status === "refunded") typeInfo = { label: "Cancellation", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" };
                else typeInfo = typeLabels.charge;
              }
              const isNegativeMoney = typeInfo.label === "Refund";
              return (
                <tr key={p._id} className="custom-tr">
                  <td className="custom-td" style={{ fontFamily: "monospace", fontSize: "12px" }}>{p._id}</td>
                  <td className="custom-td">{p.customerId?.name || "Deleted"}</td>
                  <td className="custom-td">{p.bookingId?.vehicleId?.name || "N/A"}</td>
                  <td className="custom-td" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    {p.bookingId?.vehicleId?.vehicleId || p.bookingId?.vehicleId?._id?.slice(-6) || "N/A"}
                  </td>
                  <td className="custom-td">{p.bookingId?.vehicleId?.owner?.name || "N/A"}</td>
                  <td className="custom-td">{p.platformCommission != null ? `$${p.platformCommission.toFixed(2)}` : "$0.00"}</td>
                  <td className="custom-td">
                    <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: typeInfo.bg, color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="custom-td">
                    <span style={{ color: isNegativeMoney ? "#ef4444" : "white", fontWeight: 700 }}>
                      ${Math.abs(p.amount)}
                    </span>
                  </td>
                  <td className="custom-td">{new Date(p.paidAt || p.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ReportCard>
    </main>
  );
}

function BackButton({ navigate }) {
  return (
    <button className="btn-base btn-secondary" style={{ marginBottom: "28px", display: "inline-flex", alignItems: "center", gap: "8px" }} onClick={() => navigate("/admin")}>
      ← Back to dashboard
    </button>
  );
}

function ReportHeader({ icon, color, title, subtitle, count, countLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", paddingBottom: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
          {icon}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "white" }}>{title}</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: "13.5px", maxWidth: "520px" }}>{subtitle}</p>
        </div>
      </div>
      {count !== null && count !== undefined && (
        <span style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: `${color}1a`, color, border: `1px solid ${color}33`, whiteSpace: "nowrap" }}>
          {count} {countLabel}
        </span>
      )}
    </div>
  );
}

function FilterBar({ children }) {
  return (
    <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
      {children}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", color: "var(--text-muted)", textTransform: "uppercase" }}>{label}</span>
      {children}
    </div>
  );
}

function ReportCard({ loading, empty, emptyText, children }) {
  return (
    <div className="glass-card" style={{ padding: loading || empty ? "60px 20px" : "8px 20px 20px", borderRadius: "16px" }}>
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", margin: 0 }}>Loading report data…</p>
      ) : empty ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", margin: 0 }}>{emptyText}</p>
      ) : (
        <div className="custom-table-container">{children}</div>
      )}
    </div>
  );
}