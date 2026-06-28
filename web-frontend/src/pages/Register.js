import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim() || !password.trim() || !name.trim()) {
      alert("Please fill all fields ❌");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed ❌");
      } else {
        alert("Registration successful ✅. Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative", overflow: "hidden",  backgroundImage: `url("https://static.vecteezy.com/system/resources/thumbnails/040/969/066/small_2x/ai-generated-a-lineup-of-colorful-luxury-cars-in-a-show-room-showcasing-a-prominent-yellow-car-in-front-with-a-focus-on-the-headlight-and-grille-photo.jpeg")`, // put your image path here
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat" }} className="fade-in">
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

      <div className="glass-card scale-in" style={{ padding: "40px", width: "420px", maxWidth: "90%", textAlign: "center", zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "45px", filter: "drop-shadow(0 4px 10px rgba(99,102,241,0.3))" }}>🚗</span>
          <h1 style={{ color: "white", fontSize: "28px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            QuickRide <span style={{ color: "var(--primary)" }}>Rentals</span>
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "25px" }}>Create your account to get started</p>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "left" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="custom-input"
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="form-label">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="custom-select"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff Member</option>
            </select>
          </div>

          <button type="submit" className="btn-base btn-primary" style={{ marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p style={{ color: "var(--text-secondary)", marginTop: "20px", fontSize: "14px" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}