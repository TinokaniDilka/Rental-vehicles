import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuditLogReport() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAuditLog(res.data.auditLog || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const positive = ["Booking Approved", "Handover Confirmed", "Cash Payment Confirmed", "Return Confirmed", "Vehicle Added", "Staff Registered", "Admin Registered", "User Activated", "ID Verification Approved", "Promo Code Created", "Promo Code Activated", "Deposit Released"];
  const negative = ["Booking Rejected", "Booking Cancelled", "Vehicle Deleted", "User Deactivated", "User Deleted", "ID Verification Rejected", "Promo Code Deactivated"];
  const warning = ["Deposit Captured"];

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <button className="btn-base btn-secondary" style={{ marginBottom: "20px" }} onClick={() => navigate("/admin")}>← Back to dashboard</button>
      <h2>📋 Staff Action Audit Log</h2>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <div className="glass-card" style={{ padding: "25px" }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="custom-th">STAFF NAME</th>
                  <th className="custom-th">ACTION</th>
                  <th className="custom-th">DETAILS</th>
                  <th className="custom-th">REFERENCE</th>
                  <th className="custom-th">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.length > 0 ? (
                  auditLog.map((log, index) => {
                    let tone = { bg: "rgba(99,102,241,0.15)", color: "#818cf8" };
                    if (positive.includes(log.action)) tone = { bg: "rgba(16,185,129,0.15)", color: "#10b981" };
                    else if (negative.includes(log.action)) tone = { bg: "rgba(239,68,68,0.15)", color: "#ef4444" };
                    else if (warning.includes(log.action)) tone = { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" };

                    const reference = log.bookingId || log.targetId || "N/A";
                    const referenceLabel = log.bookingId
                      ? `Booking: ${String(log.bookingId).slice(-6)}`
                      : log.targetId
                        ? `${log.targetType || "Item"}: ${String(log.targetId).slice(-6)}`
                        : "N/A";

                    return (
                      <tr key={index} className="custom-tr">
                        <td className="custom-td">{log.staffName || "Unknown Staff"}</td>
                        <td className="custom-td">
                          <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: tone.bg, color: tone.color }}>
                            {log.action}
                          </span>
                        </td>
                        <td className="custom-td" style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{log.details || "—"}</td>
                        <td className="custom-td" style={{ fontFamily: "monospace", fontSize: "12px" }} title={reference !== "N/A" ? String(reference) : undefined}>
                          {referenceLabel}
                        </td>
                        <td className="custom-td">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>No staff actions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}