import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StaffDashboard() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  // Navigation state
  const [activePage, setActivePage] = useState("dashboard");

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ active: 0, pending: 0 });

  // Profile state
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileEmail, setProfileEmail] = useState(user.email || "");
  const [profilePassword, setProfilePassword] = useState("");

  // Add/Edit Vehicle Form states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [vehicleLocation, setVehicleLocation] = useState("");
  const [vehicleDesc, setVehicleDesc] = useState("");
  const [vehicleImageFile, setVehicleImageFile] = useState(null);

  // Review Booking Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [driverName, setDriverName] = useState("");
  const [discount, setDiscount] = useState("");
  const [additionalFees, setAdditionalFees] = useState("");

  // Return Booking Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState(null);
  const [actualReturnDate, setActualReturnDate] = useState("");
  const [returnMileage, setReturnMileage] = useState("");
  const [returnFuelLevel, setReturnFuelLevel] = useState("100");
  const [returnCondition, setReturnCondition] = useState("Good");
  const [damages, setDamages] = useState("");
  const [damageCharge, setDamageCharge] = useState("");

  // Complaint Response state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState("Open");
  const [staffResponse, setStaffResponse] = useState("");

  useEffect(() => {
    fetchVehicles();
    fetchBookings();
    fetchFeedbacks();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vehicles/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/staff/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);

      // Calculate simple stats
      const pendingCount = res.data.filter(b => b.status === "pending").length;
      const activeCount = res.data.filter(b => b.status === "ongoing").length;
      setStats({ active: activeCount, pending: pendingCount });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/login";
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

  // Open Vehicle Modal for Create/Edit
  const handleOpenVehicleModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      setVehicleName(vehicle.name);
      setVehicleType(vehicle.type);
      setVehiclePrice(vehicle.pricePerDay);
      setVehicleLocation(vehicle.location);
      setVehicleDesc(vehicle.description || "");
    } else {
      setVehicleName("");
      setVehicleType("car");
      setVehiclePrice("");
      setVehicleLocation("");
      setVehicleDesc("");
    }
    setVehicleImageFile(null);
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleName || !vehiclePrice || !vehicleLocation) {
      return alert("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("name", vehicleName);
    formData.append("type", vehicleType);
    formData.append("pricePerDay", vehiclePrice);
    formData.append("location", vehicleLocation);
    formData.append("description", vehicleDesc);
    if (vehicleImageFile) {
      formData.append("image", vehicleImageFile);
    }

    try {
      if (editingVehicle) {
        await axios.put(`http://localhost:5000/api/vehicles/${editingVehicle._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
        alert("Vehicle updated successfully ✅");
      } else {
        await axios.post("http://localhost:5000/api/vehicles", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
        alert("Vehicle added successfully ✅");
      }
      setShowVehicleModal(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving vehicle");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Vehicle deleted successfully ✅");
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting vehicle");
    }
  };

  // Open Booking Review Modal
  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewStatus("approved");
    setDriverName("");
    setDiscount("");
    setAdditionalFees("");
    setShowReviewModal(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${selectedBookingForReview._id}/review`,
        {
          status: reviewStatus,
          driverName: selectedBookingForReview.hasDriver ? driverName : "",
          discount: Number(discount) || 0,
          additionalFees: Number(additionalFees) || 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Booking has been ${reviewStatus} ✅`);
      setShowReviewModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Review submission failed");
    }
  };

  // Start Rental Pickup
  const handlePickup = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rental started successfully! Booking is now ongoing 🚗");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Pickup start failed");
    }
  };

  // Open Return Booking Modal
  const handleOpenReturnModal = (booking) => {
    setSelectedBookingForReturn(booking);
    setActualReturnDate(new Date().toISOString().substring(0, 10));
    setReturnMileage("");
    setReturnFuelLevel("100");
    setReturnCondition("Good");
    setDamages("");
    setDamageCharge("");
    setShowReturnModal(true);
  };

  const handleSaveReturn = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${selectedBookingForReturn._id}/return`,
        {
          actualReturnDate,
          returnMileage: Number(returnMileage) || 0,
          returnFuelLevel: Number(returnFuelLevel) || 100,
          returnCondition,
          damages,
          damageCharge: Number(damageCharge) || 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Vehicle return finalized successfully ✅");
      setShowReturnModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to finalize vehicle return");
    }
  };

  // Open Complaint Modal
  const handleOpenComplaintModal = (item) => {
    setSelectedComplaint(item);
    setComplaintStatus(item.complaintStatus || "Open");
    setStaffResponse(item.staffResponse || "");
    setShowComplaintModal(true);
  };

  const handleSaveComplaintResponse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/feedback/${selectedComplaint._id}/respond`,
        { complaintStatus, staffResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Response updated successfully ✅");
      setShowComplaintModal(false);
      fetchFeedbacks();
    } catch (err) {
      alert("Failed to update response");
    }
  };

  return (
    <div style={dashboardWrapper}>
      <div style={glowOrb1}></div>
      <div style={glowOrb2}></div>

      {/* Navigation Bar */}
      <nav style={navBar}>
  <div style={navContainer}>
    
    {/* Logo */}
    <div style={logo}>
      <span style={{ fontSize: "28px", marginRight: "10px" }}>🛠️</span>
      <span style={logoText}>
        QuickRide <span style={{ color: "#818cf8" }}>Staff Portal</span>
      </span>
    </div>

    {/* Navigation Links */}
    <div style={navLinks}>
      <NavItem label="Dashboard" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
      <NavItem label="Manage Vehicles" active={activePage === "vehicles"} onClick={() => setActivePage("vehicles")} />
      <NavItem label="Booking Approvals" active={activePage === "bookings"} onClick={() => setActivePage("bookings")} />
      <NavItem label="Complaints & Reviews" active={activePage === "complaints"} onClick={() => setActivePage("complaints")} />
      <NavItem label="Profile" active={activePage === "profile"} onClick={() => setActivePage("profile")} />
    </div>

    {/* Profile Section */}
    <div style={{ position: "relative" }}>
      <div
        style={profileSection}
        onClick={(e) => {
          e.stopPropagation();
          setShowProfileMenu(!showProfileMenu);
        }}
      >
        <span style={{ fontSize: "18px", marginRight: "6px" }}>👤</span>
        <span style={userNameStyle}>{user.name || "Staff"}</span>
        <span style={{ marginLeft: "6px" }}>▼</span>
      </div>

      {showProfileMenu && (
        <div style={profileDropdown} onClick={(e) => e.stopPropagation()}>
          <div style={profileHeader}>
            <div style={profileAvatar}>👤</div>
            <h3 style={{ margin: "10px 0 0" }}>{user.name}</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>{user.email}</p>
          </div>

          <div style={profileMenuItem}>📷 Change Profile Picture</div>

          <div
            style={profileMenuItem}
            onClick={() => {
              setActivePage("profile");
              setShowProfileMenu(false);
            }}
          >
            👤 Edit Profile
          </div>

          <div style={profileMenuItem}>🔑 Change Password</div>

          <div style={profileLogout} onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>

  </div> {/* ✅ CLOSE navContainer */}
</nav>
          

      {/* Main Content */}
      <main style={mainContent}>
        
        {/* DASHBOARD PAGE */}
        {activePage === "dashboard" && (
          <div style={fadeAnimation}>
            <div style={welcomeBanner}>
              <div>
                <h1 style={welcomeHeading}>Welcome Back, {user.name}! 👨‍💻</h1>
                <p style={welcomeSub}>Approve rental orders, register vehicle inventory, inspect returns, and answer complaints.</p>
              </div>
              <div style={bannerGraphic}>📋</div>
            </div>

            <div style={dashboardGrid}>
              <DashboardCard icon="⏳" title="PENDING APPROVALS" value={stats.pending} color="linear-gradient(135deg, #f59e0b, #d97706)" />
              <DashboardCard icon="🚗" title="ACTIVE RENTALS" value={stats.active} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              <DashboardCard icon="📂" title="TOTAL VEHICLES LISTED" value={vehicles.length} color="linear-gradient(135deg, #10b981, #059669)" />
            </div>

            <div style={sectionCard}>
              <h3>Quick Operations Shortcuts</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                <button style={primaryBtn} onClick={() => handleOpenVehicleModal(null)}>➕ Add New Vehicle</button>
                <button style={secondaryBtn} onClick={() => setActivePage("bookings")}>📋 Check Pending Orders</button>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE VEHICLES */}
        {activePage === "vehicles" && (
          <div style={fadeAnimation}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div>
                <h2>Vehicle Fleet Inventory 🚘</h2>
                <p style={{ color: "#6b7280", margin: "5px 0 0" }}>Create, view, update, and delete rental cars.</p>
              </div>
              <button style={addBtn} onClick={() => handleOpenVehicleModal(null)}>➕ Add Vehicle</button>
            </div>

            <div style={vehicleGrid}>
              {vehicles.length === 0 ? (
                <div style={{ ...emptyStateCard, gridColumn: "1/-1" }}>
                  <span style={{ fontSize: "50px" }}>🚗</span>
                  <h3>No vehicles listed yet</h3>
                  <p style={{ color: "#6b7280" }}>Click "Add Vehicle" to register a new transport.</p>
                </div>
              ) : (
                vehicles.map(v => (
                  <div key={v._id} style={vehicleCard}>
                    <div style={cardImageWrapper}>
                      {v.image ? (
                        <img src={`http://localhost:5000${v.image}`} alt={v.name} style={cardImage} />
                      ) : (
                        <div style={placeholderImage}>🚗 No Image</div>
                      )}
                      <div style={cardBadge}>{v.isAvailable ? "Available" : "Rented"}</div>
                    </div>
                    <div style={cardBody}>
                      <h4 style={cardName}>{v.name}</h4>
                      <p style={{ margin: "5px 0", color: "#64748b", fontSize: "14px" }}>📍 {v.location} | 📂 {v.type}</p>
                      <p style={cardPrice}>${v.pricePerDay}<span style={{ fontSize: "13px", color: "#6b7280" }}>/day</span></p>
                      <p style={cardDescription}>{v.description || "No description."}</p>
                      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                        <button style={editBtn} onClick={() => handleOpenVehicleModal(v)}>✏️ Edit</button>
                        <button style={deleteBtn} onClick={() => handleDeleteVehicle(v._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BOOKING APPROVALS & WORKFLOW */}
        {activePage === "bookings" && (
          <div style={fadeAnimation}>
            <h2>Manage Booking Requests 📋</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>Process pending approvals, pickups, and return checklists.</p>

            {bookings.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px" }}>📋</span>
                <h3>No Bookings Filed</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {bookings.map(b => {
                  const start = new Date(b.startDate).toLocaleDateString();
                  const end = new Date(b.endDate).toLocaleDateString();
                  return (
                    <div key={b._id} style={bookingListItem}>
                      <div style={{ flex: 2 }}>
                        <h4 style={{ margin: "0 0-5px", fontSize: "18px" }}>{b.vehicleId?.name || "Deleted Vehicle"}</h4>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#475569" }}>
                          👤 <strong>Customer:</strong> {b.customerId?.name} ({b.customerId?.email})
                        </p>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>📅 Duration: {start} - {end}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: b.hasDriver ? "#4f46e5" : "#64748b" }}>
                          🚖 Driver Requested: {b.hasDriver ? "Yes" : "No"}
                          {b.driverName && ` | Assigned: ${b.driverName}`}
                        </p>
                      </div>

                      {/* Financial billing details */}
                      <div style={{ flex: 1, minWidth: "150px" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>INVOICE SUMMARY</p>
                        {b.status !== "pending" ? (
                          <>
                            <p style={{ margin: "2px 0 0", fontSize: "13px" }}>Base: ${b.baseCharge}</p>
                            {b.driverCharge > 0 && <p style={{ margin: 0, fontSize: "13px" }}>Driver: ${b.driverCharge}</p>}
                            {b.discount > 0 && <p style={{ margin: 0, fontSize: "13px", color: "#10b981" }}>Discount: -${b.discount}</p>}
                            {b.additionalFees > 0 && <p style={{ margin: 0, fontSize: "13px" }}>Fees: ${b.additionalFees}</p>}
                            {b.lateReturnCharge > 0 && <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>Late Fee: ${b.lateReturnCharge}</p>}
                            {b.damageCharge > 0 && <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>Damage: ${b.damageCharge}</p>}
                            <h4 style={{ margin: "4px 0 0" }}>Total: ${b.totalAmount}</h4>
                          </>
                        ) : (
                          <p style={{ italic: "true", color: "#94a3b8", fontSize: "13px" }}>Awaiting review...</p>
                        )}
                      </div>

                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "10px", alignItems: "end" }}>
                        <span style={getStatusBadgeStyle(b.status)}>{b.status.toUpperCase()}</span>
                        
                        {/* pending -> approve/reject */}
                        {b.status === "pending" && (
                          <button style={reviewBtn} onClick={() => handleOpenReviewModal(b)}>🔍 Review Request</button>
                        )}

                        {/* paid/confirmed -> pickup */}
                        {b.status === "confirmed" && (
                          <button style={pickupBtn} onClick={() => handlePickup(b._id)}>🚗 Start Rental (Pickup)</button>
                        )}

                        {/* ongoing -> return */}
                        {b.status === "ongoing" && (
                          <button style={returnBtn} onClick={() => handleOpenReturnModal(b)}>🔧 Inspect Return</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS & REVIEWS */}
        {activePage === "complaints" && (
          <div style={fadeAnimation}>
            <h2>Customer Reviews & Complaints 📣</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>Reply to customer complaints and monitor service reviews.</p>

            {feedbacks.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px" }}>💬</span>
                <h3>No Feedbacks Logged</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {feedbacks.map(f => (
                  <div key={f._id} style={bookingListItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={f.type === "complaint" ? complaintBadge : reviewBadge}>{f.type.toUpperCase()}</span>
                        {f.type === "feedback" && <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{"★".repeat(f.rating)}</span>}
                      </div>
                      <p style={{ margin: "5px 0", fontSize: "15px" }}>"{f.comment}"</p>
                      <p style={{ fontSize: "12px", color: "#64748b" }}>
                        From: <strong>{f.customerId?.name}</strong> ({f.customerId?.email}) | Target: {f.bookingId?.vehicleId?.name || "Vehicle"}
                      </p>
                    </div>

                    <div style={{ flex: 1, borderLeft: "1px solid #e2e8f0", paddingLeft: "20px" }}>
                      {f.type === "complaint" ? (
                        <>
                          <p style={{ margin: 0, fontSize: "13px" }}>Status: <strong style={{ color: f.complaintStatus === "Resolved" ? "#10b981" : "#f59e0b" }}>{f.complaintStatus}</strong></p>
                          {f.staffResponse && (
                            <p style={{ margin: "4px 0", fontSize: "13px", color: "#475569" }}><strong>Staff Response:</strong> {f.staffResponse}</p>
                          )}
                          <button style={{ ...editBtn, marginTop: "8px" }} onClick={() => handleOpenComplaintModal(f)}>💬 Resolve / Answer</button>
                        </>
                      ) : (
                        <p style={{ italic: "true", color: "#94a3b8", fontSize: "13px" }}>Feedbacks are view-only</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE PAGE */}
        {activePage === "profile" && (
          <div style={fadeAnimation}>
            <div style={formWrapper}>
              <h2 style={{ textAlign: "center", marginBottom: "10px" }}>👤 Edit Staff Profile</h2>
              <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "30px" }}>Update your contact credentials.</p>

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

      {/* VEHICLE MODAL (ADD / EDIT) */}
      {showVehicleModal && (
        <div style={overlay} onClick={() => setShowVehicleModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editingVehicle ? "✏️ Edit Vehicle" : "➕ Add Vehicle"}</h3>

            <form onSubmit={handleSaveVehicle} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Vehicle Name *</label>
                <input type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} style={formInput} required />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={formLabel}>Category *</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={selectStyle}>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="van">Van</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>

                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={formLabel}>Price Per Day ($) *</label>
                  <input type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} style={formInput} required />
                </div>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Location *</label>
                <input type="text" value={vehicleLocation} onChange={(e) => setVehicleLocation(e.target.value)} style={formInput} required />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Description</label>
                <textarea value={vehicleDesc} onChange={(e) => setVehicleDesc(e.target.value)} style={formTextarea} rows={3} />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Upload Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setVehicleImageFile(e.target.files[0])} style={formInput} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowVehicleModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW BOOKING MODAL */}
      {showReviewModal && selectedBookingForReview && (
        <div style={overlay} onClick={() => setShowReviewModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>🔍 Review Booking Request</h3>
            <p>Calculate invoice values for Customer: {selectedBookingForReview.customerId?.name}</p>

            <form onSubmit={handleSaveReview} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Action</label>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} style={selectStyle}>
                  <option value="approved">Approve Booking</option>
                  <option value="rejected">Reject Booking</option>
                </select>
              </div>

              {reviewStatus === "approved" && (
                <>
                  {selectedBookingForReview.hasDriver && (
                    <div style={formGroup}>
                      <label style={formLabel}>Assign Driver Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. John Driver"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        style={formInput}
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ ...formGroup, flex: 1 }}>
                      <label style={formLabel}>Discount Amount ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        style={formInput}
                      />
                    </div>

                    <div style={{ ...formGroup, flex: 1 }}>
                      <label style={formLabel}>Additional Fees ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={additionalFees}
                        onChange={(e) => setAdditionalFees(e.target.value)}
                        style={formInput}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINAL RETURN INSPECTION MODAL */}
      {showReturnModal && selectedBookingForReturn && (
        <div style={overlay} onClick={() => setShowReturnModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>🔧 Final Return Inspection</h3>
            <p>Perform returns checks for: {selectedBookingForReturn.vehicleId?.name}</p>

            <form onSubmit={handleSaveReturn} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Actual Return Date</label>
                <input type="date" value={actualReturnDate} onChange={(e) => setActualReturnDate(e.target.value)} style={formInput} required />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={formLabel}>Return Mileage (km) *</label>
                  <input type="number" value={returnMileage} onChange={(e) => setReturnMileage(e.target.value)} style={formInput} required />
                </div>

                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={formLabel}>Fuel Level (%) *</label>
                  <input type="number" min="0" max="100" value={returnFuelLevel} onChange={(e) => setReturnFuelLevel(e.target.value)} style={formInput} required />
                </div>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Vehicle Return Condition *</label>
                <select value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} style={selectStyle}>
                  <option value="Good">Good / Undamaged</option>
                  <option value="Dirty">Dirty (Needs cleaning)</option>
                  <option value="Damaged">Damaged (Requires repair charge)</option>
                </select>
              </div>

              {returnCondition === "Damaged" && (
                <>
                  <div style={formGroup}>
                    <label style={formLabel}>Damage Description</label>
                    <input type="text" placeholder="Scratch on passenger door" value={damages} onChange={(e) => setDamages(e.target.value)} style={formInput} />
                  </div>

                  <div style={formGroup}>
                    <label style={formLabel}>Damage Repair Charge ($)</label>
                    <input type="number" placeholder="150" value={damageCharge} onChange={(e) => setDamageCharge(e.target.value)} style={formInput} />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Finalize return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {showComplaintModal && selectedComplaint && (
        <div style={overlay} onClick={() => setShowComplaintModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>💬 Answer Complaint</h3>
            <p style={{ color: "#64748b" }}>Complaint: "{selectedComplaint.comment}"</p>

            <form onSubmit={handleSaveComplaintResponse} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Update Complaint Status</label>
                <select value={complaintStatus} onChange={(e) => setComplaintStatus(e.target.value)} style={selectStyle}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Write Response Comments *</label>
                <textarea
                  placeholder="Type actions taken or response text..."
                  value={staffResponse}
                  onChange={(e) => setStaffResponse(e.target.value)}
                  style={formTextarea}
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowComplaintModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Submit Response</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Styling Helpers
const getStatusBadgeStyle = (status) => {
  const base = { padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
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
    background: active ? "rgba(129, 140, 248, 0.4)" : "transparent",
    transition: "background 0.2s ease"
  }} onClick={onClick}>
    {label}
  </div>
);

const DashboardCard = ({ icon, title, value, color }) => (
  <div style={dashboardCardStyle}>
    <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", color: "white" }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>{title}</p>
      <h2 style={{ margin: "5px 0 0", fontSize: "24px", color: "#1e1b4b", fontWeight: "700" }}>{value}</h2>
    </div>
  </div>
);

// Styles layout
const dashboardWrapper = { minHeight: "100vh", background: "#f8fafc", position: "relative", overflow: "hidden", fontFamily: "'Outfit', 'Inter', sans-serif" };
const glowOrb1 = { position: "absolute", top: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };
const glowOrb2 = { position: "absolute", bottom: "-100px", right: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };

const navBar = { background: "#0f172a", color: "white", padding: "16px 0", position: "sticky", top: 0, zIndex: 1000 };
const navContainer = { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const logo = { display: "flex", alignItems: "center" };
const logoText = { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" };
const navLinks = { display: "flex", gap: "6px" };
const profileSection = { display: "flex", alignItems: "center", padding: "6px 14px", borderRadius: "30px", background: "rgba(255,255,255,0.08)" };
const userNameStyle = { fontWeight: "600", fontSize: "14px" };

const mainContent = { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 };
const welcomeBanner = { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "20px", padding: "30px 40px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "35px" };
const welcomeHeading = { margin: 0, fontSize: "28px", fontWeight: "800" };
const welcomeSub = { margin: "8px 0 0", color: "#cbd5e1", fontSize: "15px" };
const bannerGraphic = { fontSize: "70px", opacity: 0.8 };

const dashboardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "35px" };
const dashboardCardStyle = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" };

const sectionCard = { background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 10px 20px rgba(0,0,0,0.01)", border: "1px solid #f1f5f9" };
const selectStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" };

const vehicleGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px", marginTop: "20px" };
const vehicleCard = { background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column" };
const cardImageWrapper = { position: "relative", height: "160px", background: "#f1f5f9" };
const cardImage = { width: "100%", height: "100%", objectFit: "cover" };
const placeholderImage = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", background: "#f8fafc" };
const cardBadge = { position: "absolute", top: "10px", right: "10px", background: "#ecfdf5", color: "#059669", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" };
const cardBody = { padding: "16px", display: "flex", flexDirection: "column", flex: 1 };
const cardName = { margin: 0, fontSize: "16px", fontWeight: "700" };
const cardPrice = { margin: "4px 0", fontSize: "18px", fontWeight: "800", color: "#818cf8" };
const cardDescription = { margin: "0 0 15px", fontSize: "13px", color: "#6b7280", flex: 1, lineHeight: "1.4" };

const editBtn = { background: "#e2e8f0", color: "#475569", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const deleteBtn = { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const addBtn = { background: "#4f46e5", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const emptyStateCard = { background: "white", borderRadius: "16px", padding: "50px 20px", textAlign: "center", border: "1px solid #f1f5f9" };
const bookingListItem = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", gap: "20px", border: "1px solid #f1f5f9", flexWrap: "wrap", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.01)" };

const reviewBtn = { background: "#4f46e5", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const pickupBtn = { background: "#10b981", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const returnBtn = { background: "#7c3aed", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const formWrapper = { background: "white", padding: "35px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto", border: "1px solid #f1f5f9", boxShadow: "0 10px 20px rgba(0,0,0,0.01)" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const formGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const formLabel = { fontSize: "13px", fontWeight: "600", color: "#475569" };
const formInput = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };
const formTextarea = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", resize: "vertical" };
const submitBtn = { background: "#4f46e5", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", flex: 2 };
const cancelBtn = { background: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", flex: 1 };

const overlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 };
const modal = { background: "white", padding: "30px", borderRadius: "16px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };

const reviewBadge = { background: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };
const complaintBadge = { background: "#fee2e2", color: "#dc2626", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };

const primaryBtn = { ...addBtn };
const secondaryBtn = { background: "white", color: "#0f172a", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const fadeAnimation = { animation: "fadeIn 0.3s ease-out" };
const profileDropdown = {
  position: "absolute",
  top: "60px",
  right: 0,
  width: "260px",
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 9999
};

const profileHeader = {
  textAlign: "center",
  padding: "20px",
  borderBottom: "1px solid #e5e7eb"
};

const profileAvatar = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  color: "white",
  margin: "0 auto"
};

const profileMenuItem = {
  padding: "12px 18px",
  cursor: "pointer",
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9",
  color: "#374151"
};

const profileLogout = {
  padding: "14px 18px",
  cursor: "pointer",
  color: "red",
  fontWeight: "600"
};