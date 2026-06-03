const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "bank_transfer", "cash"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed"
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
