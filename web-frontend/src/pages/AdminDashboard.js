import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  // Navigation
  const [activePage, setActivePage] = useState("dashboard");
  const [activeReportTab, setActiveReportTab] = useState("payments");

  // Ref for scrolling to payments section
  const paymentsRef = useRef(null);
   const vehiclesRef = useRef(null);
  const feedbackRef = useRef(null);
  // Stats State
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeRentals: 0,
    totalCustomers: 0,
    pendingBookings: 0,
    completedRentals: 0,
    monthlyRevenue: 0,
    customerSatisfaction: 5.0
  });

  // Data Lists
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [reports, setReports] = useState({ bookings: [], payments: [], vehicles: [], feedback: [] });
  const [selectedDate, setSelectedDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [searchTransaction, setSearchTransaction] = useState("");
  const [loading, setLoading] = useState(true);

  // Profile Settings
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileEmail, setProfileEmail] = useState(user.email || "");
  const [profilePassword, setProfilePassword] = useState("");
    // Add these after the existing states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  // Staff Account Form
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  // Promo Code Form
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  // Auto-scroll to correct section when coming from dashboard cards
  useEffect(() => {
    if (activePage === "reports") {
      setTimeout(() => {
        if (activeReportTab === "payments" && paymentsRef.current) {
          paymentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (activeReportTab === "vehicles" && vehiclesRef.current) {
          vehiclesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (activeReportTab === "feedback" && feedbackRef.current) {
          feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [activePage, activeReportTab]);
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPromos();
    fetchReports();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/promos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user activation status
  const handleToggleUser = async (userId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/users/${userId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle status");
    }
  };

  // Staff creation
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) return alert("Fill all fields");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff",
        { name: staffName, email: staffEmail, password: staffPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Staff created successfully ✅");
      setShowStaffModal(false);
      setStaffName("");
      setStaffEmail("");
      setStaffPassword("");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };

  // Promo code creation
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoCode || !promoDiscount) return alert("Fill all fields");
    try {
      await axios.post(
        "http://localhost:5000/api/promos",
        { code: promoCode, discountPercent: Number(promoDiscount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Promo code added successfully ✅");
      setShowPromoModal(false);
      setPromoCode("");
      setPromoDiscount("");
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add promo");
    }
  };

  // Toggle promo status
  const handleTogglePromo = async (promoId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/promos/${promoId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Promo code status updated ✅");
      fetchPromos();
    } catch (err) {
      alert("Failed to toggle promo status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { 
          name: profileName, 
          email: profileEmail, 
          password: profilePassword || undefined 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully ✅");
      setProfilePassword("");
      setShowProfileModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }} className="fade-in">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }}></div>
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-100px", right: "-100px" }}></div>
      {/* Navbar */}
            {/* Navbar - Customer Style Profile */}
      <nav className="navbar-custom">
        <div className="navbar-container">
          <div className="nav-logo">
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🛠️</span>
            <span>QuickRide <span style={{ color: "var(--accent)" }}>Admin </span></span>
          </div>

          <div className="nav-links-wrap">
            <NavItem label="Overview" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <NavItem label="Users List" active={activePage === "users"} onClick={() => setActivePage("users")} />
            <NavItem label="Promo Codes" active={activePage === "promos"} onClick={() => setActivePage("promos")} />
            <NavItem label="System Reports" active={activePage === "reports"} onClick={() => setActivePage("reports")} />
            
          </div>

          {/* Profile Pill (like Customer Dashboard) */}
          <div style={{ position: "relative" }}>
            <div 
              className="profile-pill" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowProfileMenu(!showProfileMenu); 
              }}
              style={{ cursor: "pointer" }}
            >
              <span style={{ fontSize: "18px" }}>👤</span>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.name || "Admin"}</span>
              <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
            </div>

            {showProfileMenu && (
              <div 
                className="profile-dropdown-menu glass-card scale-in" 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ textAlign: "center", padding: "15px", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "white", margin: "0 auto 10px" }}>👤</div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{user.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0" }}>{user.email}</p>
                </div>
                <div 
                  style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid var(--border-color)" }} 
                  onClick={() => { 
                    setShowProfileModal(true); 
                    setShowProfileMenu(false); 
                  }}
                >
                  👤 Edit Profile
                </div>
                <div 
                  style={{ padding: "14px 16px", cursor: "pointer", color: "var(--danger)", fontWeight: "600", fontSize: "14px" }} 
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Main Container */}
      <main style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "60px 20px 40px 20px",   // Increased top padding
        position: "relative", 
        zIndex: 1 
      }}>
        
        {/* OVERVIEW STATS */}
        {activePage === "dashboard" && (
          <div className="slide-up">
            <div className="welcome-banner-wrap">
              <div>
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "white" }}>Welcome Admin, {user.name}! 👑</h1>
                <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: "15px" }}>Oversee user accounts, register operational staff, configure promo offers, and read activity reports.</p>
              </div>
              <div style={{ fontSize: "70px", opacity: 0.8, filter: "drop-shadow(0 4px 10px rgba(99,102,241,0.3))" }}>📊</div>
            </div>

            <div className="dashboard-grid">
  <DashboardCard 
    icon="💰" 
    title="MONTHLY REVENUE" 
    value={`$${stats.monthlyRevenue}`} 
    color="var(--success)" 
    onClick={() => {
      setActiveReportTab("payments");
      setActivePage("reports");
    }}
  />

  <DashboardCard 
    icon="🚗" 
    title="ACTIVE RENTALS" 
    value={stats.activeRentals} 
    color="var(--primary)" 
    onClick={() => {
      setActiveReportTab("vehicles");
      setActivePage("reports");
    }}
  />

  <DashboardCard 
    icon="⏳" 
    title="PENDING ORDERS" 
    value={stats.pendingBookings} 
    color="var(--warning)" 
    onClick={() => setActivePage("reports")}
  />

  <DashboardCard 
    icon="👤" 
    title="TOTAL CUSTOMERS" 
    value={stats.totalCustomers} 
    color="var(--secondary)" 
    onClick={() => setActivePage("users")} // 👈 open users list
  />

  <DashboardCard 
    icon="⭐" 
    title="SATISFACTION RATING" 
    value={`${stats.customerSatisfaction} / 5`} 
    color="var(--accent)" 
    onClick={() => {
      setActiveReportTab("feedback");
      setActivePage("reports");
    }}
  />
