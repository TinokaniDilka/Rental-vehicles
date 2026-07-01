const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  hasDriver: {
    type: Boolean,
    default: false
  },
  driverName: {
    type: String,
    default: ""
  },
  pickupTime: {
    type: String,
    default: "09:00"
  },
  dropoffTime: {
    type: String,
    default: "09:00"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "confirmed", "ongoing", "completed", "cancelled"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "bank_transfer", "cash", ""],
    default: ""
  },
  // Dynamic financial fields
  baseCharge: { type: Number, default: 0 },
  driverCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  additionalFees: { type: Number, default: 0 },
  lateReturnCharge: { type: Number, default: 0 },
  damageCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
  // Return inspection records
  actualReturnDate: { type: Date },
  returnMileage: { type: Number },
  returnFuelLevel: { type: Number },
  returnCondition: { type: String, default: "" },
  damages: { type: String, default: "" },

  // Cancellation and Refund
  cancelledAt: { type: Date },
  cancelledReason: { type: String, default: "" },
  refundStatus: {
    type: String,
    enum: ["none", "pending", "processed"],
    default: "none"
  },
  refundAmount: { type: Number, default: 0 },
  refundedAt: { type: Date },
  
  // Handover & Verification
  handoverStatus: {
    type: String,
    enum: ["pending_pickup", "rented", "returned", "confirmed_return"],
    default: "pending_pickup"
  },
  conditionPhotos: [{ type: String }],
  rentalAgreementSigned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
