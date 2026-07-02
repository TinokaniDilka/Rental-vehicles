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
  returnBooking,
  createBookingWithPayment,
  cancelBooking,
  updateHandoverStatus,
  confirmCashPayment,
  confirmStaffHandover
} = require("../controllers/bookingController");

// Customer routes
router.post("/", protect, createBooking);
router.post("/create-with-payment", protect, createBookingWithPayment);
router.get("/customer", protect, getCustomerBookings);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/handover", protect, updateHandoverStatus);

// Staff/Admin routes
router.get("/staff/all", protect, getAllBookings);
router.put("/:id/review", protect, reviewBooking);
router.put("/:id/pay", protect, payBooking); // note: payment is completed by user
router.put("/:id/pickup", protect, pickupBooking);
router.put("/:id/return", protect, returnBooking);
router.put("/:id/confirm-cash", protect, confirmCashPayment);
router.put("/:id/confirm-handover", protect, confirmStaffHandover);

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