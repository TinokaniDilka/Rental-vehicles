import React, { useState, useEffect } from "react";

export default function RenterDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [activePage, setActivePage] = useState("dashboard");
  const [bookings, setBookings] = useState([]);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(user.profileImage || null);
// ✅ FETCH BOOKINGS FOR THIS RENTER
const fetchBookings = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/bookings/renter", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setBookings(data);

  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
};
  // ==================== FETCH ONLY CURRENT RENTER'S VEHICLES ====================
  const fetchMyVehicles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vehicles/my-vehicles", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const myVehicles = await res.json();
      setVehicles(myVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
  if (!token) {
    alert("Please login first!");
    window.location.href = "/login";
    return;
  }

  fetchMyVehicles();
  fetchBookings();    // ✅ ADD THIS
}, [token]);


  // Add / Update Vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      return alert("Please fill all fields");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("pricePerDay", price);
    formData.append("description", description);
    formData.append("type", "car");
    formData.append("location", "Colombo");

    if (image) formData.append("image", image);

    try {
      let url = "http://localhost:5000/api/vehicles";
      let method = "POST";

      if (editId) {
        url = `http://localhost:5000/api/vehicles/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        alert(editId ? "Vehicle Updated ✅" : "Vehicle Added ✅");
        setName(""); 
        setPrice(""); 
        setDescription(""); 
        setImage(null); 
        setEditId(null);
        fetchMyVehicles();
        setActivePage("vehicles"); // Switch to vehicle list page
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save vehicle");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the vehicle.");
    }
  };

  const handleEdit = (v) => {
    setName(v.name);
    setPrice(v.pricePerDay);
    setDescription(v.description);
    setEditId(v._id);
    setActivePage("add-edit"); // Switch to edit form page
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("Vehicle deleted successfully ✅");
        fetchMyVehicles();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to delete vehicle");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting vehicle");
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserProfileImage(reader.result);
        alert("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={dashboardWrapper}>
      {/* Background Orbs */}
      <div style={glowOrb1}></div>
      <div style={glowOrb2}></div>

      {/* Navigation Bar */}
      <nav style={navBar}>
        <div style={navContainer}>
          <div style={logo} onClick={() => setActivePage("dashboard")}>
            <span style={{ fontSize: "30px", marginRight: "10px", filter: "drop-shadow(0 2px 8px rgba(99,102,241,0.5))" }}>🚗</span>
            <span style={logoText}>Rental<span style={{ color: "hsl(243, 100%, 76%)" }}>Hub</span></span>
          </div>

          <div style={navLinks}>
            <NavItem label="Dashboard" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <NavItem label="My Vehicles" active={activePage === "vehicles"} onClick={() => setActivePage("vehicles")} />
            <NavItem label="Add Vehicle" active={activePage === "add-edit"} onClick={() => { setEditId(null); setName(""); setPrice(""); setDescription(""); setImage(null); setActivePage("add-edit"); }} />
            <NavItem label="Bookings" active={activePage === "bookings"} onClick={() => setActivePage("bookings")} />
          </div>

          <div style={profileSection} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div style={userAvatar}>
              {userProfileImage ? (
                <img src={userProfileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "16px", color: "white" }}>👤</span>
              )}
            </div>
            <span style={userNameStyle}>{user.name || "Renter"}</span>
            <span style={{ fontSize: "10px", marginLeft: "4px", color: "#a5b4fc" }}>▼</span>
          </div>
        </div>

        {showProfileDropdown && (
          <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
            <div style={dropdownHeader}>
              <div style={userAvatarLarge}>
                {userProfileImage ? (
                  <img src={userProfileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "40px", color: "#6366f1" }}>👤</span>
                )}
              </div>
              <h4 style={{ margin: "10px 0 2px", color: "#1e1b4b" }}>{user.name }</h4>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>{user.email || "user@example.com"}</p>
            </div>

            <hr style={divider} />

            <label style={menuItem} htmlFor="profile-upload">📸 Change Profile Picture</label>
            <input id="profile-upload" type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: "none" }} />

            <div style={menuItem}>👤 Edit Profile</div>
            <div style={menuItem}>🔑 Change Password</div>

            <hr style={divider} />

            <div style={logoutMenuItem} onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}>
              Logout
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={mainContent}>
        {activePage === "dashboard" && (
          <div style={fadeAnimation}>
            <div style={welcomeBanner}>
              <div style={{ flex: 1 }}>
                <h1 style={welcomeHeading}>Welcome back, {user.name || "Renter"} 👋</h1>
                <p style={welcomeSub}>Manage your rental empire, track performance, and inspect earnings in one central dashboard.</p>
              </div>
              <div style={bannerGraphic}>🚘</div>
            </div>

            <div style={dashboardGrid}>
              <DashboardCard icon="🚘" title="Total Vehicles" value={vehicles.length} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              <DashboardCard icon="📅" title="Active Rentals" value={activeCount} color="linear-gradient(135deg, #3b82f6, #2563eb)" />
              <DashboardCard icon="💰" title="Total Earnings" value={`$${earnings}`} color="linear-gradient(135deg, #10b981, #059669)" />
            </div>

            {/* Quick Actions Card */}
            <div style={sectionCard}>
              <h3 style={sectionTitle}>⚡ Quick Operations</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                <button style={primaryBtn} onClick={() => { setEditId(null); setName(""); setPrice(""); setDescription(""); setImage(null); setActivePage("add-edit"); }}>
                  ➕ List a New Vehicle
                </button>
                <button style={secondaryBtn} onClick={() => setActivePage("vehicles")}>
                  👁️ View Active Vehicles
                </button>
              </div>
            </div>
          </div>
        )}

        {activePage === "vehicles" && (
          <div style={fadeAnimation}>
            <div style={headerRow}>
              <h2>My Registered Vehicles ({vehicles.length})</h2>
              <button style={primaryBtnSmall} onClick={() => { setEditId(null); setName(""); setPrice(""); setDescription(""); setImage(null); setActivePage("add-edit"); }}>
                ➕ Add New Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px", marginBottom: "15px" }}>📭</span>
                <h3>No Vehicles Added Yet</h3>
                <p style={{ color: "#6b7280", maxWidth: "400px", margin: "10px auto 25px" }}>
                  Start earning revenue by putting your unused vehicles up for rent. Add your first vehicle now!
                </p>
                <button style={primaryBtn} onClick={() => setActivePage("add-edit")}>
                  Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div style={vehicleGrid}>
                {vehicles.map((v) => (
                  <div key={v._id} style={vehicleCard}>
                    <div style={cardImageWrapper}>
                      {v.image ? (
                        <img src={`http://localhost:5000${v.image}`} alt={v.name} style={cardImage} />
                      ) : (
                        <div style={placeholderImage}>🚗 No Image</div>
                      )}
                      <div style={cardBadge}>Available</div>
                    </div>
                    <div style={cardBody}>
                      <h4 style={cardName}>{v.name}</h4>
                      <p style={cardPrice}>${v.pricePerDay}<span style={{ fontSize: "13px", fontWeight: "normal", color: "#6b7280" }}>/day</span></p>
                      <p style={cardDescription}>{v.description || "No description provided."}</p>
                      
                      <hr style={cardDivider} />
                      
                      <div style={cardActionRow}>
                        <button style={cardEditBtn} onClick={() => handleEdit(v)}>✏️ Edit</button>
                        <button style={cardDeleteBtn} onClick={() => handleDelete(v._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === "add-edit" && (
          <div style={fadeAnimation}>
            <div style={formWrapper}>
              <div style={formTitleHeader}>
                <h2>{editId ? "✏️ Edit Vehicle Listing" : "🚘 Register New Vehicle"}</h2>
                <p style={{ color: "#6b7280", margin: "5px 0 0" }}>Enter the details of your vehicle to make it available for rental.</p>
              </div>
              <form onSubmit={handleSubmit} style={formStyle}>
                <div style={formGroup}>
                  <label style={formLabel}>Vehicle Model Name</label>
                  <input style={formInput} placeholder="e.g., Tesla Model Y (2024)" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div style={formGroup}>
  <label style={formLabel}>Rental Price per Day ($)</label>
  <input 
    style={formInput} 
    type="text" 
    inputMode="numeric"
    pattern="[0-9]*"
    placeholder="e.g., 85" 
    value={price} 
    onChange={(e) => {
      // Allow only numbers (including empty)
      const value = e.target.value.replace(/[^0-9]/g, '');
      setPrice(value);
    }} 
    required 
  />
</div>

                <div style={formGroup}>
                  <label style={formLabel}>Detailed Description</label>
                  <textarea style={formTextarea} placeholder="Describe your vehicle features, battery range, passenger capacity, or other amenities..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
                </div>

                <div style={formGroup}>
                  <label style={formLabel}>Upload Vehicle Photo</label>
                  <div style={fileUploadContainer}>
                    <input style={fileInput} type="file" onChange={(e) => setImage(e.target.files[0])} />
                    <span style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                      {image ? `Selected: ${image.name}` : "Leave blank to keep existing picture"}
                    </span>
                  </div>
                </div>

                <div style={formActions}>
                  <button style={cancelBtn} type="button" onClick={() => setActivePage("vehicles")}>Cancel</button>
                  <button style={submitBtn} type="submit">
                    {editId ? "Update Listing" : "Publish Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activePage === "bookings" && (
          <div style={fadeAnimation}>
            <h2>Manage Incoming Bookings</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>Review reservations and details for your vehicles.</p>
            {bookings.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px", marginBottom: "15px" }}>📅</span>
                <h3>No Bookings Recorded Yet</h3>
                <p style={{ color: "#6b7280", maxWidth: "400px", margin: "10px auto" }}>
                  Once customer bookings are processed, you'll find rental dates, scheduled times, and customer contact information here.
                </p>
              </div>
            ) : (
              <div style={vehicleGrid}>
                {bookings.map(b => (
  <div key={b._id} style={vehicleCard}>
    <div style={cardBody}>
      
      <h4 style={cardName}>{b.vehicleId?.name}</h4>

      {/* ✅ DATE RANGE */}
      <p>📅 {b.startDate} → {b.endDate}</p>

      {/* ✅ CUSTOMER INFO */}
      <p>👤 {b.customerId?.name}</p>
      <p>📧 {b.customerId?.email}</p>

    </div>
  </div>
))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ==================== HELPER COMPONENTS ==================== */
const NavItem = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    padding: "8px 18px", 
    borderRadius: "20px", 
    cursor: "pointer",
    fontWeight: active ? "600" : "500",
    color: active ? "white" : "#cbd5e1",
    background: active ? "rgba(99, 102, 241, 0.4)" : "transparent",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: active ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
  }}>{label}</div>
);

const DashboardCard = ({ icon, title, value, color }) => (
  <div style={{
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    transition: "all 0.3s ease",
  }}>
    <div style={{
      width: "60px",
      height: "60px",
      borderRadius: "12px",
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "30px",
      color: "white",
      boxShadow: "0 8px 16px -4px rgba(99,102,241,0.25)"
    }}>{icon}</div>
    <div>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
      <h2 style={{ margin: "5px 0 0", fontSize: "28px", color: "#1e1b4b", fontWeight: "700" }}>{value}</h2>
    </div>
  </div>
);

/* ==================== AESTHETIC STYLING SYSTEM ==================== */
const dashboardWrapper = {
  minHeight: "100vh",
  background: "#f8fafc",
  position: "relative",
  overflow: "hidden",
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
  color: "#1e293b",
};

// Vibrant Ambient Glow Orbs
const glowOrb1 = {
  position: "absolute",
  top: "-150px",
  left: "-150px",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)",
  zIndex: 0,
  pointerEvents: "none",
};

const glowOrb2 = {
  position: "absolute",
  bottom: "-100px",
  right: "-100px",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0) 70%)",
  zIndex: 0,
  pointerEvents: "none",
};

