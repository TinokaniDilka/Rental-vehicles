import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {   
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", user.role);

        showToast(`Welcome back, ${user.name}! ✅`, "success");
        
        setTimeout(() => {
          if (user.role === "admin") navigate("/admin");
          else if (user.role === "staff") navigate("/staff");
          else navigate("/customer");
        }, 500);
      } else {
        showToast(data.message || "Login failed ❌", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("Server connection error ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative", overflow: "hidden", 
 background: "var(--bg-main)"
 }} className="fade-in">
   <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.4)", // adjust darkness
      zIndex: 0,
    }}
  />
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }}></div>
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-150px", right: "-150px" }}></div>

      <div className="glass-card scale-in" style={{ padding: "45px", width: "420px", maxWidth: "90%", textAlign: "center", zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "45px", filter: "drop-shadow(0 4px 10px rgba(99,102,241,0.3))" }}>🚗</span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "28px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            QuickRide <span style={{ color: "var(--primary)" }}>Rentals</span>
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "30px" }}>Log into the management platform</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="custom-input"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input"
              required
            />
          </div>

          <button type="submit" className="btn-base btn-primary" style={{ marginTop: "10px", width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p style={{ color: "var(--text-secondary)", marginTop: "25px", fontSize: "14px" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Register here</Link>
        </p>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 24px",
            borderRadius: "12px",
            background: toast.type === "success" ? "var(--success)" : "var(--danger)",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "var(--shadow-lg)",
            animation: "slideIn 0.3s ease-out",
            zIndex: 1000
          }}
        >
          {toast.message}
        </div>
      )}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}