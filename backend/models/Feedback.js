const mongoose = require("mongoose");

const staffReplySchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  staffName: String,
  replyText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["feedback", "complaint"],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }, // Only for feedback
  comment: {
    type: String,
    required: true
  },
  complaintStatus: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  }, // Only for complaints
  category: {
    type: String,
    enum: ["Vehicle Damage", "No-show", "Vehicle Not as Described", "Theft/Suspicious", "Other"],
    default: "Other"
  },
  escalated: { type: Boolean, default: false },
  staffResponse: {
    type: String,
    default: ""
  },
  staffReplies: [staffReplySchema]
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