/* Navbar */
const navBar = {
  background: "rgba(15, 23, 42, 0.9)",
  backdropFilter: "blur(16px)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  padding: "16px 0",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const navContainer = {
  maxWidth: "1300px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
};

const logo = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  userSelect: "none"
};

const logoText = {
  fontSize: "22px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
};

const navLinks = {
  display: "flex",
  gap: "8px",
};

const profileSection = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  padding: "6px 16px",
  borderRadius: "30px",
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255,255,255,0.05)",
  transition: "all 0.2s ease",
};

const userAvatar = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const userNameStyle = {
  fontWeight: "600",
  fontSize: "14px",
};

/* Dropdown */
const dropdownStyle = {
  position: "absolute",
  top: "70px",
  right: "24px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
  width: "280px",
  padding: "20px",
  zIndex: 2000,
  border: "1px solid rgba(0,0,0,0.05)",
};

const dropdownHeader = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  paddingBottom: "5px",
};

const userAvatarLarge = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "#eef2ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const divider = {
  margin: "12px 0",
  border: "none",
  borderTop: "1px solid #f1f5f9",
};

const menuItem = {
  display: "block",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background 0.2s ease",
  textAlign: "left",
};

const logoutMenuItem = {
  ...menuItem,
  color: "#ef4444",
  fontWeight: "600",
  background: "#fef2f2",
};

