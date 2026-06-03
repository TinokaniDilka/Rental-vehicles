import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

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
    customerSatisfaction: 5.0
  });

  // Data Lists
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [reports, setReports] = useState({ bookings: [], payments: [], vehicles: [], feedback: [] });
  const [loading, setLoading] = useState(true);

  // Profile Settings
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileEmail, setProfileEmail] = useState(user.email || "");
  const [profilePassword, setProfilePassword] = useState("");

  // Staff Account Form
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  // Promo Code Form
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

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

  // Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { name: profileName, email: profileEmail, password: profilePassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully ✅");
      setProfilePassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div style={dashboardWrapper}>
      <div style={glowOrb1}></div>
      <div style={glowOrb2}></div>

      {/* Navbar */}
      <nav style={navBar}>
        <div style={navContainer}>
          <div style={logo}>
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🛡️</span>
            <span style={logoText}>QuickRide <span style={{ color: "#f43f5e" }}>Admin Console</span></span>
          </div>

          <div style={navLinks}>
            <NavItem label="Overview" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <NavItem label="Users List" active={activePage === "users"} onClick={() => setActivePage("users")} />
            <NavItem label="Promo Codes" active={activePage === "promos"} onClick={() => setActivePage("promos")} />
            <NavItem label="System Reports" active={activePage === "reports"} onClick={() => setActivePage("reports")} />
            <NavItem label="Profile" active={activePage === "profile"} onClick={() => setActivePage("profile")} />
          </div>

          <div style={profileSection}>
            <span style={{ fontSize: "18px", marginRight: "6px" }}>👤</span>
            <span style={userNameStyle}>{user.name || "Admin"}</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main style={mainContent}>
        
        {/* OVERVIEW STATS */}
        {activePage === "dashboard" && (
          <div style={fadeAnimation}>
            <div style={welcomeBanner}>
              <div>
                <h1 style={welcomeHeading}>Welcome Admin, {user.name}! 👑</h1>
                <p style={welcomeSub}>Oversee user accounts, register operational staff, configure promo offers, and read activity reports.</p>
              </div>
              <div style={bannerGraphic}>📊</div>
            </div>

            <div style={dashboardGrid}>
              <DashboardCard icon="💰" title="MONTHLY REVENUE" value={`$${stats.monthlyRevenue}`} color="linear-gradient(135deg, #10b981, #059669)" />
              <DashboardCard icon="🚗" title="ACTIVE RENTALS" value={stats.activeRentals} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              <DashboardCard icon="⏳" title="PENDING ORDERS" value={stats.pendingBookings} color="linear-gradient(135deg, #f59e0b, #d97706)" />
              <DashboardCard icon="👤" title="TOTAL CUSTOMERS" value={stats.totalCustomers} color="linear-gradient(135deg, #3b82f6, #1d4ed8)" />
              <DashboardCard icon="⭐" title="SATISFACTION RATING" value={`${stats.customerSatisfaction} / 5`} color="linear-gradient(135deg, #ec4899, #be185d)" />
            </div>

            <div style={sectionCard}>
              <h3>Quick Operations Shortcuts</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                <button style={primaryBtn} onClick={() => setShowStaffModal(true)}>👤 Register New Staff Account</button>
                <button style={secondaryBtn} onClick={() => setShowPromoModal(true)}>🏷️ Add Promo Discount</button>
              </div>
            </div>
          </div>
        )}

        {/* USERS LIST */}
        {activePage === "users" && (
          <div style={fadeAnimation}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>User Accounts Registry 👥</h2>
              <button style={addBtn} onClick={() => setShowStaffModal(true)}>➕ Register Staff</button>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>NAME</th>
                  <th style={thStyle}>EMAIL</th>
                  <th style={thStyle}>ROLE</th>
                  <th style={thStyle}>ACCOUNT STATUS</th>
                  <th style={thStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={trStyle}>
                    <td style={tdStyle}><strong>{u.name}</strong></td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: u.role === "admin" ? "#fecdd3" : u.role === "staff" ? "#e0e7ff" : "#f1f5f9",
                        color: u.role === "admin" ? "#be123c" : u.role === "staff" ? "#4338ca" : "#475569"
                      }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: u.isActive ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        ● {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {u._id !== user._id ? (
                        <button
                          style={u.isActive ? blockBtn : unblockBtn}
                          onClick={() => handleToggleUser(u._id)}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "13px", italic: "true" }}>Self Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROMO CODES */}
        {activePage === "promos" && (
          <div style={fadeAnimation}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>Promotional Discounts Manager 🏷️</h2>
              <button style={addBtn} onClick={() => setShowPromoModal(true)}>➕ Add Promo Code</button>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>PROMO CODE</th>
                  <th style={thStyle}>DISCOUNT PERCENTAGE</th>
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No promo codes defined yet.</td>
                  </tr>
                ) : (
                  promos.map(p => (
                    <tr key={p._id} style={trStyle}>
                      <td style={tdStyle}><strong>{p.code}</strong></td>
                      <td style={tdStyle}>{p.discountPercent}% OFF</td>
                      <td style={tdStyle}>
                        <span style={{ color: p.isActive ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                          ● {p.isActive ? "Active" : "Expired/Disabled"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={p.isActive ? blockBtn : unblockBtn}
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
        )}

        {/* REPORTS VIEW */}
        {activePage === "reports" && (
          <div style={fadeAnimation}>
            <h2>Operations Analysis Reports 📊</h2>
            <p style={{ color: "#6b7280", marginBottom: "30px" }}>Extract and audit transaction listings, bookings, feedback logs, and fleet status.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              
              {/* BOOKINGS TABLE */}
              <div style={sectionCard}>
                <h4 style={{ margin: "0 0 15px", fontSize: "18px" }}>📅 System Booking Logs</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>VEHICLE</th>
                        <th style={thStyle}>CUSTOMER</th>
                        <th style={thStyle}>PERIOD</th>
                        <th style={thStyle}>TOTAL BILL</th>
                        <th style={thStyle}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.bookings.map(b => (
                        <tr key={b._id} style={trStyle}>
                          <td style={tdStyle}>{b.vehicleId?.name || "Deleted"}</td>
                          <td style={tdStyle}>{b.customerId?.name || "Deleted"}</td>
                          <td style={tdStyle}>
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </td>
                          <td style={tdStyle}>${b.totalAmount}</td>
                          <td style={tdStyle}>
                            <span style={getStatusBadgeStyle(b.status)}>{b.status.toUpperCase()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAYMENTS TABLE */}
              <div style={sectionCard}>
                <h4 style={{ margin: "0 0 15px", fontSize: "18px" }}>💰 Invoice Payments Log</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>TRANSACTION ID</th>
                        <th style={thStyle}>CUSTOMER</th>
                        <th style={thStyle}>AMOUNT</th>
                        <th style={thStyle}>PAYMENT METHOD</th>
                        <th style={thStyle}>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.payments.map(p => (
                        <tr key={p._id} style={trStyle}>
                          <td style={tdStyle}>{p._id}</td>
                          <td style={tdStyle}>{p.customerId?.name || "Deleted"}</td>
                          <td style={tdStyle}>${p.amount}</td>
                          <td style={tdStyle}>{p.paymentMethod.replace("_", " ").toUpperCase()}</td>
                          <td style={tdStyle}>{new Date(p.paidAt || p.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FLEET AVAILABILITY */}
              <div style={sectionCard}>
                <h4 style={{ margin: "0 0 15px", fontSize: "18px" }}>🚘 Vehicle Fleet Availability</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>VEHICLE NAME</th>
                        <th style={thStyle}>CATEGORY</th>
                        <th style={thStyle}>DAILY RATE</th>
                        <th style={thStyle}>LOCATION</th>
                        <th style={thStyle}>PHYSICAL STATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.vehicles.map(v => (
                        <tr key={v._id} style={trStyle}>
                          <td style={tdStyle}>{v.name}</td>
                          <td style={tdStyle}>{v.type.toUpperCase()}</td>
                          <td style={tdStyle}>${v.pricePerDay}</td>
                          <td style={tdStyle}>{v.location}</td>
                          <td style={tdStyle}>
                            <span style={{
                              color: v.isAvailable ? "#10b981" : "#f59e0b",
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

              {/* CUSTOMER FEEDBACK & COMPLAINTS */}
              <div style={sectionCard}>
                <h4 style={{ margin: "0 0 15px", fontSize: "18px" }}>💬 Customer Feedbacks & Complaints</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>CUSTOMER</th>
                        <th style={thStyle}>TYPE</th>
                        <th style={thStyle}>RATING / COMPLAINT STATUS</th>
                        <th style={thStyle}>COMMENTS</th>
                        <th style={thStyle}>STAFF REPLY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.feedback.map(f => (
                        <tr key={f._id} style={trStyle}>
                          <td style={tdStyle}>{f.customerId?.name || "Deleted"}</td>
                          <td style={tdStyle}>
                            <span style={f.type === "complaint" ? complaintBadge : reviewBadge}>{f.type.toUpperCase()}</span>
                          </td>
                          <td style={tdStyle}>
                            {f.type === "feedback" ? `${f.rating} ★` : f.complaintStatus}
                          </td>
                          <td style={tdStyle}>"{f.comment}"</td>
                          <td style={tdStyle}>{f.staffResponse || <em style={{ color: "#94a3b8" }}>No response</em>}</td>
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
          <div style={fadeAnimation}>
            <div style={formWrapper}>
              <h2 style={{ textAlign: "center", marginBottom: "10px" }}>👤 Edit Admin Profile</h2>
              <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "30px" }}>Modify your admin login credentials.</p>

              <form onSubmit={handleUpdateProfile} style={formStyle}>
                <div style={formGroup}>
                  <label style={formLabel}>Full Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} style={formInput} required />
                </div>
                <div style={formGroup}>
                  <label style={formLabel}>Email Address</label>
                  <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} style={formInput} required />
                </div>
                <div style={formGroup}>
                  <label style={formLabel}>New Password (Leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} style={formInput} />
                </div>
                <button type="submit" style={submitBtn}>Save Changes</button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* STAFF CREATE MODAL */}
      {showStaffModal && (
        <div style={overlay} onClick={() => setShowStaffModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>👤 Register Staff Account</h3>

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Name</label>
                <input type="text" placeholder="e.g. John Staff" value={staffName} onChange={(e) => setStaffName(e.target.value)} style={formInput} required />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Email Address</label>
                <input type="email" placeholder="staff@quickride.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} style={formInput} required />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Password</label>
                <input type="password" placeholder="••••••••" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} style={formInput} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowStaffModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Register Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CREATE MODAL */}
      {showPromoModal && (
        <div style={overlay} onClick={() => setShowPromoModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>🏷️ Add Promo Discount</h3>

            <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Promo Code (Uppercase, e.g. RIDE50)</label>
                <input type="text" placeholder="e.g. RIDE25" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} style={formInput} required />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Discount Percentage (%)</label>
                <input type="number" min="1" max="100" placeholder="e.g. 25" value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} style={formInput} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowPromoModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Add Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helpers
const getStatusBadgeStyle = (status) => {
  const base = { padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" };
  switch (status) {
    case "pending": return { ...base, background: "#fef3c7", color: "#d97706" };
    case "approved": return { ...base, background: "#dbeafe", color: "#2563eb" };
    case "confirmed": return { ...base, background: "#ecfdf5", color: "#059669" };
    case "ongoing": return { ...base, background: "#f5f3ff", color: "#7c3aed" };
    case "completed": return { ...base, background: "#f1f5f9", color: "#475569" };
    case "rejected": return { ...base, background: "#fee2e2", color: "#dc2626" };
    default: return base;
  }
};

const NavItem = ({ label, active, onClick }) => (
  <div style={{
    padding: "8px 18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: active ? "600" : "500",
    color: active ? "white" : "#cbd5e1",
    background: active ? "rgba(244, 63, 94, 0.4)" : "transparent",
    transition: "background 0.2s ease"
  }} onClick={onClick}>
    {label}
  </div>
);

const DashboardCard = ({ icon, title, value, color }) => (
  <div style={dashboardCardStyle}>
    <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "white" }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{title}</p>
      <h2 style={{ margin: "2px 0 0", fontSize: "20px", color: "#1e1b4b", fontWeight: "700" }}>{value}</h2>
    </div>
  </div>
);

// Styles layout
const dashboardWrapper = { minHeight: "100vh", background: "#f8fafc", position: "relative", overflow: "hidden", fontFamily: "'Outfit', 'Inter', sans-serif" };
const glowOrb1 = { position: "absolute", top: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };
const glowOrb2 = { position: "absolute", bottom: "-100px", right: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };

const navBar = { background: "#0f172a", color: "white", padding: "16px 0", position: "sticky", top: 0, zIndex: 1000 };
const navContainer = { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const logo = { display: "flex", alignItems: "center" };
const logoText = { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" };
const navLinks = { display: "flex", gap: "6px" };
const profileSection = { display: "flex", alignItems: "center", padding: "6px 14px", borderRadius: "30px", background: "rgba(255,255,255,0.08)" };
const userNameStyle = { fontWeight: "600", fontSize: "14px" };

const mainContent = { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 };
const welcomeBanner = { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "20px", padding: "30px 40px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "35px" };
const welcomeHeading = { margin: 0, fontSize: "28px", fontWeight: "800" };
const welcomeSub = { margin: "8px 0 0", color: "#cbd5e1", fontSize: "15px" };
const bannerGraphic = { fontSize: "70px", opacity: 0.8 };

const dashboardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "35px" };
const dashboardCardStyle = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" };

const sectionCard = { background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 10px 20px rgba(0,0,0,0.01)", border: "1px solid #f1f5f9" };
const selectStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" };

const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left", background: "white", borderRadius: "12px", overflow: "hidden" };
const thStyle = { padding: "15px 20px", borderBottom: "2px solid #f1f5f9", background: "#f8fafc", color: "#475569", fontWeight: "700", fontSize: "12px", textTransform: "uppercase" };
const trStyle = { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s ease" };
const tdStyle = { padding: "15px 20px", color: "#334155", fontSize: "14px" };

const blockBtn = { background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" };
const unblockBtn = { background: "#d1fae5", color: "#10b981", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" };
const addBtn = { background: "#4f46e5", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };

const formWrapper = { background: "white", padding: "35px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto", border: "1px solid #f1f5f9", boxShadow: "0 10px 20px rgba(0,0,0,0.01)" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const formGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const formLabel = { fontSize: "13px", fontWeight: "600", color: "#475569" };
const formInput = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };
const formTextarea = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", resize: "vertical" };
const submitBtn = { background: "#4f46e5", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", flex: 2 };
const cancelBtn = { background: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", flex: 1 };

const overlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 };
const modal = { background: "white", padding: "30px", borderRadius: "16px", width: "450px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };

const reviewBadge = { background: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };
const complaintBadge = { background: "#fee2e2", color: "#dc2626", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };

const primaryBtn = { ...addBtn, padding: "12px 24px" };
const secondaryBtn = { background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const fadeAnimation = { animation: "fadeIn 0.3s ease-out" };