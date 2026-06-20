import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerDashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
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
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [vehicleReviews, setVehicleReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Feedback Edit Modal States
  const [showEditFeedbackModal, setShowEditFeedbackModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editFeedbackType, setEditFeedbackType] = useState("feedback");
  const [editFeedbackRating, setEditFeedbackRating] = useState(5);
  const [editFeedbackComment, setEditFeedbackComment] = useState("");

  // Cancel Booking Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellationInfo, setCancellationInfo] = useState(null);

  const [pickupTime, setPickupTime] = useState("09:00");
  const [dropoffTime, setDropoffTime] = useState("09:00");

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

  useEffect(() => {
    if (activePage.page === "vehicleDetails" && activePage.data?._id) {
      fetchVehicleReviews(activePage.data._id);
    }
  }, [activePage]);

  const fetchVehicleReviews = async (vehicleId) => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/feedback/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicleReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicle reviews:", err);
      setVehicleReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

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
      const res = await axios.get("http://localhost:5000/api/feedback/customer", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching customer feedback:", err);
    }
  };

  const fetchAllFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/reviews");
      setAllFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Public feedback endpoint failed, using customer feedbacks as fallback");
      setAllFeedbacks(feedbacks);
    }
  };

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
      fetchFeedbacks();
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

  const handleOpenBookingModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingStartDate("");
    setBookingEndDate("");
    setPickupTime("09:00");
    setDropoffTime("09:00");
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
      pickupTime,
      dropoffTime,
      hasDriver: bookingHasDriver,
      baseAmount,
      driverCharge,
      totalAmountBeforePromo: baseAmount + driverCharge,
    });

    setShowBookingModal(false);
    setShowPaymentModal(true);
    showToast(`✅ Booking details saved! Proceeding to invoice...`, "success");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Add this function
