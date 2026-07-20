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
    enum: ["credit_card", "debit_card", "bank_transfer", "cash", "card"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed"
  },
  // Explicit transaction type. Optional/undefined on older records — the
  // frontend falls back to inferring from amount sign for those. New
  // records should always set this so the Payments log is unambiguous.
  // Commission fields – split of total payment between platform and staff
  platformCommission: { type: Number, default: 0 },
  ownerEarnings: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ["charge", "refund", "deposit_release", "deposit_capture", "additional_charge"],
    default: undefined
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
