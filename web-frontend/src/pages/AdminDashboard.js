import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Navigation
  const [activePage, setActivePage] = useState("dashboard");

  // Stats State
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeRentals: 0,
    totalCustomers: 0,
    pendingBookings: 0,
    completedRentals: 0,
    monthlyRevenue: 0,
    totalBookings: null,
    availableVehicles: null
  });

  // Data Lists
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [reports, setReports] = useState({ bookings: [], payments: [], vehicles: [], feedback: [], auditLog: [] });
  const [loading, setLoading] = useState(true);

  // Profile Settings
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileEmail, setProfileEmail] = useState(user.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Staff Account Form
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [staffRole, setStaffRole] = useState("staff");

  // ID Verification Modal
  const [showIdVerificationModal, setShowIdVerificationModal] = useState(false);
  const [selectedUserForVerification, setSelectedUserForVerification] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tracks whether the admin has manually touched the Users List filter,
  // so we only auto-jump to "Pending Verification" the first time a queue appears.
  const hasManuallyFiltered = useRef(false);

  // Promo Code Form
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPromos();
    fetchReports();
    fetchPendingVerifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchPendingVerifications, 25000); // every 25 seconds
    return () => clearInterval(interval);
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

  // Delete User (only for deactivated users)
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(
        `http://localhost:5000/api/auth/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User deleted successfully ✅");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Staff creation
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) return alert("Fill all fields");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff",
        { name: staffName, email: staffEmail, password: staffPassword, role: staffRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`New ${staffRole} created successfully ✅`);
      setShowStaffModal(false);
      setStaffName("");
      setStaffEmail("");
      setStaffPassword("");
      setStaffRole("staff");
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
        { name: profileName, email: profileEmail, password: profilePassword || undefined },
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

  const handleOpenIdVerification = (user) => {
    setSelectedUserForVerification(user);
    setShowIdVerificationModal(true);
  };

  const handleApproveVerification = async () => {
    if (!selectedUserForVerification) return;
    try {
      await axios.put(
        `http://localhost:5000/api/auth/users/${selectedUserForVerification._id}/verify`,
        { verificationStatus: "Verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("ID verification approved ✅");
      setShowIdVerificationModal(false);
      setSelectedUserForVerification(null);
      fetchUsers();
      fetchPendingVerifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve verification");
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedUserForVerification) return;
    try {
      await axios.put(
        `http://localhost:5000/api/auth/users/${selectedUserForVerification._id}/verify`,
        { verificationStatus: "Not Verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("ID verification rejected ❌");
      setShowIdVerificationModal(false);
      setSelectedUserForVerification(null);
      fetchUsers();
      fetchPendingVerifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject verification");
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users?verificationStatus=Pending Review", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    let cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
    cleanPath = cleanPath.includes('uploads') ? '/' + cleanPath : `/uploads/${cleanPath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  // Placeholder — wire up to a real backend endpoint (e.g. POST /api/dashboard/monthly-report)
  // that generates and returns a PDF, then trigger the download here.
  const handleGenerateMonthlyReport = () => {
    alert("Monthly PDF report generation isn't wired up to the backend yet — let's build that endpoint next.");
  };

  // Navigating to Users List: auto-select "Pending Verification" only the first
  // time there's a queue and the admin hasn't manually picked a filter yet.
  const handleUsersNavClick = () => {
    setActivePage("users");
    if (unreadCount > 0 && !hasManuallyFiltered.current) {
      setUserFilter("pending");
    }
  };

  const handleUserFilterChange = (value) => {
    hasManuallyFiltered.current = true;
    setUserFilter(value);
  };

  // Derived stats with safe fallbacks in case the backend hasn't added these fields yet
  const totalBookingsDisplay = stats.totalBookings ?? reports.bookings.length;
  const availableVehiclesDisplay =
    stats.availableVehicles ?? Math.max(stats.totalVehicles - stats.activeRentals, 0);

  const recentBookings = [...reports.bookings]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }} className="fade-in">
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }}></div>
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-100px", right: "-100px" }}></div>

      {/* Navbar */}
      <nav className="navbar-custom">
        <div className="navbar-container">
          <div className="nav-logo">
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🛠️</span>
            <span>QuickRide <span style={{ color: "var(--accent)" }}>Admin </span></span>
          </div>

          <div className="nav-links-wrap">
            <NavItem label="Overview" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <NavItem
              label="Users List"
              active={activePage === "users"}
              badge={unreadCount}
              onClick={handleUsersNavClick}
            />
            <NavItem label="Promo Codes" active={activePage === "promos"} onClick={() => setActivePage("promos")} />
          </div>

          <div style={{ position: "relative" }}>
            <div
              className="profile-pill"
              onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
              style={{ cursor: "pointer" }}
            >
              <span style={{ fontSize: "18px" }}>👤</span>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.name || "Admin"}</span>
              <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown-menu glass-card scale-in" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: "center", padding: "15px", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "white", margin: "0 auto 10px" }}>👤</div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{user.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0" }}>{user.email}</p>
                </div>
                <div
                  style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid var(--border-color)" }}
                  onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
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

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px 40px 20px", position: "relative", zIndex: 1 }}>

        {/* OVERVIEW STATS + REPORT CARDS */}
        {activePage === "dashboard" && (
          <div className="slide-up">
            {/* Compact welcome banner */}
            <div
              className="welcome-banner-wrap"
              style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "white" }}>Welcome Admin, {user.name}! 👑</h1>
                <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Oversee user accounts, register staff, configure promos, and read activity reports.
                </p>
              </div>
              <div style={{ fontSize: "36px", opacity: 0.8 }}>📊</div>
            </div>

            {unreadCount > 0 && (
              <div
                className="glass-card"
                style={{
                  marginTop: "20px", padding: "14px 20px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: "16px", cursor: "pointer",
                  border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)"
                }}
                onClick={handleUsersNavClick}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🪪</span>
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                    <strong>{unreadCount}</strong> customer{unreadCount > 1 ? "s" : ""} waiting for ID verification
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: "700" }}>Review now →</span>
              </div>
            )}

            {/* Overview Metric Cards */}
            <div className="dashboard-grid" style={{ marginTop: "25px" }}>
              <DashboardCard icon="🚘" title="TOTAL VEHICLES" value={stats.totalVehicles} color="var(--primary)" />
              <DashboardCard icon="🚗" title="ACTIVE RENTALS" value={stats.activeRentals} color="var(--secondary)" />
              <DashboardCard icon="👥" title="TOTAL CUSTOMERS" value={stats.totalCustomers} color="var(--accent)" />
              <DashboardCard icon="⏳" title="PENDING BOOKINGS" value={stats.pendingBookings} color="var(--warning)" />
              <DashboardCard icon="✅" title="COMPLETED RENTALS" value={stats.completedRentals} color="var(--success)" />
              <DashboardCard icon="💰" title="MONTHLY REVENUE" value={`$${stats.monthlyRevenue}`} color="var(--success)" />
              <DashboardCard icon="📑" title="TOTAL BOOKINGS" value={totalBookingsDisplay} color="var(--secondary)" />
              <DashboardCard icon="🟢" title="AVAILABLE VEHICLES" value={availableVehiclesDisplay} color="var(--primary)" />
            </div>

            {/* Recent Bookings */}
            <div style={{ marginTop: "40px" }}>
              <h2 style={{ marginBottom: "18px", color: "var(--text-primary)", fontSize: "20px" }}>🕒 Recent Bookings</h2>
              <div className="glass-card" style={{ padding: "20px" }}>
                {loading ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>Loading...</p>
                ) : recentBookings.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>No bookings yet.</p>
                ) : (
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th className="custom-th">BOOKING ID</th>
                          <th className="custom-th">CUSTOMER</th>
                          <th className="custom-th">VEHICLE</th>
                          <th className="custom-th">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map(b => (
                          <tr key={b._id} className="custom-tr">
                            <td className="custom-td" style={{ fontFamily: "monospace" }}>{b._id.slice(-6).toUpperCase()}</td>
                            <td className="custom-td">{b.customerId?.name || "Deleted"}</td>
                            <td className="custom-td">{b.vehicleId?.name || "Deleted"}</td>
                            <td className="custom-td">
                              <span className={`badge-base badge-${b.status}`}>{b.status.toUpperCase()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Report Cards - Clickable, each navigates to its own report page */}
            <div style={{ marginTop: "40px" }}>
              <h2 style={{ marginBottom: "25px", color: "var(--text-primary)" }}>📊 Quick Reports</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div
                  className="glass-card"
                  style={{ padding: "25px", cursor: "pointer", transition: "transform 0.2s ease" }}
                  onClick={() => navigate("/admin/reports/bookings")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>Booking Logs</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>View all bookings and their current status</p>
                </div>

                <div
                  className="glass-card"
                  style={{ padding: "25px", cursor: "pointer", transition: "transform 0.2s ease" }}
                  onClick={() => navigate("/admin/reports/payments")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>💰 Invoice Payments Log</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>All transactions, refunds and payment history</p>
                </div>

                <div
                  className="glass-card"
                  style={{ padding: "25px", cursor: "pointer", transition: "transform 0.2s ease" }}
                  onClick={() => navigate("/admin/reports/vehicle-fleet")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>🚘 Vehicle Fleet Availability</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>Current stock and rented out vehicles</p>
                </div>

                <div
                  className="glass-card"
                  style={{ padding: "25px", cursor: "pointer", transition: "transform 0.2s ease" }}
                  onClick={() => navigate("/admin/reports/feedback")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>💬 Customer Feedbacks & Complaints</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>Ratings, comments and staff replies</p>
                </div>

                <div
                  className="glass-card"
                  style={{ padding: "25px", cursor: "pointer", transition: "transform 0.2s ease" }}
                  onClick={() => navigate("/admin/reports/audit-log")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>📋 Staff Action Audit Log</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>All staff and admin activities</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
                <button className="btn-base btn-secondary" onClick={() => navigate("/admin/reports/bookings")}>
                  🔗 View All Reports
                </button>
                <button className="btn-base btn-primary" onClick={handleGenerateMonthlyReport}>
                  📥 Generate Monthly Report (PDF)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS LIST */}
        {activePage === "users" && (
          <div className="slide-up" style={{ marginTop: "50px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>User Accounts Registry 👥</h2>
              <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                <select
                  value={userFilter}
                  onChange={(e) => handleUserFilterChange(e.target.value)}
                  className="custom-input"
                  style={{ maxWidth: "220px" }}
                >
                  <option value="all">All Users</option>
                  <option value="pending">Pending Verification {unreadCount > 0 ? `(${unreadCount})` : ""}</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <button className="btn-base btn-primary" onClick={() => { setStaffName(""); setStaffEmail(""); setStaffPassword(""); setStaffRole("staff"); setShowStaffModal(true); }}>➕ Register Staff / Admin</button>
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="custom-th">NAME</th>
                    <th className="custom-th">EMAIL</th>
                    <th className="custom-th">ROLE</th>
                    <th className="custom-th">VERIFICATION STATUS</th>
                    <th className="custom-th">ACCOUNT STATUS</th>
                    <th className="custom-th">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(userFilter === "pending" ? notifications : users.filter(u => userFilter === "all" ? true : u.role === userFilter))
  .map(u => (
                      <tr key={u._id} className="custom-tr">
                        <td className="custom-td custom-td-primary">{u.name}</td>
                        <td className="custom-td">{u.email}</td>
                        <td className="custom-td">
                          <StatusPill
                            label={u.role.toUpperCase()}
                            tone={u.role === "admin" ? "danger" : u.role === "staff" ? "accent" : "neutral"}
                          />
                        </td>
                        <td className="custom-td">
                          {u.role === "customer" ? (
                            <StatusPill
                              label={u.verificationStatus || "Not Verified"}
                              tone={
                                u.verificationStatus === "Verified" ? "success" :
                                u.verificationStatus === "Pending Review" ? "warning" : "neutral"
                              }
                            />
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                        <td className="custom-td">
                          <span style={{ color: u.isActive ? "var(--success)" : "var(--danger)", fontWeight: "bold" }}>
                            ● {u.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="custom-td">
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {u.role === "customer" && (
                              <button
                                className="btn-base btn-secondary"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => handleOpenIdVerification(u)}
                              >
                                View ID
                              </button>
                            )}
                            {u._id !== user._id && (
                              <>
                                <button
                                  className={`btn-base ${u.isActive ? "btn-danger" : "btn-success"}`}
                                  style={{ padding: "4px 8px", fontSize: "11px" }}
                                  onClick={() => handleToggleUser(u._id)}
                                >
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </button>
                                {!u.isActive && (
                                  <button
                                    className="btn-base btn-danger"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    title="Permanently Delete User"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </>
                            )}
                          </div>
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

      {/* REGISTER STAFF / ADMIN MODAL */}
      {showStaffModal && (
        <div className="custom-modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Register New Account</h3>
            <form onSubmit={handleCreateStaff} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Name</label>
                <input type="text" placeholder="e.g. John Doe" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="custom-input" autoComplete="off" required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Email Address</label>
                <input type="email" placeholder="example@quickride.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="custom-input" autoComplete="off" name="new-staff-email" required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Password</label>
                <input type="password" placeholder="••••••••" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="custom-input" autoComplete="new-password" name="new-staff-password" required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Role</label>
                <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="custom-input" required>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowStaffModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Register</button>
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

      {/* ID VERIFICATION MODAL */}
      {showIdVerificationModal && selectedUserForVerification && (
        <div className="custom-modal-overlay" onClick={() => setShowIdVerificationModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>🪪 ID Verification Review</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 5px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>CUSTOMER NAME</p>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{selectedUserForVerification.name}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 5px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>EMAIL</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{selectedUserForVerification.email}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 5px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>NIC NUMBER</p>
                  <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontFamily: "monospace" }}>{selectedUserForVerification.nicNumber || "Not provided"}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 5px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>DRIVING LICENSE</p>
                  <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontFamily: "monospace" }}>{selectedUserForVerification.drivingLicenseNumber || "Not provided"}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>ID PHOTO</p>
                  <div style={{ width: "100%", height: "220px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    {selectedUserForVerification.idPhoto ? (
                      <img
                        src={getFullImageUrl(selectedUserForVerification.idPhoto)}
                        alt="ID Photo"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x220/1f2937/6b7280?text=ID+Photo+Not+Found"; }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No ID photo uploaded</span>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>LICENSE PHOTO</p>
                  <div style={{ width: "100%", height: "220px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    {selectedUserForVerification.licensePhoto ? (
                      <img
                        src={getFullImageUrl(selectedUserForVerification.licensePhoto)}
                        alt="License Photo"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x220/1f2937/6b7280?text=License+Not+Found"; }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No license photo uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                padding: "12px",
                background: selectedUserForVerification.verificationStatus === "Verified" ? "rgba(16,185,129,0.1)" :
                            selectedUserForVerification.verificationStatus === "Pending Review" ? "rgba(245,158,11,0.1)" :
                            "rgba(148,163,184,0.1)",
                borderRadius: "8px",
                border: "1px solid " + (selectedUserForVerification.verificationStatus === "Verified" ? "rgba(16,185,129,0.3)" :
                          selectedUserForVerification.verificationStatus === "Pending Review" ? "rgba(245,158,11,0.3)" :
                          "rgba(148,163,184,0.3)")
              }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                  Current Status: <span style={{
                    color: selectedUserForVerification.verificationStatus === "Verified" ? "#10b981" :
                           selectedUserForVerification.verificationStatus === "Pending Review" ? "#f59e0b" :
                           "#94a3b8"
                  }}>{selectedUserForVerification.verificationStatus || "Not Verified"}</span>
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  className="btn-base btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setShowIdVerificationModal(false); setSelectedUserForVerification(null); }}
                >
                  Cancel
                </button>
                <button className="btn-base btn-danger" style={{ flex: 1 }} onClick={handleRejectVerification}>Reject</button>
                <button className="btn-base btn-success" style={{ flex: 1 }} onClick={handleApproveVerification}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatusPill = ({ label, tone = "neutral" }) => {
  const tones = { success: "#10b981", warning: "#f59e0b", danger: "#f43f5e", accent: "#818cf8", neutral: "#94a3b8" };
  const c = tones[tone] || tones.neutral;
  return (
    <span style={{
      padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700",
      display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
      color: c, background: `${c}26`, border: "1px solid transparent"
    }}>
      {label}
    </span>
  );
};

const NavItem = ({ label, active, onClick, badge }) => (
  <div className={`nav-link-item ${active ? "nav-link-item-active" : ""}`} onClick={onClick} style={{ position: "relative" }}>
    {label}
    {badge > 0 && (
      <span style={{
        marginLeft: "6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "18px",
        height: "18px",
        padding: "0 5px",
        borderRadius: "999px",
        background: "#ef4444",
        color: "white",
        fontSize: "10px",
        fontWeight: "700",
        verticalAlign: "middle"
      }}>
        {badge}
      </span>
    )}
  </div>
);

const DashboardCard = ({ icon, title, value, color, onClick }) => (
  <div className="glass-card dashboard-card-metric" onClick={onClick} style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}>
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