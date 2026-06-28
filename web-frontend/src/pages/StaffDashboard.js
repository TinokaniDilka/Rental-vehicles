import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StaffDashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

 
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Navigation state
  const [activePage, setActivePage] = useState("dashboard");

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackTab, setFeedbackTab] = useState("reviews");

  const [stats, setStats] = useState({ active: 0, pending: 0 });
  const [earnings, setEarnings] = useState(0);

  // 🔍 Search & Filters
const [searchText, setSearchText] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [dateFilter, setDateFilter] = useState("");
const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");

 const [showNotifications, setShowNotifications] = useState(false);
const [seenBookings, setSeenBookings] = useState(false);
const [seenComplaints, setSeenComplaints] = useState(false);

const notifications = {
  newBookings: seenBookings ? 0 : bookings.filter(b => b.status === "pending" || b.status === "confirmed").length,
  lateReturns: seenBookings ? 0 : bookings.filter(
    b => b.status === "ongoing" && new Date(b.endDate) < new Date()
  ).length,
  complaints: seenComplaints ? 0 : feedbacks.filter(
    f => f.type === "complaint" && f.complaintStatus !== "Resolved"
  ).length
};

const totalNotifications =
  notifications.newBookings +
  notifications.lateReturns +
  notifications.complaints;

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

  // Staff Reply state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedbackForReply, setSelectedFeedbackForReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [isEditingReply, setIsEditingReply] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchBookings();
    fetchFeedbacks();
  }, []);
useEffect(() => {
  const interval = setInterval(() => {
    fetchBookings();
    fetchFeedbacks();
  }, 30000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (activePage === "bookings") {
    setSeenBookings(true);
  }
  if (activePage === "complaints") {
    setSeenComplaints(true);
  }
}, [activePage]);

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

    const newData = res.data;
    const prevCount = bookings.filter(b => b.status === "pending" || b.status === "confirmed").length;
    const newCount = newData.filter(b => b.status === "pending" || b.status === "confirmed").length;

    // Only reset seen if count increased (new booking arrived)
    if (newCount > prevCount) {
      setSeenBookings(false);
    }

    setBookings(newData);

    const pendingCount = newData.filter(b => b.status === "pending").length;
    const activeCount = newData.filter(b => b.status === "ongoing").length;
    const totalEarnings = newData
      .filter(b => ["completed", "ongoing", "confirmed"].includes(b.status))
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    setStats({ active: activeCount, pending: pendingCount });
    setEarnings(totalEarnings);
  } catch (err) {
    console.error(err);
  }
};

const fetchFeedbacks = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/feedback", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newData = res.data;
    const prevCount = feedbacks.filter(f => f.type === "complaint" && f.complaintStatus !== "Resolved").length;
    const newCount = newData.filter(f => f.type === "complaint" && f.complaintStatus !== "Resolved").length;

    // Only reset seen if count increased (new complaint arrived)
    if (newCount > prevCount) {
      setSeenComplaints(false);
    }

    setFeedbacks(newData);
  } catch (err) {
    console.error(err);
  }
};
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { name: profileName, email: profileEmail, password: profilePassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showToast("Profile updated successfully ✅");
      setProfilePassword("");
      setShowProfileModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Profile update failed", "error");
    }
  };

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
        showToast("Vehicle updated successfully ✅");
      } else {
        await axios.post("http://localhost:5000/api/vehicles", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
        showToast("Vehicle added successfully ✅");
      }
      setShowVehicleModal(false);
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || "Error saving vehicle", "error");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Vehicle deleted successfully ✅");
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting vehicle", "error");
    }
  };

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
    
    showToast(`Booking has been ${reviewStatus} ✅`);
    setShowReviewModal(false);
    
    // Refresh data so pending count updates immediately
    await fetchBookings();
  } catch (err) {
    showToast(err.response?.data?.message || "Review submission failed", "error");
  }
};

  const handlePickup = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Rental started successfully! Booking is now ongoing 🚗");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Pickup start failed", "error");
    }
  };

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
      showToast("Vehicle return finalized successfully ✅");
      setShowReturnModal(false);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to finalize vehicle return", "error");
    }
  };

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
      showToast("Response updated successfully ✅");
      setShowComplaintModal(false);
      fetchFeedbacks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update response", "error");
    }
  };

  const handleOpenReplyModal = (feedback) => {
    setSelectedFeedbackForReply(feedback);
    setReplyText("");
    setEditingReplyId(null);
    setIsEditingReply(false);
    setShowReplyModal(true);
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast("Please enter a reply message", "error");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/feedback/${selectedFeedbackForReply._id}/staff-reply`,
        { replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Reply added successfully ✅");
      setShowReplyModal(false);
      setReplyText("");
      fetchFeedbacks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add reply", "error");
    }
  };

  const handleEditReply = (replyId, replyTextValue) => {
    setEditingReplyId(replyId);
    setReplyText(replyTextValue);
    setIsEditingReply(true);
  };

  const handleUpdateReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast("Please enter a reply message", "error");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/feedback/${selectedFeedbackForReply._id}/staff-reply/${editingReplyId}`,
        { replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Reply updated successfully ✅");
      setShowReplyModal(false);
      setReplyText("");
      setEditingReplyId(null);
      setIsEditingReply(false);
      fetchFeedbacks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update reply", "error");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/feedback/${selectedFeedbackForReply._id}/staff-reply/${replyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Reply deleted successfully ✅");
      fetchFeedbacks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete reply", "error");
    }
  };