/* Layouts */
const mainContent = {
  maxWidth: "1300px",
  margin: "0 auto",
  padding: "40px 24px",
  position: "relative",
  zIndex: 1,
};

const fadeAnimation = {
  animation: "fadeIn 0.5s ease-out",
};

/* Dashboard Page Elements */
const welcomeBanner = {
  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
  borderRadius: "20px",
  padding: "35px 40px",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "35px",
  boxShadow: "0 20px 40px -15px rgba(30, 27, 75, 0.3)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const welcomeHeading = {
  margin: 0,
  fontSize: "32px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
};

const welcomeSub = {
  margin: "10px 0 0",
  color: "#c7d2fe",
  fontSize: "16px",
  maxWidth: "600px",
  lineHeight: "1.5",
};

const bannerGraphic = {
  fontSize: "80px",
  opacity: "0.85",
  filter: "drop-shadow(0 4px 15px rgba(255,255,255,0.1))",
  userSelect: "none"
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "25px",
  marginBottom: "35px",
};

const sectionCard = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  padding: "30px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
};

const sectionTitle = {
  margin: 0,
  fontSize: "20px",
  color: "#1e1b4b",
  fontWeight: "700",
};

/* Vehicle List Page Elements */
const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};

const vehicleGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "30px",
};

const vehicleCard = {
  background: "rgba(255, 255, 255, 0.85)",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  border: "1px solid rgba(255,255,255,0.7)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
};

