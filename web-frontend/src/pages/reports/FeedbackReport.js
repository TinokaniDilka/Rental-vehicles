import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ACCENT = "#c084fc";

export default function FeedbackReport() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setFeedback(res.data.feedback || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => feedback
    .filter(f => !selectedDate || new Date(f.createdAt).toDateString() === new Date(selectedDate).toDateString())
    .filter(f => complaintFilter === "all" || (f.type === "complaint" && (f.category === "Theft/Suspicious" || f.escalated))),
    [feedback, selectedDate, complaintFilter]
  );

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 60px" }}>
      <BackButton navigate={navigate} />
      <ReportHeader
        icon="💬"
        color={ACCENT}
        title="Customer Feedbacks & Complaints"
        subtitle="Ratings and comments left by customers, along with staff responses."
        count={loading ? null : filtered.length}
        countLabel="entries"
      />

      <FilterBar>
        <FilterField label="Type">
          <select value={complaintFilter} onChange={(e) => setComplaintFilter(e.target.value)} className="custom-input" style={{ minWidth: "200px" }}>
            <option value="all">All feedback</option>
            <option value="serious">Serious / escalated only</option>
          </select>
        </FilterField>
        <FilterField label="Filter by date">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="custom-input" style={{ minWidth: "180px" }} />
        </FilterField>
        <button
          className="btn-base btn-secondary"
          onClick={() => { setSelectedDate(""); setComplaintFilter("all"); }}
          disabled={!selectedDate && complaintFilter === "all"}
        >
          Reset filters
        </button>
      </FilterBar>

      <ReportCard loading={loading} empty={!loading && filtered.length === 0} emptyText="No feedback matches this filter.">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="custom-th">CUSTOMER</th>
              <th className="custom-th">VEHICLE</th>
              <th className="custom-th">RATING</th>
              <th className="custom-th">COMMENTS</th>
              <th className="custom-th">STAFF REPLY</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f._id} className="custom-tr">
                <td className="custom-td">{f.customerId?.name || "Deleted"}</td>
                <td className="custom-td">
                  {f.bookingId?.vehicleId?.name || "N/A"}
                  <br />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    ID: {f.bookingId?.vehicleId?.vehicleId || f.bookingId?.vehicleId?._id?.slice(-6)}
                  </span>
                </td>
                <td className="custom-td">
                  <span style={{ color: "#facc15", fontWeight: 700 }}>{f.rating ? `${f.rating} ★` : "—"}</span>
                </td>
                <td className="custom-td" style={{ fontStyle: "italic", color: "var(--text-secondary)", maxWidth: "280px" }}>"{f.comment}"</td>
                <td className="custom-td">
                  {f.staffReplies && f.staffReplies.length > 0 ? (
                    <div>{f.staffReplies.map(r => <p key={r._id} style={{ margin: "2px 0" }}>• {r.replyText}</p>)}</div>
                  ) : f.staffResponse ? (
                    <p style={{ margin: 0 }}>{f.staffResponse}</p>
                  ) : (
                    <em style={{ color: "var(--text-muted)" }}>No response</em>
                  )}
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