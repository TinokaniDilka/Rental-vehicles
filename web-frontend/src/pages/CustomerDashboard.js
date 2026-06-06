import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
const [toast, setToast] = useState({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  setToast({ show: true, message, type });

  setTimeout(() => {
    setToast({ show: false, message: "", type: "success" });
  }, 3000); // disappears after 3 sec
};

  // Navigation
  const [activePage, setActivePage] = useState({ page: "dashboard" });

  // Core Data
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");

  // Stats
  const [bookedCount, setBookedCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Profile
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileEmail, setProfileEmail] = useState(user.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookingHasDriver, setBookingHasDriver] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [vehicleBookedDates, setVehicleBookedDates] = useState([]);

  // Payment Modal (Payment-First Flow)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempBookingData, setTempBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [allFeedbacks, setAllFeedbacks] = useState([]);   // ← NEW: For public reviews

    // NEW: Feedback Edit Modal States
  const [showEditFeedbackModal, setShowEditFeedbackModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editFeedbackType, setEditFeedbackType] = useState("feedback");
  const [editFeedbackRating, setEditFeedbackRating] = useState(5);
  const [editFeedbackComment, setEditFeedbackComment] = useState("");

  // Fetch Data
  useEffect(() => {
    fetchVehicles();
    fetchBookings();
    fetchFeedbacks();
    fetchAllFeedbacks();
  }, []);
  // Refresh all feedbacks when feedbacks change (after submit/edit)
  useEffect(() => {
    fetchAllFeedbacks();
  }, [feedbacks]);

  const fetchVehicles = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/vehicles");

    let data = Array.isArray(res.data) ? res.data : [];

    // Calculate average rating from ALL feedbacks
    data = data.map(vehicle => {
      const vehicleFeedbacks = allFeedbacks.filter(f => 
        f.bookingId?.vehicleId?._id === vehicle._id || 
        f.vehicle?._id === vehicle._id
      );

      if (vehicleFeedbacks.length > 0) {
        const total = vehicleFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
        const avgRating = total / vehicleFeedbacks.length;
        return {
          ...vehicle,
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalReviews: vehicleFeedbacks.length
        };
      }
      return { ...vehicle, averageRating: 0, totalReviews: 0 };
    });

    setVehicles(data);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    setVehicles([]);
  } finally {
    setLoading(false);
  }
};
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/customer", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      setBookedCount(res.data.length);
      const spent = res.data
        .filter(b => ["confirmed", "ongoing", "completed"].includes(b.status))
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      setTotalSpent(spent);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

   const fetchFeedbacks = async () => {
    try {
      // Current user's feedbacks (for their history & edit/delete)
      const res = await axios.get("http://localhost:5000/api/feedback/customer", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching customer feedback:", err);
    }
  };

    // NEW: Fetch ALL feedbacks (try public, fallback to customer)
  const fetchAllFeedbacks = async () => {
    try {
      // Try public endpoint first
      const res = await axios.get("http://localhost:5000/api/feedback");
      setAllFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Public feedback endpoint failed, using customer feedbacks as fallback");
      setAllFeedbacks(feedbacks); // Fallback to current user's feedbacks for now
    }
  };
  // ==================== NEW CRUD FUNCTIONS FOR FEEDBACK ====================

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setEditFeedbackType(feedback.type || "feedback");
    setEditFeedbackRating(feedback.rating || 5);
    setEditFeedbackComment(feedback.comment || "");
    setShowEditFeedbackModal(true);
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    if (!editFeedbackComment.trim()) return alert("Please enter a comment");

    try {
      await axios.put(
        `http://localhost:5000/api/feedback/${editingFeedback._id}`,
        {
          type: editFeedbackType,
          rating: editFeedbackType === "feedback" ? editFeedbackRating : undefined,
          comment: editFeedbackComment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("✅ Feedback updated successfully!", "success");
      setShowEditFeedbackModal(false);
      fetchAllFeedbacks();
      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update feedback", "error");
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("🗑️ Feedback deleted successfully", "success");
      fetchFeedbacks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete feedback", "error");
    }
  };
  // Booking Modal
  const handleOpenBookingModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingStartDate("");
    setBookingEndDate("");
    setBookingHasDriver(false);
    setBookingError("");
    setVehicleBookedDates([]);
    setShowBookingModal(true);

    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/vehicle/${vehicle._id}`);
      setVehicleBookedDates(res.data || []);
    } catch (err) {
      console.error("Error fetching booked dates:", err);
    }
  };

  const handleProceedToPayment = () => {
    if (!bookingStartDate || !bookingEndDate) {
      setBookingError("Please select both start and end dates");
      return;
    }

    const start = new Date(bookingStartDate);
    const end = new Date(bookingEndDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days > 7) {
      setBookingError("Maximum booking period is 7 days");
      return;
    }
    if (days < 1) {
      setBookingError("End date must be on or after start date");
      return;
    }

    const hasOverlap = vehicleBookedDates.some(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return start <= bEnd && end >= bStart;
    });

    if (hasOverlap) {
      setBookingError("Vehicle is already booked on these dates. Please try another period.");
      return;
    }

    const baseAmount = selectedVehicle.pricePerDay * days;
    const driverCharge = bookingHasDriver ? 50 * days : 0;

    setTempBookingData({
      vehicleId: selectedVehicle._id,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      hasDriver: bookingHasDriver,
      baseAmount,
      driverCharge,
      totalAmountBeforePromo: baseAmount + driverCharge,
    });

    setShowBookingModal(false);
    setShowPaymentModal(true);
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
        { name: profileName, email: profileEmail, password: profilePassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showToast("Profile updated successfully ✅");
      setProfilePassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Profile update failed", "error");
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/promos/validate/${promoCode.trim().toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromoDiscountPercent(res.data.discountPercent);
      setPromoApplied(true);
      showToast(`Promo code applied! ${res.data.discountPercent}% discount.`, "success");
    } catch (err) {
      setPromoError(err.response?.data?.message || "Invalid promo code");
      setPromoDiscountPercent(0);
      setPromoApplied(false);
      showToast(err.response?.data?.message || "Invalid promo code", "error");
    }
  };

  const handleProcessPayment = async () => {
    if (!tempBookingData) return;

    try {
      let finalAmount = tempBookingData.totalAmountBeforePromo;
      if (promoApplied && promoDiscountPercent > 0) {
        finalAmount = Math.max(0, finalAmount * (1 - promoDiscountPercent / 100));
      }

      await axios.post(
        "http://localhost:5000/api/bookings/create-with-payment",
        {
          vehicleId: tempBookingData.vehicleId,
          startDate: tempBookingData.startDate,
          endDate: tempBookingData.endDate,
          hasDriver: tempBookingData.hasDriver,
          paymentMethod,
          amount: finalAmount,
          promoCode: promoApplied ? promoCode : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("🎉 Payment successful! Booking confirmed.", "success");
      setShowPaymentModal(false);
      setTempBookingData(null);
      setPromoApplied(false);
      setPromoCode("");
      setPromoDiscountPercent(0);

      fetchBookings();
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || "Payment failed");
    }
  };

  const handleOpenFeedbackModal = (booking) => {
    setSelectedBookingForFeedback(booking);
    setFeedbackType("feedback");
    setFeedbackRating(5);
    setFeedbackComment("");
    setShowFeedbackModal(true);
  };

  const handleSubmittingFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return alert("Please fill the comment box");

    try {
      await axios.post(
        "http://localhost:5000/api/feedback",
        {
          bookingId: selectedBookingForFeedback._id,
          type: feedbackType,
          rating: feedbackType === "feedback" ? feedbackRating : undefined,
          comment: feedbackComment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
            showToast(`✅ ${feedbackType === "feedback" ? "Feedback" : "Complaint"} submitted successfully!`, "success");
      setShowFeedbackModal(false);
      await fetchFeedbacks();
      await fetchAllFeedbacks();
      await fetchVehicles();   // Refresh ratings too
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit feedback", "error");
    }
  };

  // Close profile dropdown
  useEffect(() => {
    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filtered Vehicles
  const filteredVehicles = Array.isArray(vehicles)
  ? vehicles.filter(v => {
      const matchesCategory =
        searchCategory === "all" || v.type === searchCategory;

      const matchesLocation =
        !searchLocation.trim() ||
        v.location.toLowerCase().includes(searchLocation.toLowerCase());

      return matchesCategory && matchesLocation;
    })
  : [];
  return (
    <div style={dashboardWrapper}>
      <div style={glowOrb1}></div>
      <div style={glowOrb2}></div>

      {/* Navbar */}
      <nav style={navBar}>
        <div style={navContainer}>
          <div style={logo}>
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🚗</span>
            <span style={logoText}>QuickRide <span style={{ color: "#6366f1" }}>Rentals</span></span>
          </div>

          <div style={navLinks}>
  <NavItem
    label="Dashboard"
    active={activePage.page === "dashboard"}
    onClick={() => setActivePage({ page: "dashboard" })}
  />
  <NavItem
    label="Search Vehicles"
    active={activePage.page === "search"}
    onClick={() => setActivePage({ page: "search" })}
  />
  <NavItem
    label="My Bookings"
    active={activePage.page === "bookings"}
    onClick={() => setActivePage({ page: "bookings" })}
  />
  <NavItem
    label="Feedback History"
    active={activePage.page === "feedback"}
    onClick={() => setActivePage({ page: "feedback" })}
  />
  <NavItem
    label="Profile"
    active={activePage.page === "profile"}
    onClick={() => setActivePage({ page: "profile" })}
  />
</div>

          <div style={{ position: "relative" }}>
            <div style={profileSection} onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}>
              <span style={{ fontSize: "18px", marginRight: "6px" }}>👤</span>
              <span style={userNameStyle}>{user.name || "Customer"}</span>
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
    setActivePage({ page: "profile" }); 
    setShowProfileMenu(false); 
  }}
>
  👤 Edit Profile
</div>
                <div style={profileMenuItem}>🔑 Change Password</div>
                <div style={profileLogout} onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={mainContent}>
        {/* Dashboard */}
        {activePage.page === "dashboard" && (
          <div style={fadeAnimation}>
            <div style={welcomeBanner}>
              <div>
                <h1 style={welcomeHeading}>Welcome, {user.name}! 👋</h1>
                <p style={welcomeSub}>Manage your rentals, review invoices, pay for bookings, and rate your rides.</p>
              </div>
              <div style={bannerGraphic}>🚘</div>
            </div>

            <div style={dashboardGrid}>
              <DashboardCard icon="📅" title="YOUR BOOKINGS" value={bookedCount} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              <DashboardCard icon="💰" title="TOTAL SPENT" value={`$${totalSpent}`} color="linear-gradient(135deg, #10b981, #059669)" />
              <DashboardCard icon="⭐" title="SUBMITTED REVIEWS" value={feedbacks.filter(f => f.type === "feedback").length} color="linear-gradient(135deg, #f59e0b, #d97706)" />
            </div>

            <div style={sectionCard}>
              <h3>Quick Customer Actions</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                <button style={primaryBtn} onClick={() => setActivePage({ page: "search" })}>
  🔍 Search Available Vehicles
</button>
<button style={secondaryBtn} onClick={() => setActivePage({ page: "bookings" })}>
  📋 Check Booking Invoices
</button>
              </div>
            </div>
          </div>
        )}

        {/* Search Vehicles */}
        {activePage.page === "search" && (
          <div style={fadeAnimation}>
            <h2>Search and Book Vehicles 🔍</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>Find vehicles by category, location, and dates.</p>

            <div style={searchBar}>
              <div style={searchField}>
                <label style={fieldLabel}>VEHICLE TYPE</label>
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} style={selectStyle}>
                  <option value="all">All Vehicles</option>
                  <option value="car">Car</option>
                  <option value="bike">Three wheel</option>
                  <option value="van">Van</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div style={searchField}>
                <label style={fieldLabel}>LOCATION</label>
                <input type="text" placeholder="e.g. Colombo" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={vehicleGrid}>
              {filteredVehicles.length === 0 ? (
                <div style={{ ...emptyStateCard, gridColumn: "1/-1" }}>
                  <span style={{ fontSize: "50px" }}>🚫</span>
                  <h3>No Vehicles Found</h3>
                  <p style={{ color: "#6b7280" }}>Try adjusting your filters.</p>
                </div>
              ) : (
                Array.isArray(filteredVehicles) &&
filteredVehicles.map(v => (

  <div key={v._id} style={vehicleCard}>

    {/* CLICKABLE IMAGE */}
    {/* CLICKABLE IMAGE */}
<div
  style={cardImageWrapper}
  onClick={() => setActivePage({ page: "vehicleDetails", data: v })}
>
  {v.image ? (
    <img
      src={`http://localhost:5000${v.image}`}
      alt={v.name}
      style={cardImage}
    />
  ) : (
    <div style={placeholderImage}>🚗</div>
  )}

  {/* Availability Badge - Top Right Corner */}
  <div style={availabilityBadge(v.isAvailable !== false)}>
    {v.isAvailable !== false ? "✅ Available" : "🚫 Rented"}
  </div>

    </div>

          {/* NAME + PRICE + AVERAGE RATING */}
    <div style={cardBody}>
      <h4 style={cardName}>{v.name}</h4>
      <p style={cardPrice}>
        ${v.pricePerDay}
        <span style={{ fontSize: "13px", color: "#6b7280" }}>/day</span>
      </p>

      {/* Average Rating Stars - Bottom of Card */}
      {v.averageRating > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
          <div style={{ display: "flex" }}>{renderStars(v.averageRating)}</div>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
            {v.averageRating} ({v.totalReviews})
          </span>
        </div>
      )}
    </div>

  </div>
))
              )}
            </div>
          </div>
        )}

        {/* My Bookings */}
        {activePage.page === "bookings" && (
          <div style={fadeAnimation}>
            <h2>My Booking History 📋</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>Track statuses, pay invoices, and submit feedback.</p>

            {bookings.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px" }}>📅</span>
                <h3>No Bookings Found</h3>
                <button style={primaryBtn} onClick={() => setActivePage("search")}>Browse Vehicles</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {bookings.map(b => {
                  const start = new Date(b.startDate).toLocaleDateString();
                  const end = new Date(b.endDate).toLocaleDateString();
                  return (
                    <div key={b._id} style={bookingListItem}>
                      <div style={{ flex: 2 }}>
                        <h4 style={{ margin: "0 0 5px", fontSize: "18px" }}>{b.vehicleId?.name || "Deleted Vehicle"}</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>📅 Rental Period: {start} - {end}</p>
                        {b.driverName && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4f46e5" }}>👨‍✈️ Driver: {b.driverName}</p>}
                        {b.status === "completed" && (
                          <div style={inspectionBox}>
                            <h5>🔧 Return Inspection Details</h5>
                            <p><strong>Condition:</strong> {b.returnCondition} | <strong>Mileage:</strong> {b.returnMileage} km | <strong>Fuel:</strong> {b.returnFuelLevel}%</p>
                            {b.damages && <p><strong>Damages noted:</strong> {b.damages}</p>}
                          </div>
                        )}
                      </div>

                                           <div style={{ flex: 1, minWidth: "150px" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>BILLING DETAILS</p>
                        <p style={{ margin: "2px 0 0", fontSize: "14px" }}>Base Price: ${b.baseCharge}</p>
                        {b.driverCharge > 0 && <p style={{ margin: 0, fontSize: "14px" }}>Driver Fee: ${b.driverCharge}</p>}
                        {b.discount > 0 && <p style={{ margin: 0, fontSize: "14px", color: "#e11d48" }}>Discount: -${b.discount}</p>}
                        {b.additionalFees > 0 && <p style={{ margin: 0, fontSize: "14px" }}>Extra Fees: ${b.additionalFees}</p>}
                        {b.lateReturnCharge > 0 && <p style={{ margin: 0, fontSize: "14px", color: "#dc2626" }}>Late Fee: ${b.lateReturnCharge}</p>}
                        {b.damageCharge > 0 && <p style={{ margin: 0, fontSize: "14px", color: "#dc2626" }}>Damage Fee: ${b.damageCharge}</p>}
                        <h4 style={{ margin: "5px 0 0", color: "#1e1b4b" }}>Total: ${b.totalAmount}</h4>
                      </div>

                      {/* Right Column - Status + Review */}
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "10px", alignItems: "end" }}>
                        <span style={getStatusBadgeStyle(b.status)}>{b.status.toUpperCase()}</span>
                        
                        {b.status === "completed" && (
                          <>
                            {feedbacks.some(f => f.bookingId?._id === b._id && f.type === "feedback") ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  {renderStars(
                                    feedbacks.find(f => f.bookingId?._id === b._id && f.type === "feedback")?.rating || 0
                                  )}
                                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Reviewed</span>
                                </div>
                                <button 
                                  style={editBtn} 
                                  onClick={() => {
                                    const existing = feedbacks.find(f => f.bookingId?._id === b._id && f.type === "feedback");
                                    if (existing) handleEditFeedback(existing);
                                  }}
                                >
                                  ✏️ Edit Review
                                </button>
                              </div>
                            ) : (
                              <button 
                                style={feedbackBtn} 
                                onClick={() => handleOpenFeedbackModal(b)}
                              >
                                ⭐ Review / Complain
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

                {/* Feedback History - UPDATED WITH EDIT & DELETE */}
        {activePage.page === "feedback" && (
          <div style={fadeAnimation}>
            <h2>Feedback & Complaint Submissions 📣</h2>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>
              View, edit, or delete your complaints and feedback submissions.
            </p>

            {feedbacks.length === 0 ? (
              <div style={emptyStateCard}>
                <span style={{ fontSize: "64px" }}>💬</span>
                <h3>No Submissions Recorded</h3>
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
                        Submitted for: {f.bookingId?.vehicleId?.name || f.vehicle?.name || "Vehicle"}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                      <button style={editBtn} onClick={() => handleEditFeedback(f)}>
                        ✏️ Edit
                      </button>
                      <button style={deleteBtn} onClick={() => handleDeleteFeedback(f._id)}>
                        🗑️ Delete
                      </button>
                    </div>

                    {f.type === "complaint" && (
                      <div style={{ flex: 1, borderLeft: "1px solid #e2e8f0", paddingLeft: "20px" }}>
                        <p style={{ margin: 0, fontSize: "13px" }}>Status: <strong style={{ color: f.complaintStatus === "Resolved" ? "#10b981" : "#f59e0b" }}>{f.complaintStatus}</strong></p>
                        {f.staffResponse ? (
                          <div style={{ marginTop: "8px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "#1e293b" }}><strong>Staff Response:</strong></p>
                            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>{f.staffResponse}</p>
                          </div>
                        ) : (
                          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#94a3b8" }}>Awaiting staff response...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activePage.page === "profile" && (
          <div style={fadeAnimation}>
            <div style={formWrapper}>
              <h2 style={{ textAlign: "center", marginBottom: "10px" }}>👤 Edit Customer Profile</h2>
              <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "30px" }}>Update your contact information and password.</p>
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
        {/* Vehicle Details Page */}
        {/* Vehicle Details Page */}
{activePage.page === "vehicleDetails" && activePage.data && (
  <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

    {/* LEFT SIDE - IMAGE */}
    <div style={{ flex: 1 }}>
      {activePage.data?.image && (
        <img
          src={`http://localhost:5000${activePage.data.image}`}
          alt={activePage.data.name}
          style={{ width: "100%", borderRadius: "12px" }}
        />
      )}
    </div>

    {/* RIGHT SIDE */}
    <div style={{ flex: 1 }}>
      <h2>{activePage.data?.name}</h2>

      <p style={{ color: "#64748b" }}>
        📍 {activePage.data?.location}
      </p>

      <h3 style={{ color: "#4f46e5" }}>
        ${activePage.data?.pricePerDay} / day
      </h3>

      <p style={{ marginTop: "15px" }}>
        {activePage.data?.description}
      </p>

      {/* Average Rating */}
      {activePage.data?.averageRating > 0 && (
        <div style={{ margin: "15px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", fontSize: "24px" }}>
            {renderStars(activePage.data.averageRating)}
          </div>
          <span style={{ fontSize: "16px", fontWeight: "600" }}>
            {activePage.data.averageRating} 
            <span style={{ color: "#64748b", fontWeight: "normal" }}> ({activePage.data.totalReviews} reviews)</span>
          </span>
        </div>
      )}

      {/* Customer Reviews Section - ALL REVIEWS */}
            {/* Customer Reviews Section */}
      <div style={{ marginTop: "25px" }}>
        <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>
          💬 Customer Reviews ({allFeedbacks.length > 0 ? 
            allFeedbacks.filter(f => 
              f.bookingId?.vehicleId?._id === activePage.data?._id || 
              f.vehicle?._id === activePage.data?._id
            ).length : 0})
        </h4>
        
        {allFeedbacks
          .filter(f => 
            f.bookingId?.vehicleId?._id === activePage.data?._id || 
            f.vehicle?._id === activePage.data?._id
          )
          .length > 0 ? (
            allFeedbacks
              .filter(f => 
                f.bookingId?.vehicleId?._id === activePage.data?._id || 
                f.vehicle?._id === activePage.data?._id
              )
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(review => (
                <div key={review._id} style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "10px",
                  marginBottom: "14px",
                  borderLeft: "4px solid #6366f1"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong>{review.type === "feedback" ? "⭐ Review" : "⚠️ Complaint"}</strong>
                    {review.rating && <div style={{ fontSize: "20px" }}>{renderStars(review.rating)}</div>}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "14.5px", color: "#475569", lineHeight: "1.5" }}>
                    "{review.comment}"
                  </p>
                  <small style={{ color: "#94a3b8" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
          ) : (
            <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
              No reviews yet for this vehicle.<br />Be the first to review after your rental!
            </p>
          )}
      </div>

      {/* BOOK BUTTON */}
      <button
        style={{ ...submitBtn, marginTop: "25px" }}
        onClick={() => handleOpenBookingModal(activePage.data)}
      >
        🚗 Book Now
      </button>

      {/* BACK BUTTON */}
      <button
        style={{ ...cancelBtn, marginTop: "10px" }}
        onClick={() => setActivePage({ page: "search" })}
      >
        ⬅ Back
      </button>
    </div>

  </div>
)}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedVehicle && (
        <div style={overlay} onClick={() => setShowBookingModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>Book {selectedVehicle.name} 🗓️</h3>
            <p style={{ color: "#64748b" }}>Rate: ${selectedVehicle.pricePerDay}/day | Location: {selectedVehicle.location}</p>

            <div style={{ margin: "20px 0" }}>
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>Start Date</label>
                  <input type="date" value={bookingStartDate} onChange={(e) => setBookingStartDate(e.target.value)} style={modalInput} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>End Date</label>
                  <input type="date" value={bookingEndDate} onChange={(e) => setBookingEndDate(e.target.value)} style={modalInput} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                <input type="checkbox" id="hasDriver" checked={bookingHasDriver} onChange={(e) => setBookingHasDriver(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <label htmlFor="hasDriver" style={{ cursor: "pointer", fontWeight: "500" }}>Add a personal driver ($50/day driver fee)</label>
              </div>
            </div>

            {bookingError && <p style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}>⚠️ {bookingError}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={cancelBtn} onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button style={submitBtn} onClick={handleProceedToPayment}>Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && tempBookingData && (
        <div style={overlay} onClick={() => setShowPaymentModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>💳 Complete Payment</h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Booking for: {selectedVehicle?.name}</p>

            <div style={invoiceDetailBox}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rental Charge:</span>
                <span>${tempBookingData.baseAmount}</span>
              </div>
              {tempBookingData.driverCharge > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Driver Charge:</span>
                  <span>${tempBookingData.driverCharge}</span>
                </div>
              )}
              <hr />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "18px" }}>
                <span>Total:</span>
                <span>${(tempBookingData.totalAmountBeforePromo - (promoApplied ? (tempBookingData.totalAmountBeforePromo * promoDiscountPercent) / 100 : 0)).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
              <input type="text" placeholder="PROMO CODE" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={modalInput} disabled={promoApplied} />
              <button type="button" onClick={handleApplyPromo} style={promoApplied ? appliedBtn : applyBtn} disabled={promoApplied}>
                {promoApplied ? "Applied" : "Apply"}
              </button>
            </div>
            {promoError && <p style={{ color: "red", fontSize: "13px" }}>{promoError}</p>}

            <div style={{ margin: "20px 0" }}>
              <label style={{ fontSize: "13px", fontWeight: "600" }}>PAYMENT METHOD</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={selectStyle}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            {["credit_card", "debit_card"].includes(paymentMethod) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={modalInput} />
                <input type="text" placeholder="Cardholder Name" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} style={modalInput} />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={cancelBtn} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button style={submitBtn} onClick={handleProcessPayment}>Complete Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBookingForFeedback && (
        <div style={overlay} onClick={() => setShowFeedbackModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>⭐ Review / File Complaint</h3>
            <p style={{ color: "#64748b" }}>Submit comments for booking ID: {selectedBookingForFeedback._id}</p>

            <form onSubmit={handleSubmittingFeedback} style={{ marginTop: "20px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Submission Type</label>
                <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} style={selectStyle}>
                  <option value="feedback">General Feedback & Rating</option>
                  <option value="complaint">File a Complaint</option>
                </select>
              </div>

              {feedbackType === "feedback" && (
                <div style={formGroup}>
                  <label style={formLabel}>Rating (1 to 5 Stars)</label>
                  <select value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} style={selectStyle}>
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              )}

              <div style={formGroup}>
                <label style={formLabel}>Comments / Details</label>
                <textarea placeholder="Provide details about your rental experience..." value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} style={formTextarea} rows={4} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" style={cancelBtn} onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" style={submitBtn}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* ==================== NEW: EDIT FEEDBACK MODAL ==================== */}
      {showEditFeedbackModal && editingFeedback && (
        <div style={overlay} onClick={() => setShowEditFeedbackModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit Feedback / Complaint</h3>

            <form onSubmit={handleUpdateFeedback} style={{ marginTop: "20px" }}>
              <div style={formGroup}>
                <label style={formLabel}>Submission Type</label>
                <select 
                  value={editFeedbackType} 
                  onChange={(e) => setEditFeedbackType(e.target.value)} 
                  style={selectStyle}
                >
                  <option value="feedback">General Feedback & Rating</option>
                  <option value="complaint">File a Complaint</option>
                </select>
              </div>

              {editFeedbackType === "feedback" && (
                <div style={formGroup}>
                  <label style={formLabel}>Rating (1-5 Stars)</label>
                  <select 
                    value={editFeedbackRating} 
                    onChange={(e) => setEditFeedbackRating(Number(e.target.value))} 
                    style={selectStyle}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{"★".repeat(n)} ({n} Stars)</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={formGroup}>
                <label style={formLabel}>Comments / Details</label>
                <textarea
                  value={editFeedbackComment}
                  onChange={(e) => setEditFeedbackComment(e.target.value)}
                  style={formTextarea}
                  rows={5}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
                <button 
                  type="button" 
                  style={cancelBtn} 
                  onClick={() => setShowEditFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={submitBtn}>
                  Update Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== STYLES & HELPERS ====================

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
// ==================== STAR RATING HELPER ====================
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating || 0);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= fullStars ? "#fbbf24" : "#e5e7eb", fontSize: "18px" }}>
        ★
      </span>
    );
  }
  return stars;
};
// ==================== NEW STYLES FOR EDIT & DELETE BUTTONS ====================
const editBtn = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

const NavItem = ({ label, active, onClick }) => (
  <div style={{
    padding: "8px 18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: active ? "600" : "500",
    color: active ? "white" : "#cbd5e1",
    background: active ? "rgba(99, 102, 241, 0.4)" : "transparent",
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

// All Styles
const dashboardWrapper = { minHeight: "100vh", background: "#f8fafc", position: "relative", overflow: "hidden", fontFamily: "'Outfit', 'Inter', sans-serif" };
const glowOrb1 = { position: "absolute", top: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };
const glowOrb2 = { position: "absolute", bottom: "-100px", right: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, pointerEvents: "none" };

const navBar = { background: "#0f172a", color: "white", padding: "16px 0", position: "sticky", top: 0, zIndex: 1000 };
const navContainer = { maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const logo = { display: "flex", alignItems: "center" };
const logoText = { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" };
const navLinks = { display: "flex", gap: "6px" };
const profileSection = { display: "flex", alignItems: "center", padding: "6px 14px", borderRadius: "30px", background: "rgba(255,255,255,0.08)" };
const userNameStyle = { fontWeight: "600", fontSize: "14px" };

const mainContent = { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 };
const welcomeBanner = { background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: "20px", padding: "30px 40px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "35px" };
const welcomeHeading = { margin: 0, fontSize: "28px", fontWeight: "800" };
const welcomeSub = { margin: "8px 0 0", color: "#c7d2fe", fontSize: "15px" };
const bannerGraphic = { fontSize: "70px", opacity: 0.8 };

const dashboardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "35px" };
const dashboardCardStyle = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" };

const sectionCard = { background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 10px 20px rgba(0,0,0,0.01)", border: "1px solid #f1f5f9" };
const searchBar = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", gap: "15px", marginBottom: "30px", border: "1px solid #e2e8f0", flexWrap: "wrap" };
const searchField = { display: "flex", flexDirection: "column", flex: 1, minWidth: "200px" };
const fieldLabel = { fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "4px" };
const selectStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };

const vehicleGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px", marginTop: "20px" };
const vehicleCard = { background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column" };
const cardImageWrapper = { position: "relative", height: "160px", background: "#f1f5f9" };
const cardImage = { width: "100%", height: "100%", objectFit: "cover" };
const placeholderImage = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", background: "#f8fafc" };
const cardBadge = { position: "absolute", top: "10px", right: "10px", background: "#ecfdf5", color: "#059669", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" };
const cardBody = { padding: "16px", display: "flex", flexDirection: "column", flex: 1 };
const cardName = { margin: 0, fontSize: "16px", fontWeight: "700" };
const cardPrice = { margin: "4px 0", fontSize: "18px", fontWeight: "800", color: "#4f46e5" };
const cardDescription = { margin: "0 0 15px", fontSize: "13px", color: "#6b7280", flex: 1, lineHeight: "1.4" };
const bookBtn = { background: "#4f46e5", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const emptyStateCard = { background: "white", borderRadius: "16px", padding: "50px 20px", textAlign: "center", border: "1px solid #f1f5f9" };
const bookingListItem = { background: "white", borderRadius: "16px", padding: "20px", display: "flex", gap: "20px", border: "1px solid #f1f5f9", flexWrap: "wrap", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.01)" };
const inspectionBox = { marginTop: "10px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" };

const payNowBtn = { background: "#10b981", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const feedbackBtn = { background: "#4f46e5", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const formWrapper = { background: "white", padding: "35px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto", border: "1px solid #f1f5f9", boxShadow: "0 10px 20px rgba(0,0,0,0.01)" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const formGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const formLabel = { fontSize: "13px", fontWeight: "600", color: "#475569" };
const formInput = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };
const formTextarea = { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", resize: "vertical" };
const submitBtn = { background: "#4f46e5", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };
const cancelBtn = { background: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const overlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 };
const modal = { background: "white", padding: "30px", borderRadius: "16px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };
const modalInput = { width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };

const invoiceDetailBox = { background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" };

const applyBtn = { background: "#4f46e5", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const appliedBtn = { background: "#10b981", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600" };

const reviewBadge = { background: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };
const complaintBadge = { background: "#fee2e2", color: "#dc2626", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" };

const primaryBtn = { ...bookBtn, padding: "12px 24px" };
const secondaryBtn = { background: "white", color: "#1e1b4b", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" };

const fadeAnimation = { animation: "fadeIn 0.3s ease-out" };

const profileDropdown = { position: "absolute", top: "60px", right: 0, width: "260px", background: "white", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 9999 };
const profileHeader = { textAlign: "center", padding: "20px", borderBottom: "1px solid #e5e7eb" };
const profileAvatar = { width: "70px", height: "70px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "white", margin: "0 auto" };
const profileMenuItem = { padding: "12px 18px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f1f5f9", color: "#374151" };
const profileLogout = { padding: "14px 18px", cursor: "pointer", color: "red", fontWeight: "600" };
const style = document.createElement("style");
style.innerHTML = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`;
document.head.appendChild(style);
const availabilityBadge = (isAvailable) => ({
  position: "absolute",
  top: "12px",
  right: "12px",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "700",
  zIndex: 10,
  background: isAvailable ? "#10b981" : "#ef4444",
  color: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
});