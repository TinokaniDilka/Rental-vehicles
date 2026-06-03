import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

        // Redirect based on role
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "staff") navigate("/staff");
        else navigate("/customer");
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server connection error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glowOrb1}></div>
      <div style={glowOrb2}></div>

      <div style={cardStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: "40px" }}>🚗</span>
          <h1 style={logoText}>QuickRide <span style={{ color: "#6366f1" }}>Rentals</span></h1>
        </div>
        <p style={subtitleStyle}>Log into the management platform</p>

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={formGroup}>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p style={registerLinkStyle}>
          Don't have an account? <Link to="/register" style={{ color: "#818cf8", textDecoration: "none", fontWeight: "600" }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

// Styling
const containerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#0f172a", // sleek dark blue
  fontFamily: "'Outfit', 'Inter', sans-serif",
  position: "relative",
  overflow: "hidden"
};

const glowOrb1 = {
  position: "absolute",
  top: "-150px",
  left: "-150px",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(255,255,255,0) 70%)",
  zIndex: 0,
  pointerEvents: "none"
};

const glowOrb2 = {
  position: "absolute",
  bottom: "-150px",
  right: "-150px",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)",
  zIndex: 0,
  pointerEvents: "none"
};

const cardStyle = {
  background: "rgba(30, 41, 59, 0.7)", // glassmorphism
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "24px",
  padding: "45px",
  width: "420px",
  maxWidth: "90%",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  textAlign: "center",
  zIndex: 10
};

const logoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px"
};

const logoText = {
  color: "white",
  fontSize: "28px",
  fontWeight: "800",
  margin: 0,
  letterSpacing: "-0.5px"
};

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "15px",
  margin: "0 0 30px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  textAlign: "left"
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.05em"
};

const inputStyle = {
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "14px 16px",
  color: "white",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s ease"
};

const btnStyle = {
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "16px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.5)",
  transition: "transform 0.1s ease, box-shadow 0.2s ease"
};

const registerLinkStyle = {
  color: "#94a3b8",
  marginTop: "25px",
  fontSize: "14px",
  margin: "25px 0 0"
};