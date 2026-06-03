const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createBooking,
  getCustomerBookings,
  getAllBookings,
  reviewBooking,
  payBooking,
  pickupBooking,
  returnBooking
} = require("../controllers/bookingController");

// Customer routes
router.post("/", protect, createBooking);
router.get("/customer", protect, getCustomerBookings);

// Staff/Admin routes
router.get("/staff/all", protect, getAllBookings);
router.put("/:id/review", protect, reviewBooking);
router.put("/:id/pay", protect, protect, payBooking); // note: payment is completed by user
router.put("/:id/pickup", protect, pickupBooking);
router.put("/:id/return", protect, returnBooking);

// ✅ BACKWARD COMPATIBILITY: GET bookings of a vehicle for blocking dates
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const bookings = await Booking.find({
      vehicleId: req.params.vehicleId,
      status: { $in: ["confirmed", "ongoing", "completed"] }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;