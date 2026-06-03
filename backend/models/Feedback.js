const mongoose = require("mongoose");

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
  staffResponse: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
