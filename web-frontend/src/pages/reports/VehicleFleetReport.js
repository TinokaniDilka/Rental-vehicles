import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ACCENT = "#38bdf8";

export default function VehicleFleetReport() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setVehicles(res.data.vehicles || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => vehicles.filter(v => {
    if (availabilityFilter === "all") return true;
    if (availabilityFilter === "available") return v.isAvailable;
    return !v.isAvailable;
  }), [vehicles, availabilityFilter]);

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 60px" }}>
      <BackButton navigate={navigate} />
      <ReportHeader
        icon="🚘"
        color={ACCENT}
        title="Vehicle Fleet Availability"
        subtitle="Current stock across all locations, and which vehicles are currently rented out."
        count={loading ? null : filtered.length}
        countLabel="vehicles"
      />

      <FilterBar>
        <FilterField label="Status">
          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="custom-input" style={{ minWidth: "180px" }}>
            <option value="all">All vehicles</option>
            <option value="available">Available in stock</option>
            <option value="rented">Rented out</option>
          </select>
        </FilterField>
      </FilterBar>

      <ReportCard loading={loading} empty={!loading && filtered.length === 0} emptyText="No vehicles match this filter.">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="custom-th">VEHICLE ID</th>
              <th className="custom-th">VEHICLE NAME</th>
              <th className="custom-th">CATEGORY</th>
              <th className="custom-th">DAILY RATE</th>
              <th className="custom-th">LOCATION</th>
              <th className="custom-th">ADDED DATE</th>
              <th className="custom-th">PHYSICAL STATE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v._id} className="custom-tr">
                <td className="custom-td" style={{ fontFamily: "monospace", fontSize: "12px" }}>{v.vehicleId || v._id.slice(-6)}</td>
                <td className="custom-td custom-td-primary">{v.name}</td>
                <td className="custom-td">{v.type.toUpperCase()}</td>
                <td className="custom-td" style={{ fontWeight: 600 }}>${v.pricePerDay}</td>
                <td className="custom-td">{v.location}</td>
                <td className="custom-td">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "N/A"}</td>
                <td className="custom-td">
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700",
                    background: v.isAvailable ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                    color: v.isAvailable ? "#10b981" : "#f59e0b"
                  }}>
                    ● {v.isAvailable ? "Available In Stock" : "Rented Out"}
                  </span>
                </td>
              </tr>
            ))}
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
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--text-primary)" }}>{title}</h1>
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