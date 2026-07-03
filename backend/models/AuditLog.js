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
    enum: ["Cash Payment Confirmed", "Handover Confirmed", "Return Confirmed"]
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