const reviews = feedbacks.filter(f => f.type === "feedback");
const complaints = feedbacks.filter(f => f.type === "complaint");


  const filteredBookings = bookings.filter(b => {
  const matchesSearch =
    (b.customerId?.name || "").toLowerCase().includes(searchText.toLowerCase());

  const matchesStatus =
    statusFilter === "all" || b.status === statusFilter;

  const matchesDate =
    !dateFilter ||
    new Date(b.startDate).toDateString() === new Date(dateFilter).toDateString();

  const matchesVehicleType =
    vehicleTypeFilter === "all" ||
    b.vehicleId?.type === vehicleTypeFilter;

  return matchesSearch && matchesStatus && matchesDate && matchesVehicleType;
});

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden",  backgroundImage: `url("https://koala.sh/api/image/v2-7tvj1-k9p5g.jpg?width=1216&height=832&dream")`, // put your image path here
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"}} className="fade-in">
       <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.6)", // adjust darkness
      zIndex: 0,
    }}
  />
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }}></div>
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-100px", right: "-100px" }}></div>

      {/* Navigation Bar */}
      <nav className="navbar-custom">
        <div className="navbar-container">
          <div className="nav-logo">
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🛠️</span>
            <span>QuickRide <span style={{ color: "var(--primary)" }}>Staff Portal</span></span>
          </div>

          <div className="nav-links-wrap">
            <NavItem label="Dashboard" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <NavItem label="Manage Vehicles" active={activePage === "vehicles"} onClick={() => setActivePage("vehicles")} />
            <NavItem label="Booking Approvals" active={activePage === "bookings"} onClick={() => { setActivePage("bookings"); setSeenBookings(true); }} />
            <NavItem label="Complaints & Reviews" active={activePage === "complaints"} onClick={() => { setActivePage("complaints"); setSeenComplaints(true); }} />

          </div>
          {/* 🔔 Notification Bell */}
<div style={{ position: "relative", marginRight: "15px" }}>
  <div
    style={{ cursor: "pointer", fontSize: "20px", position: "relative" }}
    onClick={() => setShowNotifications(!showNotifications)}
  >
    🔔

    {totalNotifications > 0 && (
      <span
        style={{
          position: "absolute",
          top: "-6px",
          right: "-8px",
          background: "var(--danger)",
          color: "white",
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "50%",
          fontWeight: "700"
        }}
      >
        {totalNotifications}
      </span>
    )}
  </div>

  {showNotifications && (
    <div
      className="glass-card"
      style={{
        position: "absolute",
        right: 0,
        top: "35px",
        width: "260px",
        padding: "15px",
        zIndex: 999
      }}
    >
      <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>
        Notifications
      </h4>

      <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
      <p style={{ cursor: "pointer" }} onClick={() => { setActivePage("bookings"); setSeenBookings(true); setShowNotifications(false); }}>
  🆕 New booking requests: <strong>{notifications.newBookings}</strong>
</p>

<p style={{ cursor: "pointer" }} onClick={() => setActivePage("bookings")}>
  ⏳ Pending pickups: <strong>{notifications.lateReturns}</strong>
</p>

<p style={{ cursor: "pointer" }} onClick={() => { setActivePage("complaints"); setSeenComplaints(true); setShowNotifications(false); }}>
  💬 Complaints to respond: <strong>{notifications.complaints}</strong>
</p>
</div>

      {totalNotifications === 0 && (
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          No new notifications 🎉
        </p>
      )}
    </div>
  )}