const handleOpenFeedbackModal = (booking) => {
  setSelectedBookingForFeedback(booking);
  setFeedbackType("feedback");
  setFeedbackRating(5);
  setFeedbackComment("");
  setShowFeedbackModal(true);
};

  const handleOpenCancelModal = (booking) => {
    let refundPercentage = 0;
    if (["pending", "approved"].includes(booking.status)) {
      refundPercentage = 100;
    } else if (booking.status === "confirmed") {
      const startTime = new Date(booking.startDate);
      const now = new Date();
      const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);
      refundPercentage = hoursUntilStart > 24 ? 80 : 50;
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

    setSelectedBookingForCancel(booking);
    setCancellationInfo({ percentage: refundPercentage, amount: refundAmount });
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/bookings/${selectedBookingForCancel._id}/cancel`,
        { reason: cancelReason || "No reason provided" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(
        `✅ Booking cancelled! Refund of $${res.data.refund.amount} (${res.data.refund.percentage}%) will be processed.`,
        "success"
      );
      setShowCancelModal(false);
      setCancelReason("");
      setCancellationInfo(null);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel booking", "error");
    }
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
          pickupTime: tempBookingData.pickupTime,
          dropoffTime: tempBookingData.dropoffTime,
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
      await fetchVehicles();
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

  const filteredVehicles = Array.isArray(vehicles)
    ? vehicles.filter(v => {
        const matchesCategory = searchCategory === "all" || v.type === searchCategory;
        const matchesLocation = !searchLocation.trim() || v.location.toLowerCase().includes(searchLocation.toLowerCase());
        return matchesCategory && matchesLocation;
      })
    : [];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }} className="fade-in">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary" style={{ top: "-150px", left: "-150px" }}></div>
      <div className="glow-orb glow-orb-accent" style={{ bottom: "-100px", right: "-100px" }}></div>

      {/* Navbar */}
      <nav className="navbar-custom">
        <div className="navbar-container">
          <div className="nav-logo">
            <span style={{ fontSize: "28px", marginRight: "10px" }}>🚗</span>
            <span>QuickRide <span style={{ color: "var(--primary)" }}>Rentals</span></span>
          </div>

          <div className="nav-links-wrap">
            <NavItem label="Dashboard" active={activePage.page === "dashboard"} onClick={() => setActivePage({ page: "dashboard" })} />
            <NavItem label="Search Vehicles" active={activePage.page === "search" || activePage.page === "vehicleDetails"} onClick={() => setActivePage({ page: "search" })} />
            <NavItem label="My Bookings" active={activePage.page === "bookings"} onClick={() => setActivePage({ page: "bookings" })} />
           <NavItem label="Payment History" active={activePage.page === "payments"} onClick={() => setActivePage({ page: "payments" })} />
            <NavItem label="Feedback History" active={activePage.page === "feedback"} onClick={() => setActivePage({ page: "feedback" })} />
          </div>

          <div style={{ position: "relative" }}>
            <div className="profile-pill" onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}>
              <span style={{ fontSize: "18px" }}>👤</span>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.name || "Customer"}</span>
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
        
        {/* Dashboard Overview */}
        {activePage.page === "dashboard" && (
          <div className="slide-up">
            <div className="welcome-banner-wrap">
              <div style={{ zIndex: 2 }}>
                <h1 style={{ fontSize: "32px", margin: "0 0 8px 0", color: "white", fontWeight: "800" }}>Welcome back, {user.name}! 👋</h1>
                <p style={{ fontSize: "15.5px", color: "#e2e8f0", margin: 0, maxWidth: "520px" }}>Find, reserve, and manage premium vehicle rentals with absolute ease.</p>
              </div>
              <div style={{ fontSize: "78px", opacity: 0.9, filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.4))", zIndex: 1 }}>🚗</div>
            </div>

            <div className="dashboard-grid">
              <DashboardCard icon="📅" title="YOUR BOOKINGS" value={bookedCount} color="var(--primary)" />
              <DashboardCard icon="💰" title="TOTAL SPENT" value={`$${totalSpent}`} color="var(--success)" />
              <DashboardCard icon="⭐" title="SUBMITTED REVIEWS" value={feedbacks.filter(f => f.type === "feedback").length} color="var(--warning)" />
            </div>

            <div className="glass-card" style={{ padding: "25px", marginTop: "35px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px" }}>Quick Customer Actions</h3>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <button className="btn-base btn-primary" onClick={() => setActivePage({ page: "search" })}>🔍 Search Available Vehicles</button>
                <button className="btn-base btn-secondary" onClick={() => setActivePage({ page: "bookings" })}>📋 Check Booking Invoices</button>
              </div>
            </div>
          </div>
        )}

        {/* Search Vehicles Catalog */}
        {activePage.page === "search" && (
          <div className="slide-up">
            <h2>Search and Book Vehicles 🔍</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "25px" }}>Find vehicles by category, location, and dates.</p>

            <div className="glass-card" style={{ padding: "20px", display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label className="form-label">Vehicle Type</label>
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="custom-select">
                  <option value="all">All Vehicles</option>
                  <option value="car">Car</option>
                  <option value="bike">Three wheel</option>
                  <option value="van">Van</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label className="form-label">Location</label>
                <input type="text" placeholder="e.g. Colombo" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="custom-input" />
              </div>
            </div>

            <div className="dashboard-grid">
              {filteredVehicles.length === 0 ? (
                <div className="glass-card" style={{ gridColumn: "1/-1", padding: "50px", textAlign: "center" }}>
                  <span style={{ fontSize: "50px" }}>🚫</span>
                  <h3 style={{ marginTop: "10px" }}>No Vehicles Found</h3>
                  <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters.</p>
                </div>
              ) : (
                filteredVehicles.map(v => (
                  <div key={v._id} className="glass-card glass-card-hover" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", height: "180px", background: "#1e293b", cursor: "pointer" }} onClick={() => setActivePage({ page: "vehicleDetails", data: v })}>
                      {v.image ? (
                        <img src={`http://localhost:5000${v.image}`} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🚗</div>
                      )}
                      <span style={{
                        position: "absolute", top: "12px", right: "12px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", zIndex: 10,
                        background: v.isAvailable !== false ? "var(--success)" : "var(--danger)", color: "white", boxShadow: "var(--shadow-sm)"
                      }}>
                        {v.isAvailable !== false ? "Available" : "Rented"}
                      </span>
                    </div>

                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "white" }}>{v.name}</h4>
                      <p style={{ margin: "5px 0", color: "var(--text-secondary)", fontSize: "14px" }}>📍 {v.location}</p>
                      
                      {v.averageRating > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "5px 0" }}>
                          <span style={{ color: "#fbbf24" }}>{"★".repeat(Math.floor(v.averageRating))}</span>
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{v.averageRating} ({v.totalReviews})</span>
                        </div>
                      )}

                      <h3 style={{ margin: "10px 0", fontSize: "22px", fontWeight: "800", color: "var(--primary)" }}>
                        ${v.pricePerDay} <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "normal" }}>/day</span>
                      </h3>

                      <button className="btn-base btn-primary" style={{ width: "100%", marginTop: "auto" }} onClick={() => setActivePage({ page: "vehicleDetails", data: v })}>
                        View Details & Book
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Vehicle Details Sub-Page */}
        {activePage.page === "vehicleDetails" && activePage.data && (
          <div className="slide-up glass-card" style={{ padding: "40px" }}>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: "300px" }}>
                {activePage.data.image ? (
                  <img src={`http://localhost:5000${activePage.data.image}`} alt={activePage.data.name} style={{ width: "100%", borderRadius: "14px", boxShadow: "var(--shadow-md)" }} />
                ) : (
                  <div style={{ width: "100%", height: "240px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "70px" }}>🚗</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: "300px" }}>
                <h1 style={{ color: "white", fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>{activePage.data.name}</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "15px" }}>📍 {activePage.data.location}</p>
                
                <h2 style={{ color: "var(--primary)", fontSize: "28px", fontWeight: "800", marginBottom: "20px" }}>
                  ${activePage.data.pricePerDay} <span style={{ fontSize: "16px", color: "var(--text-secondary)" }}>/ day</span>
                </h2>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "white" }}>Specifications</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14.5px" }}>{activePage.data.description || "No specific details provided."}</p>
                </div>

                {activePage.data.averageRating > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "25px" }}>
                    <span style={{ fontSize: "22px", color: "#fbbf24" }}>{"★".repeat(Math.floor(activePage.data.averageRating))}</span>
                    <span style={{ fontSize: "15px", fontWeight: "600", color: "white" }}>
                      {activePage.data.averageRating} <span style={{ color: "var(--text-secondary)", fontWeight: "normal" }}>({activePage.data.totalReviews} reviews)</span>
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn-base btn-primary" style={{ flex: 2 }} onClick={() => handleOpenBookingModal(activePage.data)}>🚗 Book Now</button>
                  <button className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setActivePage({ page: "search" })}>⬅ Back</button>
                </div>
              </div>
            </div>

            {/* Vehicle Reviews */}
            <div style={{ marginTop: "40px", borderTop: "1px solid var(--border-color)", paddingTop: "30px" }}>
              <h3 style={{ color: "white", marginBottom: "20px" }}>💬 Customer Reviews ({vehicleReviews.length})</h3>
              {loadingReviews ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Loading reviews...</p>
              ) : vehicleReviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {vehicleReviews.map(review => (
  <div
    key={review._id}
    style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      padding: "20px"
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
      <span style={{ fontWeight: "700", color: "white" }}>
        👤 {review.customerId?.name || "Customer"}
      </span>
      <span style={{ color: "#fbbf24" }}>
        {"★".repeat(review.rating || 5)}
      </span>
    </div>

    {/* ✅ CUSTOMER COMMENT */}
    <p style={{ color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
      "{review.comment}"
    </p>

    {/* ✅ ✅ THIS IS THE MISSING PART */}
    {review.staffReplies && review.staffReplies.length > 0 ? (
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: "6px"
        }}
      >
        <strong style={{ fontSize: "12px", color: "white" }}>
          💬 Staff Replies:
        </strong>

        {review.staffReplies.map(r => (
          <p key={r._id} style={{ margin: "4px 0", fontSize: "13px" }}>
            • {r.replyText}
          </p>
        ))}
      </div>
    ) : review.staffResponse ? (
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "6px"
        }}
      >
        <strong style={{ fontSize: "12px" }}>💬 Staff Reply:</strong>
        <p style={{ margin: 0 }}>{review.staffResponse}</p>
      </div>
    ) : null}

    <small
      style={{
        display: "block",
        marginTop: "10px",
        color: "var(--text-muted)",
        textAlign: "right"
      }}
    >
      {new Date(review.createdAt).toLocaleDateString()}
    </small>
  </div>
))}

                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No reviews yet for this vehicle.</p>
              )}
            </div>
          </div>
        )}

        {/* Booking History */}
        {activePage.page === "bookings" && (
          <div className="slide-up">
            <h2>My Booking History 📋</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "25px" }}>Track statuses, pay invoices, and submit feedback.</p>

            {bookings.length === 0 ? (
              <div className="glass-card" style={{ padding: "50px", textAlign: "center" }}>
                <span style={{ fontSize: "64px" }}>📅</span>
                <h3>No Bookings Found</h3>
                <button className="btn-base btn-primary" style={{ marginTop: "15px" }} onClick={() => setActivePage({ page: "search" })}>Browse Vehicles</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {bookings.map(b => {
                  const start = new Date(b.startDate).toLocaleDateString();
                  const end = new Date(b.endDate).toLocaleDateString();
                  const bookingFeedbacks = feedbacks.filter(f => f.bookingId?._id === b._id);
                  return (
                    <div key={b._id} className="glass-card" style={{ padding: "24px", display: "flex", gap: "25px", flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ flex: 2 }}>
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "20px", color: "white", fontWeight: "700" }}>{b.vehicleId?.name || "Vehicle"}</h4>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}> Booking ID: {b._id}</p>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>📅 Period: {start} - {end}</p>
                        {b.pickupTime && <p style={{ margin: "4px 0 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>🕐 Pickup: {b.pickupTime} | Dropoff: {b.dropoffTime}</p>}
                        {b.driverName && <p style={{ margin: "6px 0 0 0", fontSize: "13.5px", color: "var(--primary)", fontWeight: "600" }}>👨‍✈️ Driver: {b.driverName}</p>}
                        
                        {b.status === "completed" && (
                          <div style={{ marginTop: "15px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "12px 16px", borderRadius: "8px" }}>
                            <h5 style={{ margin: "0 0 6px 0", color: "white" }}>🔧 Return Inspection Details</h5>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                              <strong>Condition:</strong> {b.returnCondition} | <strong>Mileage:</strong> {b.returnMileage} km | <strong>Fuel:</strong> {b.returnFuelLevel}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: "180px", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>BILLING DETAILS</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13.5px" }}>Base Price: ${b.baseCharge}</p>
                        {b.driverCharge > 0 && <p style={{ margin: 0, fontSize: "13.5px" }}>Driver: ${b.driverCharge}</p>}
                        {b.discount > 0 && <p style={{ margin: 0, fontSize: "13.5px", color: "var(--accent)" }}>Discount: -${b.discount}</p>}
                        <h4 style={{ margin: "8px 0 0 0", color: "white", fontSize: "18px", fontWeight: "800" }}>Total: ${b.totalAmount}</h4>
                      </div>

                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                        <span className={`badge-base badge-${b.status}`}>{b.status.toUpperCase()}</span>
                        
                        {!["completed", "cancelled", "rejected", "ongoing"].includes(b.status) && (
                          <button className="btn-base btn-danger" style={{ padding: "8px 14px", fontSize: "13px" }} onClick={() => handleOpenCancelModal(b)}>Cancel Booking</button>
                        )}

                        {b.status === "completed" && (
                          bookingFeedbacks.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Reviewed ✅</span>
                              <button className="btn-base btn-secondary" style={{ padding: "6px 12px", fontSize: "12.5px" }} onClick={() => handleEditFeedback(bookingFeedbacks[0])}>Edit Review</button>
                            </div>
                          ) : (
                            <button className="btn-base btn-primary" style={{ padding: "8px 14px", fontSize: "13px" }} onClick={() => handleOpenFeedbackModal(b)}>⭐ Review / Complain</button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
{/* PAYMENT HISTORY */}
{activePage.page === "payments" && (
  <div className="slide-up">
    <h2>Payment History 💳</h2>
    <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
      View all your payment transactions.
    </p>

    {bookings.filter(b => b.totalAmount > 0).length === 0 ? (
      <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
        <h3>No payments yet</h3>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {bookings
          .filter(b => ["confirmed", "completed", "ongoing"].includes(b.status))
          .map(b => (
            <div key={b._id} className="glass-card" style={{ padding: "20px" }}>
              
              <h4 style={{ margin: 0 }}>
                {b.vehicleId?.name}
              </h4>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Booking ID: {b._id}
              </p>

              <p style={{ margin: "5px 0" }}>
                Amount Paid: <strong>${b.totalAmount}</strong>
              </p>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {new Date(b.createdAt).toLocaleDateString()}
              </p>

            </div>
          ))}
      </div>
    )}
  </div>
)}
        {/* Feedback History */}
        {activePage.page === "feedback" && (
          <div className="slide-up">
            <h2>Feedback & Complaint Submissions 📣</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "25px" }}>View, edit, or delete your complaints and feedback submissions.</p>

            {feedbacks.length === 0 ? (
              <div className="glass-card" style={{ padding: "50px", textAlign: "center" }}>
                <span style={{ fontSize: "64px" }}>💬</span>
                <h3>No Submissions Recorded</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {feedbacks.map(f => (
                  <div key={f._id} className="glass-card" style={{ padding: "24px", display: "flex", gap: "25px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{
                          background: f.type === "complaint" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                          color: f.type === "complaint" ? "var(--danger)" : "var(--warning)",
                          padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700"
                        }}>{f.type.toUpperCase()}</span>
                        {f.type === "feedback" && <span style={{ color: "#fbbf24" }}>{"★".repeat(f.rating)}</span>}
                      </div>
                      <p style={{ margin: "8px 0", fontSize: "16px", color: "white", fontStyle: "italic" }}>"{f.comment}"</p>
                      <small style={{ color: "var(--text-muted)" }}>Submitted for: {f.bookingId?.vehicleId?.name || "Vehicle"} on {new Date(f.createdAt).toLocaleDateString()}</small>
                    </div>

                    <div style={{ flex: 1, minWidth: "200px", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
                      {f.type === "complaint" && (
  <>
    {f.staffReplies && f.staffReplies.length > 0 ? (
      <div
        style={{
          marginTop: "10px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          padding: "10px",
          borderRadius: "8px"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "white",
            fontWeight: "600"
          }}
        >
          💬 Staff Replies:
        </p>

        {f.staffReplies.map(r => (
          <p
            key={r._id}
            style={{
              margin: "4px 0",
              fontSize: "13px",
              color: "var(--text-secondary)"
            }}
          >
            • {r.replyText}
          </p>
        ))}
      </div>
    ) : f.staffResponse ? (
      <div
        style={{
          marginTop: "10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border-color)",
          padding: "10px",
          borderRadius: "8px"
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", color: "white" }}>
          <strong>Staff Reply:</strong>
        </p>

        <p
          style={{
            margin: "2px 0 0",
            fontSize: "13px",
            color: "var(--text-secondary)"
          }}
        >
          {f.staffResponse}
        </p>
      </div>
    ) : (
      <p
        style={{
          margin: "6px 0 0",
          fontSize: "13px",
          color: "var(--text-muted)",
          fontStyle: "italic"
        }}
      >
        Awaiting staff reply...
      </p>
    )}
  </>
)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button className="btn-base btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handleEditFeedback(f)}>Edit</button>
                      <button className="btn-base btn-danger" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => handleDeleteFeedback(f._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="custom-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "5px" }}>👤 Edit Customer Profile</h3>
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

      {/* Booking Modal */}
      {showBookingModal && selectedVehicle && (
        <div className="custom-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Book {selectedVehicle.name} 🗓️</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Rate: ${selectedVehicle.pricePerDay}/day | Location: {selectedVehicle.location}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Start Date</label>
                  <input type="date" value={bookingStartDate} onChange={(e) => setBookingStartDate(e.target.value)} className="custom-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">End Date</label>
                  <input type="date" value={bookingEndDate} onChange={(e) => setBookingEndDate(e.target.value)} className="custom-input" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">🕐 Pickup Time</label>
                  <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="custom-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">🕐 Dropoff Time</label>
                  <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="custom-input" />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                <input type="checkbox" id="hasDriver" checked={bookingHasDriver} onChange={(e) => setBookingHasDriver(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <label htmlFor="hasDriver" style={{ cursor: "pointer", fontWeight: "500", fontSize: "14px" }}>Add a personal driver ($50/day driver fee)</label>
              </div>
            </div>

            {bookingError && <p style={{ color: "var(--danger)", fontWeight: "bold", fontSize: "14px", marginTop: "10px" }}>⚠️ {bookingError}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button className="btn-base btn-primary" style={{ flex: 2 }} onClick={handleProceedToPayment}>Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Invoice Modal */}
      {showPaymentModal && tempBookingData && (
        <div className="custom-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>💳 Complete Payment</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Booking Invoice: {selectedVehicle?.name}</p>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14.5px" }}>
                <span>Rental Charge:</span>
                <span>${tempBookingData.baseAmount}</span>
              </div>
              {tempBookingData.driverCharge > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14.5px" }}>
                  <span>Driver Charge:</span>
                  <span>${tempBookingData.driverCharge}</span>
                </div>
              )}
              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14.5px", color: "var(--success)" }}>
                  <span>Promo Discount ({promoDiscountPercent}%):</span>
                  <span>-${((tempBookingData.totalAmountBeforePromo * promoDiscountPercent) / 100).toFixed(2)}</span>
                </div>
              )}
              <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "18px", color: "white" }}>
                <span>Total:</span>
                <span>${(tempBookingData.totalAmountBeforePromo - (promoApplied ? (tempBookingData.totalAmountBeforePromo * promoDiscountPercent) / 100 : 0)).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input type="text" placeholder="PROMO CODE" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="custom-input" disabled={promoApplied} />
              <button type="button" className={`btn-base ${promoApplied ? "btn-success" : "btn-primary"}`} onClick={handleApplyPromo} disabled={promoApplied}>
                {promoApplied ? "Applied" : "Apply"}
              </button>
            </div>
            {promoError && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{promoError}</p>}

            <div style={{ marginBottom: "15px" }}>
              <label className="form-label">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="custom-select">
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            {["credit_card", "debit_card"].includes(paymentMethod) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="custom-input" />
                <input type="text" placeholder="Cardholder Name" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="custom-input" />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn-base btn-success" style={{ flex: 2 }} onClick={handleProcessPayment}>Complete Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBookingForCancel && cancellationInfo && (
        <div className="custom-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>❌ Cancel Booking</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>
              Vehicle: <strong>{selectedBookingForCancel.vehicleId?.name}</strong> | Status: <strong>{selectedBookingForCancel.status.toUpperCase()}</strong>
            </p>

            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "12px", marginBottom: "15px" }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: "700", color: "var(--success)", fontSize: "14.5px" }}>💰 Refund Information:</p>
              <p style={{ margin: 0, fontSize: "14px" }}>Original Amount: <strong>${selectedBookingForCancel.totalAmount}</strong></p>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>Refund: <strong style={{ color: "var(--success)" }}>${cancellationInfo.amount} ({cancellationInfo.percentage}%)</strong></p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "15px" }}>
              <label className="form-label">Cancellation Reason (Optional)</label>
              <textarea placeholder="Tell us why you're cancelling..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="custom-textarea" rows={3} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>Keep Booking</button>
              <button className="btn-base btn-danger" style={{ flex: 1 }} onClick={handleConfirmCancel}>Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback & Review Modal */}
      {showFeedbackModal && selectedBookingForFeedback && (
        <div className="custom-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>⭐ Review / File Complaint</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Submit comments for booking ID: {selectedBookingForFeedback._id}</p>

            <form onSubmit={handleSubmittingFeedback} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Submission Type</label>
                <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className="custom-select">
                  <option value="feedback">General Feedback & Rating</option>
                  <option value="complaint">File a Complaint</option>
                </select>
              </div>

              {feedbackType === "feedback" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <select value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} className="custom-select">
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Comments / Details</label>
                <textarea placeholder="Provide details about your experience..." value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} className="custom-textarea" rows={4} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Feedback Modal */}
      {showEditFeedbackModal && editingFeedback && (
        <div className="custom-modal-overlay" onClick={() => setShowEditFeedbackModal(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "700" }}>✏️ Edit Feedback / Complaint</h3>

            <form onSubmit={handleUpdateFeedback} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Submission Type</label>
                <select value={editFeedbackType} onChange={(e) => setEditFeedbackType(e.target.value)} className="custom-select">
                  <option value="feedback">General Feedback & Rating</option>
                  <option value="complaint">File a Complaint</option>
                </select>
              </div>

              {editFeedbackType === "feedback" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Rating (1-5 Stars)</label>
                  <select value={editFeedbackRating} onChange={(e) => setEditFeedbackRating(Number(e.target.value))} className="custom-select">
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{"★".repeat(n)} ({n} Stars)</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Comments / Details</label>
                <textarea value={editFeedbackComment} onChange={(e) => setEditFeedbackComment(e.target.value)} className="custom-textarea" rows={5} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-base btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="btn-base btn-primary" style={{ flex: 2 }}>Update Feedback</button>
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

const DashboardCard = ({ icon, title, value, color }) => (
  <div className="glass-card dashboard-card-metric" style={{ position: "relative", overflow: "hidden" }}>
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