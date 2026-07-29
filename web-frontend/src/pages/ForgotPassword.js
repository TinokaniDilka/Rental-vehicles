import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("contact"); // contact -> otp -> password -> done
  const [contactType, setContactType] = useState("email"); // "email" | "phone"
  const [contactValue, setContactValue] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState(""); // actual email the OTP was sent to
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (contactType === "email" && !contactValue.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (contactType === "phone" && contactValue.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        emailOrPhone: contactValue.trim(),
      });
      // Backend returns maskedEmail so we can show "sent to sc***@gmail.com"
      setMaskedEmail(res.data.maskedEmail || "your registered email");
      setResolvedEmail(res.data.resolvedEmail || "");
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-reset-otp", {
        email: resolvedEmail,
        otp,
      });
      setStep("password");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        emailOrPhone: contactValue.trim(),
      });
      setMaskedEmail(res.data.maskedEmail || maskedEmail);
      setResolvedEmail(res.data.resolvedEmail || resolvedEmail);
      setSuccessMsg("A new code has been sent ✅");
      setResendCooldown(60);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: resolvedEmail,
        otp,
        newPassword,
      });
      setStep("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const progress = { contact: 25, otp: 60, password: 85, done: 100 }[step];

  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-main)",
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 0 }} />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }} />
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-150px", right: "-150px" }} />

      {/* Card */}
      <div
        className="glass-card scale-in"
        style={{ padding: "45px", width: "440px", maxWidth: "92%", textAlign: "center", zIndex: 10 }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "46px", filter: "drop-shadow(0 4px 12px rgba(99,102,241,0.35))", lineHeight: 1 }}>
            {step === "done" ? "✅" : step === "password" ? "🔐" : step === "otp" ? "📩" : "🔑"}
          </span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "23px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            {step === "done" ? "Password Reset!" : step === "password" ? "Set New Password" : step === "otp" ? "Enter OTP Code" : "Forgot Password?"}
          </h1>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "22px", lineHeight: "1.6" }}>
          {step === "done"
            ? "Your password has been updated. Redirecting to login…"
            : step === "password"
            ? "Choose a strong new password for your account."
            : step === "otp"
            ? <>We sent a 6-digit OTP to <strong style={{ color: "var(--text-primary)" }}>{maskedEmail}</strong>. Enter it below.</>
            : "Enter your email address or phone number to receive a one-time reset code."}
        </p>

        {/* Progress bar */}
        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", marginBottom: "28px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--primary), var(--accent, #6366f1))", borderRadius: "99px", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>

        {/* ─── Step: Contact Input ──────────────────────────────────────── */}
        {step === "contact" && (
          <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>

            {/* Toggle: Email / Phone */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "4px", gap: "4px" }}>
              {["email", "phone"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setContactType(type); setContactValue(""); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "all 0.2s ease",
                    background: contactType === type ? "var(--primary)" : "transparent",
                    color: contactType === type ? "#fff" : "var(--text-secondary)",
                    boxShadow: contactType === type ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                  }}
                >
                  {type === "email" ? "📧 Email" : "📱 Phone"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="form-label">{contactType === "email" ? "Email Address" : "Phone Number"}</label>
              <input
                id="fp-contact-input"
                type={contactType === "email" ? "email" : "tel"}
                placeholder={contactType === "email" ? "name@example.com" : "+94 77 123 4567"}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                className="custom-input"
                autoFocus
                required
              />
              {contactType === "phone" && (
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0", lineHeight: "1.5" }}>
                  💡 The OTP will be sent to your registered email address linked to this phone number.
                </p>
              )}
            </div>

            {error && <ErrorMsg msg={error} />}

            <button id="fp-send-btn" type="submit" className="btn-base btn-primary" style={{ width: "100%", marginTop: "4px" }} disabled={loading}>
              {loading ? "Sending Code…" : "Send OTP Code →"}
            </button>
          </form>
        )}

        {/* ─── Step: OTP ───────────────────────────────────────────────── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="form-label">6-Digit OTP Code</label>
              <input
                id="fp-otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="custom-input"
                style={{ textAlign: "center", letterSpacing: "10px", fontSize: "22px", fontWeight: "700", fontFamily: "monospace" }}
                autoFocus
                required
              />
            </div>

            {error && <ErrorMsg msg={error} />}
            {successMsg && <SuccessMsg msg={successMsg} />}

            <button id="fp-verify-btn" type="submit" className="btn-base btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Verifying…" : "Verify OTP →"}
            </button>

            <div style={{ textAlign: "center" }}>
              {resendCooldown > 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                  Resend available in <span style={{ color: "var(--primary)", fontWeight: "600" }}>{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  id="fp-resend-btn"
                  type="button"
                  onClick={handleResend}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}
                >
                  Didn't get a code? Resend
                </button>
              )}
            </div>
          </form>
        )}

        {/* ─── Step: New Password ──────────────────────────────────────── */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="form-label">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="fp-new-password"
                  type={showNewPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="custom-input"
                  style={{ paddingRight: "44px" }}
                  autoFocus
                  required
                />
                <button type="button" onClick={() => setShowNewPass((v) => !v)} tabIndex={-1}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "16px", padding: 0, lineHeight: 1 }}>
                  {showNewPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="fp-confirm-password"
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="custom-input"
                  style={{ paddingRight: "44px" }}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPass((v) => !v)} tabIndex={-1}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "16px", padding: 0, lineHeight: 1 }}>
                  {showConfirmPass ? "🙈" : "👁️"}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: "600", color: newPassword === confirmPassword ? "var(--success, #22c55e)" : "var(--danger, #ef4444)" }}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {error && <ErrorMsg msg={error} />}

            <button
              id="fp-reset-btn"
              type="submit"
              className="btn-base btn-primary"
              style={{ width: "100%", marginTop: "4px" }}
              disabled={loading || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
            >
              {loading ? "Resetting…" : "Reset Password →"}
            </button>
          </form>
        )}

        {/* ─── Step: Done ──────────────────────────────────────────────── */}
        {step === "done" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", animation: "pulse 1.5s ease-in-out infinite" }}>
              ✅
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>Redirecting to login in a moment…</p>
          </div>
        )}

        {/* Back to Login */}
        <p style={{ color: "var(--text-secondary)", marginTop: "28px", fontSize: "13px", textAlign: "center" }}>
          <Link to="/login" id="fp-back-to-login"
            style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            ← Back to Login
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px" }}>
      <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
      <p style={{ color: "var(--danger, #ef4444)", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{msg}</p>
    </div>
  );
}

function SuccessMsg({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "10px 14px" }}>
      <span style={{ fontSize: "14px", flexShrink: 0 }}>✅</span>
      <p style={{ color: "var(--success, #22c55e)", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{msg}</p>
    </div>
  );
}