const cardImageWrapper = {
  position: "relative",
  height: "180px",
  width: "100%",
  background: "#f1f5f9",
  overflow: "hidden",
};

const cardImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.5s ease",
};

const placeholderImage = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  color: "#94a3b8",
  fontWeight: "500",
};

const cardBadge = {
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "#ecfdf5",
  color: "#059669",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "700",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
};

const cardBody = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
};

const cardName = {
  margin: 0,
  fontSize: "18px",
  color: "#1e1b4b",
  fontWeight: "700",
};

const cardPrice = {
  margin: "6px 0 10px",
  fontSize: "20px",
  fontWeight: "800",
  color: "#6366f1",
};

const cardDescription = {
  margin: 0,
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "1.5",
  flex: 1,
};

const cardDivider = {
  border: "none",
  borderTop: "1px solid #f1f5f9",
  margin: "15px 0",
};

const cardActionRow = {
  display: "flex",
  gap: "10px",
};

const cardEditBtn = {
  flex: 1,
  background: "#f0fdf4",
  color: "#16a34a",
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s ease",
};

const cardDeleteBtn = {
  flex: 1,
  background: "#fef2f2",
  color: "#dc2626",
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s ease",
};

/* Buttons */
const primaryBtn = {
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "white",
  padding: "14px 28px",
  border: "none",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 8px 20px -6px rgba(99,102,241,0.5)",
  transition: "all 0.2s ease",
};

const primaryBtnSmall = {
  ...primaryBtn,
  padding: "10px 18px",
  fontSize: "13px",
  borderRadius: "8px",
};

const secondaryBtn = {
  background: "rgba(255, 255, 255, 0.9)",
  color: "#312e81",
  padding: "14px 28px",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

/* Empty State */
const emptyStateCard = {
  background: "white",
  borderRadius: "20px",
  padding: "60px 40px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  border: "1px solid rgba(0,0,0,0.03)",
};

/* Form Elements */
const formWrapper = {
  background: "white",
  padding: "40px",
  borderRadius: "20px",
  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.04)",
  maxWidth: "600px",
  margin: "0 auto",
  border: "1px solid rgba(0,0,0,0.02)",
};

const formTitleHeader = {
  textAlign: "center",
  marginBottom: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const formLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#475569",
};

const formInput = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  color: "#1e293b",
  outline: "none",
  transition: "all 0.2s ease",
};

const formTextarea = {
  ...formInput,
  resize: "vertical",
};

const fileUploadContainer = {
  border: "2px dashed #cbd5e1",
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
};

const fileInput = {
  maxWidth: "100%",
};

const formActions = {
  display: "flex",
  gap: "15px",
  marginTop: "10px",
};

const submitBtn = {
  flex: 2,
  ...primaryBtn,
  padding: "14px",
};

const cancelBtn = {
  flex: 1,
  background: "#f1f5f9",
  color: "#475569",
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};