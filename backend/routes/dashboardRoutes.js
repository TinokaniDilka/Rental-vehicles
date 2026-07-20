const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Feedback = require("../models/Feedback");
const AuditLog = require("../models/AuditLog");

// Get overall stats for Admin/Staff dashboard
router.get("/stats", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const totalVehicles = await Vehicle.countDocuments();
    const activeRentals = await Booking.countDocuments({ status: "ongoing" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedRentals = await Booking.countDocuments({ status: "completed" });

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await Payment.aggregate([
      { $match: { paidAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const monthlyRevenue = revenueResult[0]?.total || 0;

    // Calculate customer satisfaction
    const satisfactionResult = await Feedback.aggregate([
      { $match: { type: "feedback", rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const customerSatisfaction = satisfactionResult[0]?.avgRating 
      ? Math.round(satisfactionResult[0].avgRating * 10) / 10 
      : 5.0;

    res.json({
      totalVehicles,
      activeRentals,
      totalCustomers,
      pendingBookings,
      completedRentals,
      monthlyRevenue,
      customerSatisfaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error calculating dashboard statistics", error: err.message });
  }
});

// Get reports (Bookings, Payments, Vehicle availability, Customer feedback)
router.get("/reports", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookings = await Booking.find()
      .populate("vehicleId", "name type pricePerDay")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    const payments = await Payment.find()
      .populate({
        path: "bookingId",
        populate: {
          path: "vehicleId",
          select: "name owner",
          populate: { path: "owner", select: "name email" }
        }
      })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    const vehicles = await Vehicle.find().populate("owner", "name email");

    const feedback = await Feedback.find()
      .populate("customerId", "name email")
      .populate({
        path: "bookingId",
        populate: { path: "vehicleId", select: "name" }
      })
      .sort({ createdAt: -1 });

    const auditLog = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      bookings,
      payments,
      vehicles,
      feedback,
      auditLog
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating reports" });
  }
});

module.exports = router;
