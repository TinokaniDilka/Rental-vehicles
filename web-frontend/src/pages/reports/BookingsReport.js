import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ACCENT = "#818cf8";

export default function BookingsReport() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => bookings.filter(b => {
    if (!selectedDate) return true;
    const selected = new Date(selectedDate).setHours(0, 0, 0, 0);
    const start = new Date(b.startDate).setHours(0, 0, 0, 0);
    const end = new Date(b.endDate).setHours(0, 0, 0, 0);
    return selected >= start && selected <= end;
  }), [bookings, selectedDate]);

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 60px" }}>
      <BackButton navigate={navigate} />
      <ReportHeader
        icon="📅"
        color={ACCENT}
        title="System Booking Logs"
        subtitle="All customer bookings across the fleet, with deposit and status tracking."
        count={loading ? null : filtered.length}
        countLabel="bookings"
      />

      <FilterBar>
        <FilterField label="Filter by date">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="custom-input" style={{ minWidth: "180px" }} />
        </FilterField>
        <button className="btn-base btn-secondary" onClick={() => setSelectedDate("")} disabled={!selectedDate}>Reset</button>
      </FilterBar>

      <ReportCard loading={loading} empty={!loading && filtered.length === 0} emptyText="No bookings match this filter.">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="custom-th">VEHICLE</th>
              <th className="custom-th">CUSTOMER</th>
              <th className="custom-th">DATE</th>
              <th className="custom-th">AMOUNT</th>
              <th className="custom-th">DEPOSIT STATUS</th>
              <th className="custom-th">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id} className="custom-tr">
                <td className="custom-td custom-td-primary">
                  {b.vehicleId?.name || "Deleted"}
                  <br />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    ID: {b.vehicleId?.vehicleId || b.vehicleId?._id?.slice(-6)}
                  </span>
                </td>
                <td className="custom-td">{b.customerId?.name}</td>
                <td className="custom-td">
                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="custom-td" style={{ fontWeight: 600 }}>${b.totalAmount}</td>
                <td className="custom-td">
                  {b.depositAmount > 0 ? (
                    <span style={{
                      padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700",
                      background: b.depositStatus === "released" ? "rgba(16,185,129,0.15)" :
                                  b.depositStatus === "captured" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: b.depositStatus === "released" ? "#10b981" :
                             b.depositStatus === "captured" ? "#ef4444" : "#f59e0b"
                    }}>
                      {b.depositStatus === "released" ? `Released: $${b.depositAmount}` :
                       b.depositStatus === "captured" ? `Captured: $${b.depositAmount}` :
                       `Held: $${b.depositAmount}`}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                  )}
                </td>
                <td className="custom-td">
                  <span className={`badge-base badge-${b.status}`}>{b.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportCard>
    </main>
  );
}

/* Shared presentational helpers — kept local to this file, no new files created */
function BackButton({ navigate }) {
  return (
    <button
      className="btn-base btn-secondary"
      style={{ marginBottom: "28px", display: "inline-flex", alignItems: "center", gap: "8px" }}
      onClick={() => navigate("/admin")}
    >
      ← Back to dashboard
    </button>
  );
}

function ReportHeader({ icon, color, title, subtitle, count, countLabel }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      gap: "20px", paddingBottom: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)"
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
          background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px"
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "white" }}>{title}</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: "13.5px", maxWidth: "520px" }}>{subtitle}</p>
        </div>
      </div>
      {count !== null && count !== undefined && (
        <span style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "700",
          background: `${color}1a`, color, border: `1px solid ${color}33`, whiteSpace: "nowrap"
        }}>
          {count} {countLabel}
        </span>
      )}
    </div>
  );
}

function FilterBar({ children }) {
  return (
    <div className="glass-card" style={{
      padding: "16px 20px", marginBottom: "24px", display: "flex",
      alignItems: "flex-end", gap: "16px", flexWrap: "wrap"
    }}>
      {children}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", color: "var(--text-muted)", textTransform: "uppercase" }}>
        {label}
      </span>
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