</div>

          <div style={{ position: "relative" }}>
            <div className="profile-pill" onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}>
              <span style={{ fontSize: "18px" }}>👤</span>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.name || "Staff"}</span>
              <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown-menu glass-card scale-in" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: "center", padding: "15px", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "white", margin: "0 auto 10px" }}>👤</div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{user.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "4px 0 0" }}>{user.email}</p>
                </div>
                <div style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid var(--border-color)" }} onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}>👤 Edit Profile</div>
                <div style={{ padding: "14px 16px", cursor: "pointer", color: "var(--danger)", fontWeight: "600", fontSize: "14px" }} onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 }}>
        
        {/* DASHBOARD PAGE */}
        {activePage === "dashboard" && (
          <div className="slide-up">
            <div className="welcome-banner-wrap">
              <div style={{ zIndex: 2 }}>
                <h1 style={{ fontSize: "32px", margin: "0 0 8px 0", color: "white", fontWeight: "800" }}>Welcome Back, {user.name}! 👨‍💻</h1>
                <p style={{ fontSize: "15.5px", color: "#e2e8f0", margin: 0 }}>Approve rental orders, register vehicle inventory, inspect returns, and answer complaints.</p>
              </div>
              <div style={{ fontSize: "78px", opacity: 0.9, filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.4))", zIndex: 1 }}>📋</div>
            </div>

            <div className="dashboard-grid">
              <DashboardCard icon="🚗" title="ACTIVE RENTALS" value={stats.active} color="var(--primary)" />
              <DashboardCard icon="📂" title="TOTAL VEHICLES" value={vehicles.length} color="var(--secondary)" onClick={() => setActivePage("vehicle-details")} />
              <DashboardCard icon="💰" title="TOTAL EARNINGS" value={`$${earnings}`} color="var(--success)" />
            </div>
                        {/* ==================== NEW: ACTIVE RENTALS ON DASHBOARD ==================== */}
            {stats.active > 0 && (
              <div className="glass-card" style={{ padding: "25px", marginTop: "35px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Currently Active Rentals</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {bookings
                    .filter(b => b.status === "ongoing")
                    .map(b => (
                      <div key={b._id} className="glass-card" style={{ padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{b.vehicleId?.name}</strong> — {b.customerId?.name}
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="btn-base btn-primary" onClick={() => handleOpenReturnModal(b)}>Inspect Return</button>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {/* =================================================================== */}
            <div className="glass-card" style={{ padding: "25px", marginTop: "35px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Quick Operations Shortcuts</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <button className="btn-base btn-primary" onClick={() => handleOpenVehicleModal(null)}>➕ Add New Vehicle</button>
                </div>
            </div>
          </div>
        )}

        {/* MANAGE VEHICLES */}
        {activePage === "vehicles" && (
          <div className="slide-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div>
                <h2>Vehicle Fleet Inventory 🚘</h2>
                <p style={{ color: "var(--text-secondary)", margin: "5px 0 0" }}>Create, view, update, and delete rental cars.</p>
              </div>
              <button className="btn-base btn-primary" onClick={() => handleOpenVehicleModal(null)}>➕ Add Vehicle</button>
            </div>

            <div className="dashboard-grid">
              {vehicles.length === 0 ? (
                <div className="glass-card" style={{ gridColumn: "1/-1", padding: "50px", textAlign: "center" }}>
                  <span style={{ fontSize: "50px" }}>🚗</span>
                  <h3>No vehicles listed yet</h3>
                  <p style={{ color: "var(--text-secondary)" }}>Click "Add Vehicle" to register a new transport.</p>
                </div>
              ) : (
                vehicles.map(v => (
                  <div key={v._id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", height: "160px", background: "#1e293b" }}>
                      {v.image ? (
                        <img src={`http://localhost:5000${v.image}`} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🚗</div>
                      )}
                      <span style={{
                        position: "absolute", top: "10px", right: "10px", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                        background: v.isAvailable ? "var(--success)" : "var(--danger)", color: "white", boxShadow: "var(--shadow-sm)"
                      }}>{v.isAvailable ? "Available" : "Rented"}</span>
                    </div>
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "white" }}>{v.name}</h4>
                      <p style={{ margin: "5px 0", color: "var(--text-secondary)", fontSize: "14px" }}>📍 {v.location} | 📂 {v.type}</p>
                      <h3 style={{ margin: "5px 0 15px", fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>
                        ${v.pricePerDay} <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>/day</span>
                      </h3>
                      <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--text-secondary)", flex: 1, lineHeight: "1.4" }}>{v.description || "No description."}</p>
                      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                        <button className="btn-base btn-secondary" style={{ flex: 1, padding: "8px 12px" }} onClick={() => handleOpenVehicleModal(v)}>✏️ Edit</button>
                        <button className="btn-base btn-danger" style={{ flex: 1, padding: "8px 12px" }} onClick={() => handleDeleteVehicle(v._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
                {/* ==================== NEW: VEHICLE DETAILS PAGE ==================== */}
        {activePage === "vehicle-details" && (
          <div className="slide-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div>
                <h2>Vehicle Fleet Details 📋</h2>
                <p style={{ color: "var(--text-secondary)", margin: "5px 0 0" }}>Complete inventory with addition & removal history</p>
              </div>
             </div>

            <div className="glass-card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Vehicle ID</th>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Name</th>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Type</th>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Added On</th>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Removed On</th>
                    <th style={{ padding: "15px", textAlign: "left", fontSize: "14px", color: "var(--text-secondary)" }}>Status</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
                        No vehicles in the fleet yet.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map(v => {
                      const addedDate = v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "N/A";
                      const removedDate = v.removedAt ? new Date(v.removedAt).toLocaleDateString() : "Present";
                      return (
                        <tr key={v._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "15px", fontFamily: "monospace", fontSize: "13px" }}>{v._id}</td>
                          <td style={{ padding: "15px" }}>{v.name}</td>
                          <td style={{ padding: "15px" }}>{v.type}</td>
                          <td style={{ padding: "15px" }}>{addedDate}</td>
                          <td style={{ padding: "15px" }}>{removedDate}</td>
                          <td style={{ padding: "15px" }}>
                            <span className={`badge-base badge-${v.isAvailable ? "success" : "danger"}`}>
                              {v.isAvailable ? "Available" : "Rented / Removed"}
                            </span>
                          </td>
                          
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKING REQUESTS */}
       {activePage === "bookings" && (
  <div className="slide-up">
    <h2>Manage Booking Requests 📋</h2>

    <p style={{ color: "var(--text-secondary)", marginBottom: "25px" }}>
      Process pending approvals, pickups, and return checklists.
    </p>

    {/* ✅ PUT YOUR FILTER BAR HERE */}
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      {/* your inputs go here */}
    </div>
            {/* 🔍 Search + Filters */}
{/* 🔍 Search + Filters */}
<div 
  style={{
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "center",
    flexWrap: "wrap"
  }}
>

  {/* Search */}
  <input
    type="text"
    placeholder="Search customer..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="custom-input"
    style={{ width: "220px" }}
  />

  {/* Status */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="custom-select"
    style={{ width: "160px" }}
  >
    <option value="all">All Status</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="ongoing">Ongoing</option>
    <option value="completed">Completed</option>
  </select>

  {/* Date */}
  <input
    type="date"
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    className="custom-input"
    style={{ width: "160px" }}
  />


</div>


            {bookings.length === 0 ? (
              <div className="glass-card" style={{ padding: "50px", textAlign: "center" }}>
                <span style={{ fontSize: "64px" }}>📋</span>
                <h3>No Bookings Filed</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredBookings.map(b => {
                  const start = new Date(b.startDate).toLocaleDateString();
                  const end = new Date(b.endDate).toLocaleDateString();
                  return (
<div key={b._id} className="glass-card" style={{ padding: "20px", display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(180px, 1fr) minmax(150px, auto)", gap: "20px", alignItems: "center" }}>  
  {/* Column 1: Booking Info */}
  <div>
    <h4 style={{ margin: 0, fontSize: "19px", color: "white", fontWeight: "700" }}>{b.vehicleId?.name || "Deleted Vehicle"}</h4>
    <p style={{ margin: "4px 0", fontSize: "14px", color: "var(--text-secondary)" }}>
      👤 <strong>Customer:</strong> {b.customerId?.name} ({b.customerId?.email})
    </p>
    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>📅 {start} - {end}</p>
    {b.hasDriver && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--primary)", fontWeight: "600" }}>🚖 Driver Requested {b.driverName ? `| ${b.driverName}` : ""}</p>}
  </div>

  {/* Column 2: Invoice - always same position */}
  <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>INVOICE SUMMARY</p>
    {b.status !== "pending" ? (
      <>
        <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Base: ${b.baseCharge}</p>
        {b.driverCharge > 0 && <p style={{ margin: 0, fontSize: "13px" }}>Driver: ${b.driverCharge}</p>}
        {b.discount > 0 && <p style={{ margin: 0, fontSize: "13px", color: "var(--success)" }}>Discount: -${b.discount}</p>}
        {b.additionalFees > 0 && <p style={{ margin: 0, fontSize: "13px" }}>Extra: ${b.additionalFees}</p>}
        {b.damageCharge > 0 && <p style={{ margin: 0, fontSize: "13px", color: "var(--danger)" }}>Damage: ${b.damageCharge}</p>}
        <h4 style={{ margin: "4px 0 0", color: "white" }}>Total: ${b.totalAmount}</h4>
      </>
    ) : (
      <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Awaiting review...</p>
    )}
  </div>

  {/* Column 3: Badge + Action */}
  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
    <span className={`badge-base badge-${b.status}`}>{b.status.toUpperCase()}</span>
    {b.status === "pending" && (
      <button className="btn-base btn-primary" onClick={() => handleOpenReviewModal(b)}>🔍 Review Request</button>
    )}
    {b.status === "confirmed" && (
      <button className="btn-base btn-primary" onClick={() => handlePickup(b._id)}>🚗 Start Rental</button>
    )}
    {b.status === "ongoing" && (
      <button className="btn-base btn-primary" style={{ background: "var(--primary-gradient)" }} onClick={() => handleOpenReturnModal(b)}>🔧 Inspect Return</button>
    )}
  </div>

</div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS & COMPLAINTS */}
        {activePage === "complaints" && (
          <div className="slide-up">
  <h2>Customer Reviews & Complaints 📣</h2>
  <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>
    Monitor feedback and resolve customer issues.
  </p>

  {/* ✅ Tabs */}
  <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
    <button
      className={`btn-base ${feedbackTab === "reviews" ? "btn-primary" : "btn-secondary"}`}
      onClick={() => setFeedbackTab("reviews")}
    >
      ⭐ Reviews
    </button>

    <button
      className={`btn-base ${feedbackTab === "complaints" ? "btn-danger" : "btn-secondary"}`}
      onClick={() => setFeedbackTab("complaints")}
    >
      ⚠ Complaints
    </button>
  </div>
            {feedbacks.length === 0 ? (
              <div className="glass-card" style={{ padding: "50px", textAlign: "center" }}>
                <span style={{ fontSize: "64px" }}>💬</span>
                <h3>No Feedbacks Logged</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

  {(feedbackTab === "reviews" ? reviews : complaints).length === 0 ? (

    <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
      <h3>No {feedbackTab} found</h3>
    </div>

  ) : (

    (feedbackTab === "reviews" ? reviews : complaints).map(f => (
                  <div key={f._id} className="glass-card" style={{ padding: "20px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{
                          background: f.type === "complaint" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                          color: f.type === "complaint" ? "var(--danger)" : "var(--warning)",
                          padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700"
                        }}>{f.type.toUpperCase()}</span>
                        {f.type === "feedback" && <span style={{ color: "#fbbf24" }}>{"★".repeat(f.rating)}</span>}
                      </div>
                      <p style={{ margin: "5px 0", fontSize: "16px", color: "white", fontStyle: "italic" }}>"{f.comment}"</p>
                      <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        From: <strong>{f.customerId?.name}</strong> ({f.customerId?.email}) | Target: {f.bookingId?.vehicleId?.name || "Vehicle"}
                      </p>
                    </div>

<div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>                      {f.type === "complaint" ? (
                        <div style={{ marginBottom: "10px" }}>
                          <p style={{ margin: 0, fontSize: "13.5px" }}>Status: <strong style={{ color: f.complaintStatus === "Resolved" ? "var(--success)" : "var(--warning)" }}>{f.complaintStatus}</strong></p>
                          {f.staffResponse && (
                            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}><strong>Action comments:</strong> {f.staffResponse}</p>
                          )}
                          <button className="btn-base btn-secondary" style={{ marginTop: "10px", padding: "6px 12px", fontSize: "12.5px" }} onClick={() => handleOpenComplaintModal(f)}>Resolve / Answer</button>
                        </div>
                      ) : null}
                      
                      <button className="btn-base btn-primary" style={{ marginTop: f.type === "complaint" ? "5px" : "0", padding: "6px 12px", fontSize: "12.5px" }} onClick={() => handleOpenReplyModal(f)}>
                        💬 {f.staffReplies?.length > 0 ? `View/Edit Replies (${f.staffReplies.length})` : "Add Reply"}
                      </button>
                    </div>
                  </div>
                ))
              )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="custom-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "5px" }}>👤 Edit Staff Profile</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>Update your contact credentials.</p>

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
                <label className="form-label">New Password (leave blank to keep current)</label>
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

      {/* ADD / EDIT VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="custom-modal-overlay" onClick={() => setShowVehicleModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{editingVehicle ? "✏️ Edit Vehicle" : "➕ Add Vehicle"}</h3>

            <form onSubmit={handleSaveVehicle} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Vehicle Name *</label>
                <input type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Category *</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="custom-select">
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="three wheel">Three wheel</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Price Per Day ($) *</label>
                  <input type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} className="custom-input" required />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Location *</label>
                <input type="text" value={vehicleLocation} onChange={(e) => setVehicleLocation(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Description</label>
                <textarea value={vehicleDesc} onChange={(e) => setVehicleDesc(e.target.value)} className="custom-textarea" rows={3} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Upload Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setVehicleImageFile(e.target.files[0])} className="custom-input" />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowVehicleModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW BOOKING MODAL */}
      {showReviewModal && selectedBookingForReview && (
        <div className="custom-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>🔍 Review Booking Request</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Calculate invoice values for Customer: {selectedBookingForReview.customerId?.name}</p>

            <form onSubmit={handleSaveReview} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Action</label>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="custom-select">
                  <option value="approved">Approve Booking</option>
                  <option value="rejected">Reject Booking</option>
                </select>
              </div>

              {reviewStatus === "approved" && (
                <>
                  {selectedBookingForReview.hasDriver && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="form-label">Assign Driver Name *</label>
                      <input type="text" placeholder="e.g. John Driver" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="custom-input" required />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="form-label">Discount Amount ($)</label>
                      <input type="number" placeholder="e.g. 10" value={discount} onChange={(e) => setDiscount(e.target.value)} className="custom-input" />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="form-label">Additional Fees ($)</label>
                      <input type="number" placeholder="e.g. 5" value={additionalFees} onChange={(e) => setAdditionalFees(e.target.value)} className="custom-input" />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINAL RETURN INSPECTION MODAL */}
      {showReturnModal && selectedBookingForReturn && (
        <div className="custom-modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>🔧 Final Return Inspection</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Perform returns checks for: {selectedBookingForReturn.vehicleId?.name}</p>

            <form onSubmit={handleSaveReturn} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Actual Return Date</label>
                <input type="date" value={actualReturnDate} onChange={(e) => setActualReturnDate(e.target.value)} className="custom-input" required />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Return Mileage (km) *</label>
                  <input type="number" value={returnMileage} onChange={(e) => setReturnMileage(e.target.value)} className="custom-input" required />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Fuel Level (%) *</label>
                  <input type="number" min="0" max="100" value={returnFuelLevel} onChange={(e) => setReturnFuelLevel(e.target.value)} className="custom-input" required />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Vehicle Return Condition *</label>
                <select value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} className="custom-select">
                  <option value="Good">Good / Undamaged</option>
                  <option value="Dirty">Dirty (Needs cleaning)</option>
                  <option value="Damaged">Damaged (Requires repair charge)</option>
                </select>
              </div>

              {returnCondition === "Damaged" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label className="form-label">Damage Description</label>
                    <input type="text" placeholder="Scratch on passenger door" value={damages} onChange={(e) => setDamages(e.target.value)} className="custom-input" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label className="form-label">Damage Repair Charge ($)</label>
                    <input type="number" placeholder="150" value={damageCharge} onChange={(e) => setDamageCharge(e.target.value)} className="custom-input" />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Finalize Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE COMPLAINT MODAL */}
      {showComplaintModal && selectedComplaint && (
        <div className="custom-modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>💬 Answer Complaint</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Complaint: "{selectedComplaint.comment}"</p>

            <form onSubmit={handleSaveComplaintResponse} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Update Status</label>
                <select value={complaintStatus} onChange={(e) => setComplaintStatus(e.target.value)} className="custom-select">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Write Response Comments *</label>
                <textarea placeholder="Type action comments or reply..." value={staffResponse} onChange={(e) => setStaffResponse(e.target.value)} className="custom-textarea" rows={4} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowComplaintModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Submit Response</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF REPLY MODAL */}
      {showReplyModal && selectedFeedbackForReply && (
        <div className="custom-modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>💬 {isEditingReply ? "Edit Reply" : "Add Reply"}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "15px" }}>
              {selectedFeedbackForReply.type === "feedback" ? "Review" : "Complaint"}: "{selectedFeedbackForReply.comment}"
            </p>

            {selectedFeedbackForReply.staffReplies && selectedFeedbackForReply.staffReplies.length > 0 && (
              <div style={{ marginBottom: "15px", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <p style={{ margin: "0 0 8px 0", fontWeight: "700", fontSize: "13px", color: "white" }}>Previous Replies:</p>
                {selectedFeedbackForReply.staffReplies.map(reply => (
                  <div key={reply._id} style={{ marginBottom: "8px", padding: "10px", background: "rgba(15,23,42,0.4)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "700", color: "white" }}>{reply.staffName} ({new Date(reply.createdAt).toLocaleDateString()})</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>{reply.replyText}</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginLeft: "10px" }}>
                        <button className="btn-base btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleEditReply(reply._id, reply.replyText)}>✏️</button>
                        <button className="btn-base btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleDeleteReply(reply._id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={isEditingReply ? handleUpdateReply : handleAddReply} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">{isEditingReply ? "Update Reply text" : "Reply Text *"} *</label>
                <textarea placeholder="Type your reply message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="custom-textarea" rows={4} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => { setShowReplyModal(false); setReplyText(""); setEditingReplyId(null); setIsEditingReply(false); }}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>{isEditingReply ? "Update Reply" : "Add Reply"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            padding: "14px 20px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "600",
            background: toast.type === "success" ? "var(--success-gradient)" : "var(--danger-gradient)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 99999,
            animation: "slideIn 0.3s ease"
          }}
        >
          {toast.message}
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
    style={{ 
      position: "relative", 
      overflow: "hidden", 
      cursor: onClick ? "pointer" : "default" 
    }}
    onClick={onClick}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: color }} />
    <div className="metric-icon-wrap" style={{ background: color, color: "white", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: "0 0 4px 0", color: "var(--text-secondary)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "white" }}>{value}</h2>
    </div>
  </div>
);