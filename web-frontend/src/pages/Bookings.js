import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Bookings() {
  const { id } = useParams(); // vehicle id
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch vehicle details
  useEffect(() => {
    fetch(`http://localhost:5000/api/vehicles/${id}`)
      .then(res => res.json())
      .then(data => setVehicle(data));
  }, [id]);

  // Fetch existing bookings for this vehicle
  useEffect(() => {
    fetch(`http://localhost:5000/api/bookings/vehicle/${id}`)
      .then(res => res.json())
      .then(data => setBookings(data));
  }, [id]);

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return false;
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = (e - s) / (1000 * 60 * 60 * 24) + 1; // inclusive

    if (days > 7) {
      setError("Maximum rental period is 7 days");
      return false;
    }
    if (days < 1) {
      setError("End date must be after start date");
      return false;
    }

    // Check for overlapping bookings
    const hasOverlap = bookings.some(b => {
      const bs = new Date(b.startDate);
      const be = new Date(b.endDate);
      return s <= be && e >= bs;
    });

    if (hasOverlap) {
      setError("Vehicle is not available for the selected dates");
      return false;
    }

    setError("");
    return true;
  };

  const handleBooking = async () => {
    if (!validateDates()) return;

    setLoading(true);
    try {
      // Create booking
      const bookingRes = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: id,
          customerId: user._id,
          startDate,
          endDate,
          status: "pending"
        })
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) throw new Error(bookingData.message || "Booking failed");

      // ✅ Send Notification to Vehicle Owner
      await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: vehicle.owner?._id,           // Send to vehicle owner
          type: "new_booking",
          title: "New Vehicle Rental Request",
          message: `${user.name} has rented your vehicle "${vehicle.name}" from ${startDate} to ${endDate}`,
          bookingId: bookingData._id,
          vehicleId: id
        })
      });

      alert("🎉 Booking successful! The owner has been notified.");
      window.location.href = "/customer-dashboard";

    } catch (err) {
      console.error(err);
      alert(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading vehicle details...</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1>{vehicle.name}</h1>

      {/* Vehicle Image */}
      {vehicle.image && (
        <img
          src={`http://localhost:5000${vehicle.image}`}
          alt={vehicle.name}
          style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px", marginBottom: "20px" }}
        />
      )}

      <p>{vehicle.description}</p>
      <h3>Rs. {vehicle.pricePerDay || vehicle.price} / day</h3>

      {/* Renter (Owner) Information */}
      <div style={{ 
        background: "#f8f9fa", 
        padding: "15px", 
        borderRadius: "8px", 
        margin: "20px 0" 
      }}>
        <h4>Vehicle Owner</h4>
        <p><strong>Name:</strong> {vehicle.owner?.name}</p>
        <p><strong>Email:</strong> {vehicle.owner?.email}</p>
      </div>

      {/* Calendar Section */}
      <div style={{ marginTop: "30px" }}>
        <h3>Select Rental Period (Max 7 Days)</h3>
        
        <div style={{ display: "flex", gap: "20px", marginTop: "15px", flexWrap: "wrap" }}>
          <div>
            <label><strong>Start Date</strong></label><br />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: "10px", fontSize: "16px", marginTop: "5px" }}
            />
          </div>

          <div>
            <label><strong>End Date</strong></label><br />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: "10px", fontSize: "16px", marginTop: "5px" }}
            />
          </div>
        </div>
      </div>

      {error && <p style={{ color: "red", fontWeight: "bold", marginTop: "15px" }}>{error}</p>}

      <button
        onClick={handleBooking}
        disabled={loading}
        style={{
          background: loading ? "#666" : "#28a745",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "10px",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          fontSize: "18px",
          marginTop: "25px"
        }}
      >
        {loading ? "Processing..." : "Book Now"}
      </button>
    </div>
  );
}