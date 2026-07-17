const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Booking actions
      "Cash Payment Confirmed",
      "Handover Confirmed",
      "Return Confirmed",
      "Booking Approved",
      "Booking Rejected",
      "Booking Cancelled",
      "Deposit Released",
      "Deposit Captured",
      // Vehicle actions
      "Vehicle Added",
      "Vehicle Updated",
      "Vehicle Deleted",
      // User/account actions
      "Staff Registered",
      "Admin Registered",
      "User Activated",
      "User Deactivated",
      "User Deleted",
      "ID Verification Approved",
      "ID Verification Rejected",
      // Promo actions
      "Promo Code Created",
      "Promo Code Activated",
      "Promo Code Deactivated"
    ]
  },
  // Booking-related actions populate this. NOT required — many actions
  // (vehicle/user/promo changes) have nothing to do with a booking.
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },
  // Generic target reference, used for non-booking actions
  // (e.g. targetType: "Vehicle", targetId: <vehicle._id>)
  targetType: {
    type: String,
    default: null
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // Optional short human-readable context, e.g. "Range Rover" or "promo RIDE25"
  details: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
