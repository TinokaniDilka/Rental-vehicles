import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e293b",
      color: "#fff",
      padding: "20px"
    }}>
      <h2>🚗 Rental App</h2>

      {/* ✅ ADMIN MENU */}
      {role === "admin" && (
        <>
          <Link to="/" style={link}>Dashboard</Link>
          <Link to="/vehicles" style={link}>Vehicles</Link>
        </>
      )}

      {/* ✅ CUSTOMER MENU */}
      {role === "customer" && (
        <>
          <Link to="/customer" style={link}>Dashboard</Link>
          <Link to="/vehicles" style={link}>Browse</Link>
          <Link to="/my-bookings" style={link}>My Bookings</Link>
        </>
      )}

      {/* ✅ RENTER MENU */}
      {role === "renter" && (
        <>
          <Link to="/renter" style={link}>Dashboard</Link>
        </>
      )}

      <button onClick={logout} style={{
        marginTop: "20px",
        width: "100%",
        padding: "10px",
        background: "red",
        color: "#fff",
        border: "none"
      }}>
        Logout
      </button>
    </div>
  );
}

const link = {
  display: "block",
  color: "#fff",
  margin: "10px 0",
  textDecoration: "none"
};