</div>

            <div className="glass-card" style={{ padding: "25px", marginTop: "35px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Quick Operations Shortcuts</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <button className="btn-base btn-primary" onClick={() => setShowStaffModal(true)}>👤 Register New Staff Account</button>
                <button className="btn-base btn-secondary" onClick={() => setShowPromoModal(true)}>🏷️ Add Promo Discount</button>
              </div>
            </div>
          </div>
        )}

        {/* USERS LIST */}
        {activePage === "users" && (
          <div className="slide-up" style={{ marginTop: "50px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>User Accounts Registry 👥</h2>
              {/* ✅ FILTER DROPDOWN */}
              <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                <select
                  value={userFilter}
                   onChange={(e) => setUserFilter(e.target.value)}
                  className="custom-input"
                  style={{ maxWidth: "200px" }}
                >
                  <option value="all">All Users</option>
                <option value="staff">Staff</option>
                <option value="customer">Customers</option>
                <option value="admin">Admins</option>
                 </select>
          </div>

            <button className="btn-base btn-primary" onClick={() => setShowStaffModal(true)}>➕ Register Staff</button>
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="custom-th">NAME</th>
                    <th className="custom-th">EMAIL</th>
                    <th className="custom-th">ROLE</th>
                    <th className="custom-th">ACCOUNT STATUS</th>
                    <th className="custom-th">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users
  .filter(u => {
    if (userFilter === "all") return true;
    return u.role === userFilter;
  })
  .map(u => (

                    <tr key={u._id} className="custom-tr">
                      <td className="custom-td custom-td-primary">{u.name}</td>
                      <td className="custom-td">{u.email}</td>
                      <td className="custom-td">
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: u.role === "admin" ? "rgba(244,63,94,0.15)" : u.role === "staff" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.08)",
                          color: u.role === "admin" ? "var(--accent)" : u.role === "staff" ? "var(--primary)" : "var(--text-secondary)",
                          border: u.role === "admin" ? "1px solid rgba(244,63,94,0.25)" : u.role === "staff" ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.1)"
                        }}>{u.role.toUpperCase()}</span>
                      </td>
                      <td className="custom-td">
                        <span style={{ color: u.isActive ? "var(--success)" : "var(--danger)", fontWeight: "bold" }}>
                          ● {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="custom-td">
                        {u._id !== user._id ? (
                          <button
                            className={`btn-base ${u.isActive ? "btn-danger" : "btn-success"}`}
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => handleToggleUser(u._id)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>Self Account</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROMO CODES */}
        {activePage === "promos" && (
          <div className="slide-up" style={{ marginTop: "50px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Promotional Discounts Manager 🏷️</h2>
              <button className="btn-base btn-primary" onClick={() => setShowPromoModal(true)}>➕ Add Promo Code</button>
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="custom-th">PROMO CODE</th>
                    <th className="custom-th">DISCOUNT PERCENTAGE</th>
                    <th className="custom-th">STATUS</th>
                    <th className="custom-th">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>No promo codes defined yet.</td>
                    </tr>
                  ) : (
                    promos.map(p => (
                      <tr key={p._id} className="custom-tr">
                        <td className="custom-td custom-td-primary">{p.code}</td>
                        <td className="custom-td">{p.discountPercent}% OFF</td>
                        <td className="custom-td">
                          <span style={{ color: p.isActive ? "var(--success)" : "var(--danger)", fontWeight: "bold" }}>
                            ● {p.isActive ? "Active" : "Expired/Disabled"}
                          </span>
                        </td>
                        <td className="custom-td">
                          <button
                            className={`btn-base ${p.isActive ? "btn-danger" : "btn-success"}`}
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => handleTogglePromo(p._id)}
                          >
                            {p.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS VIEW */}
        {activePage === "reports" && (
          <div className="slide-up" style={{ marginTop: "50px" }}>
            <h2>Operations Analysis Reports 📊</h2>
            
            <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
              Extract and audit transaction listings, bookings, feedback logs, and fleet status.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              
              {/* BOOKINGS TABLE */}
              {/* BOOKINGS TABLE */}
<div className="glass-card" style={{ padding: "25px" }}>
  <h4 style={{ margin: "0 0 15px", fontSize: "18px", color: "white" }}>
    📅 System Booking Logs
  </h4>

  {/* ✅ ONLY ONE FILTER BAR */}
  <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
    <span style={{ color: "white", fontWeight: "600" }}>Filter by Date:</span>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="custom-input"
      style={{ maxWidth: "180px" }}
    />

    <button
      className="btn-base btn-secondary"
      onClick={() => setSelectedDate("")}
    >
      Reset
    </button>
  </div>

              
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
  <tr>
    <th className="custom-th">CUSTOMER</th>
    <th className="custom-th">VEHICLE</th>   {/* ✅ ADD HERE */}
    <th className="custom-th">RATING</th>
    <th className="custom-th">COMMENTS</th>
    <th className="custom-th">STAFF REPLY</th>
  </tr>
</thead>
                    <tbody>
                    {reports.bookings
  .filter(b => {
    if (!selectedDate) return true;

    const selected = new Date(selectedDate).setHours(0,0,0,0);
    const start = new Date(b.startDate).setHours(0,0,0,0);
    const end = new Date(b.endDate).setHours(0,0,0,0);

    return selected >= start && selected <= end;
  })
  .map(b => (
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
    {new Date(b.startDate).toLocaleDateString()} -
    {new Date(b.endDate).toLocaleDateString()}
  </td>

  <td className="custom-td">${b.totalAmount}</td>

  <td className="custom-td">
    <span className={`badge-base badge-${b.status}`}>
      {b.status.toUpperCase()}
    </span>
  </td>

</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAYMENTS TABLE - Highlighted when coming from Monthly Revenue */}
              <div 
                ref={paymentsRef} 
                className="glass-card" 
                style={{ 
                  padding: "25px",
                  border: activeReportTab === "payments" ? "2px solid var(--success)" : "1px solid var(--border-color)",
                  transition: "all 0.3s ease"
                }}
              >
                <h4 style={{ margin: "0 0 15px", fontSize: "18px", color: "white" }}>💰 Invoice Payments Log</h4>
                {/* ✅ SEARCH BAR FOR TRANSACTION ID */}
<div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
  
  <input
    type="text"
    placeholder="Search Transaction ID..."
    value={searchTransaction}
    onChange={(e) => setSearchTransaction(e.target.value)}
    className="custom-input"
    style={{ maxWidth: "250px" }}
  />

  <button
    className="btn-base btn-secondary"
    onClick={() => setSearchTransaction("")}
  >
    Clear
  </button>

</div>

                {/* ✅ DATE FILTER FOR PAYMENTS */}
<div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
  <span style={{ color: "white", fontWeight: "600" }}>Filter by Date:</span>

  <input
    type="date"
    value={paymentDate}
    onChange={(e) => setPaymentDate(e.target.value)}
    className="custom-input"
    style={{ maxWidth: "180px" }}
  />

  <button
    className="btn-base btn-secondary"
    onClick={() => setPaymentDate("")}
  >
    Reset
  </button>
</div>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th className="custom-th">TRANSACTION ID</th>
                        <th className="custom-th">CUSTOMER</th>
                        <th className="custom-th">VEHICLE</th>        {/* ✅ */}
                        <th className="custom-th">VEHICLE ID</th>     {/* ✅ */}
                        <th className="custom-th">AMOUNT</th>
<                       th className="custom-th">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.payments
  .filter(p => {
    // ✅ Date filter
    const matchDate = paymentDate
      ? new Date(p.paidAt || p.createdAt).toDateString() ===
        new Date(paymentDate).toDateString()
      : true;

    // ✅ Transaction ID search
    const matchSearch = searchTransaction
      ? p._id.toLowerCase().includes(searchTransaction.toLowerCase())
      : true;

    return matchDate && matchSearch;
  })
  .map(p => (
<tr key={p._id} className="custom-tr">

  <td className="custom-td" style={{ fontFamily: "monospace" }}>
    {p._id}
  </td>

  <td className="custom-td">
    {p.customerId?.name || "Deleted"}
  </td>

  {/* ✅ VEHICLE NAME */}
  <td className="custom-td">
    {p.bookingId?.vehicleId?.name || "N/A"}
  </td>

  {/* ✅ VEHICLE ID */}
  <td className="custom-td">
    {p.bookingId?.vehicleId?.vehicleId ||
     p.bookingId?.vehicleId?._id?.slice(-6) ||
     "N/A"}
  </td>

  <td className="custom-td">${p.amount}</td>

  <td className="custom-td">
    {new Date(p.paidAt || p.createdAt).toLocaleString()}
  </td>
</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VEHICLE FLEET AVAILABILITY - Highlighted when coming from Active Rentals */}
              <div 
                ref={vehiclesRef} 
                className="glass-card" 
                style={{ 
                  padding: "25px",
                  border: activeReportTab === "vehicles" ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                  transition: "all 0.3s ease"
                }}
              >
                <h4 style={{ margin: "0 0 15px", fontSize: "18px", color: "white" }}>🚘 Vehicle Fleet Availability</h4>
                <div className="custom-table-container">
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
  {reports.vehicles.map(v => (
    <tr key={v._id} className="custom-tr">

      {/* ✅ VEHICLE ID */}
      <td className="custom-td" style={{ fontFamily: "monospace" }}>
        {v.vehicleId || v._id.slice(-6)}
      </td>

      {/* ✅ NAME */}
      <td className="custom-td custom-td-primary">
        {v.name}
      </td>

      {/* ✅ CATEGORY */}
      <td className="custom-td">
        {v.type.toUpperCase()}
      </td>

      {/* ✅ PRICE */}
      <td className="custom-td">
        ${v.pricePerDay}
      </td>

      {/* ✅ LOCATION */}
      <td className="custom-td">
        {v.location}
      </td>

      {/* ✅ DATE */}
      <td className="custom-td">
        {v.createdAt
          ? new Date(v.createdAt).toLocaleDateString()
          : "N/A"}
      </td>

      {/* ✅ STATUS */}
      <td className="custom-td">
        <span style={{
          color: v.isAvailable ? "var(--success)" : "var(--warning)",
          fontWeight: "bold"
        }}>
          ● {v.isAvailable ? "Available In Stock" : "Rented Out"}
        </span>
      </td>

    </tr>
  ))}
</tbody>

                  </table>
                </div>
              </div>

              {/* CUSTOMER FEEDBACK & COMPLAINTS - Highlighted when coming from Satisfaction Rating */}
              <div 
                ref={feedbackRef} 
                className="glass-card" 
                style={{ 
                  padding: "25px",
                  border: activeReportTab === "feedback" ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                  transition: "all 0.3s ease"
                }}
              >
                <h4 style={{ margin: "0 0 15px", fontSize: "18px", color: "white" }}>💬 Customer Feedbacks & Complaints</h4>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th className="custom-th">CUSTOMER</th>
                        <th className="custom-th">TYPE</th>
                       <th className="custom-th">RATING</th>
                       <th className="custom-th">COMMENTS</th>
                        <th className="custom-th">STAFF REPLY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.feedback
  .filter(f => {
    if (!selectedDate) return true;

    return (
      new Date(f.createdAt).toDateString() ===
      new Date(selectedDate).toDateString()
    );
  })
  .map(f => (

                       <tr key={f._id} className="custom-tr">

  {/* CUSTOMER */}
  <td className="custom-td">
    {f.customerId?.name || "Deleted"}
  </td>


  {/* ✅ ✅ PUT YOUR CODE HERE */}
  <td className="custom-td">
    {f.bookingId?.vehicleId?.name || "N/A"}
    <br />
    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
      ID: {f.bookingId?.vehicleId?.vehicleId || f.bookingId?.vehicleId?._id?.slice(-6)}
    </span>
  </td>

  {/* RATING */}
  <td className="custom-td">
    {f.rating ? `${f.rating} ★` : "-"}
  </td>

  {/* COMMENTS */}
  <td className="custom-td" style={{ fontStyle: "italic" }}>
    "{f.comment}"
  </td>

  {/* STAFF REPLY */}
  <td className="custom-td">
    {f.staffReplies && f.staffReplies.length > 0 ? (
      <div>
        {f.staffReplies.map(r => (
          <p key={r._id}>• {r.replyText}</p>
        ))}
      </div>
    ) : f.staffResponse ? (
      <p>{f.staffResponse}</p>
    ) : (
      <em style={{ color: "var(--text-muted)" }}>No response</em>
    )}
  </td>

</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

                {/* PROFILE SETTINGS */}
        {activePage === "profile" && (
          <div className="slide-up">
            <div className="glass-card" style={{ padding: "35px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", marginBottom: "10px" }}>👤 Edit Admin Profile</h2>
              <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "30px" }}>Modify your admin login credentials.</p>

              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="custom-input" required />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Email Address</label>
                  <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="custom-input" required />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">New Password (Leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} className="custom-input" />
                </div>
                <button type="submit" className="btn-base btn-primary" style={{ width: "100%", marginTop: "10px" }}>Save Changes</button>
              </form>
            </div>
          </div>
        )}
              {/* Profile Quick Edit Modal */}
      {showProfileModal && (
        <div className="custom-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Edit Profile</h3>
            
            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Full Name</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="custom-input" required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Email Address</label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="custom-input" required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">New Password (Leave blank to keep current)</label>
                <input type="password" placeholder="••••••••" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} className="custom-input" />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>

      {/* STAFF CREATE MODAL */}
      {showStaffModal && (
        <div className="custom-modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>👤 Register Staff Account</h3>

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Name</label>
                <input type="text" placeholder="e.g. John Staff" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Email Address</label>
                <input type="email" placeholder="staff@quickride.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Password</label>
                <input type="password" placeholder="••••••••" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowStaffModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Register Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CREATE MODAL */}
      {showPromoModal && (
        <div className="custom-modal-overlay" onClick={() => setShowPromoModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>🏷️ Add Promo Discount</h3>

            <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Promo Code (Uppercase, e.g. RIDE50)</label>
                <input type="text" placeholder="e.g. RIDE25" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="custom-input" required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Discount Percentage (%)</label>
                <input type="number" min="1" max="100" placeholder="e.g. 25" value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowPromoModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Add Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const NavItem = ({ label, active, onClick }) => (
  <div className={`nav-link-item ${active ? "nav-link-item-active" : ""}`} onClick={onClick}>
    {label}
  </div>
);

const DashboardCard = ({ icon, title, value, color, onClick }) => (
  <div 
    className="glass-card dashboard-card-metric"
    onClick={onClick}
    style={{ 
      position: "relative", 
      overflow: "hidden",
      cursor: "pointer"   // 👈 add this
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: color }} />
    <div className="metric-icon-wrap" style={{ background: color, color: "white" }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0 }}>{title}</p>
      <h2>{value}</h2>
    </div>
  </div>
);