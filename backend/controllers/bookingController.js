const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

// Shared helper: only "Verified" users may create bookings
const requireVerifiedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return { ok: false, status: 404, message: "User not found" };
  }
  if (user.verificationStatus !== "Verified") {
    return {
      ok: false,
      status: 403,
      message: "Your account must be Verified before you can make a booking. Please upload your ID and license documents in your profile and wait for admin approval."
    };
  }
  return { ok: true, user };
};

// Create pending booking
const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, hasDriver } = req.body;
    const customerId = req.user.id;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Enforce ID verification before allowing a booking
    const verificationCheck = await requireVerifiedUser(customerId);
    if (!verificationCheck.ok) {
      return res.status(verificationCheck.status).json({ message: verificationCheck.message });
    }

    // Check date overlap with already confirmed or ongoing bookings
    const overlap = await Booking.findOne({
      vehicleId,
      status: { $in: ["confirmed", "ongoing"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    });

    if (overlap) {
      return res.status(400).json({ message: "Vehicle is already booked for these dates." });
    }

    // Look up vehicle so we can show the customer an estimated total
    // even before staff approval — previously this was left at 0 until
    // reviewBooking ran, which showed "LKR 0" on pending bookings.
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const baseCharge = (vehicle.pricePerDay || 0) * days;
    const driverCharge = hasDriver ? 50 * days : 0;
    const totalAmount = baseCharge + driverCharge;

    const booking = new Booking({
      vehicleId,
      customerId,
      startDate,
      endDate,
      hasDriver,
      status: "pending",
      baseCharge,
      driverCharge,
      totalAmount,
      depositAmount: vehicle.depositAmount || 0
    });

    await booking.save();
    res.status(201).json({ message: "Booking request submitted successfully ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

// Get bookings for logged-in customer
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("vehicleId", "name type location pricePerDay image")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving bookings" });
  }
};

// Get all bookings (Staff/Admin view)
// AFTER
const getAllBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "admin") {
      // Admin sees all bookings
      bookings = await Booking.find()
        .populate("vehicleId", "name type location pricePerDay image depositAmount requireVerification")
        .populate("customerId", "name email verificationStatus")
        .sort({ createdAt: -1 });
    } else {
      // Staff only sees bookings for vehicles they own
      const staffVehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = staffVehicles.map(v => v._id);

      bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
        .populate("vehicleId", "name type location pricePerDay image depositAmount requireVerification")
        .populate("customerId", "name email verificationStatus")
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving bookings" });
  }
};

// Review booking (Approve/Reject by Staff)
const reviewBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverName, discount, additionalFees } = req.body; // status: 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(id).populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;

    if (status === "approved") {
      // Calculate billing charges
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const dailyRate = booking.vehicleId.pricePerDay || 0;
      booking.baseCharge = dailyRate * days;

      if (booking.hasDriver) {
        booking.driverName = driverName || "Assigned Driver";
        booking.driverCharge = 50 * days; // Driver rate is $50/day
      } else {
        booking.driverName = "";
        booking.driverCharge = 0;
      }

      booking.discount = Number(discount) || 0;
      booking.additionalFees = Number(additionalFees) || 0;

      // Calculate total
      booking.totalAmount = booking.baseCharge + booking.driverCharge + booking.additionalFees - booking.discount;

      // Copy deposit from vehicle
      booking.depositAmount = booking.vehicleId.depositAmount || 0;
      booking.depositStatus = booking.depositAmount > 0 ? "held" : "released";
    } else if (status === "rejected") {
      // Nothing was ever charged or held for a rejected booking
      booking.depositAmount = 0;
      booking.depositStatus = "released";
    }

    await booking.save();
    res.json({ message: `Booking status updated to ${status} ✅`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reviewing booking", error: err.message });
  }
};

// Confirm payment (Customer)
const payBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({ message: "Booking must be approved before payment" });
    }

    // Save payment log
    const payment = new Payment({
      bookingId: booking._id,
      customerId: req.user.id,
      amount: booking.totalAmount,
      paymentMethod,
      status: "completed"
    });
    await payment.save();

    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    booking.status = "confirmed";
    if (paymentMethod !== "cash") {
      booking.cashPaymentConfirmed = true;
    }
    await booking.save();

    res.json({ message: "Payment confirmed successfully! Booking active ✅", booking });
  } catch (err) {
    res.status(500).json({ message: "Error processing payment", error: err.message });
  }
};

// Start rental (Ongoing status - Pickup)
const pickupBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Booking payment must be confirmed first" });
    }

    booking.status = "ongoing";
    booking.handoverStatus = "rented";
    if (booking.depositAmount > 0 && booking.depositStatus !== "released" && booking.depositStatus !== "captured") {
      booking.depositStatus = "held";
    }
    await booking.save();

    // Mark vehicle as physically unavailable right now
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: false });

    res.json({ message: "Rental started. Booking is now Ongoing 🚗", booking });
  } catch (err) {
    res.status(500).json({ message: "Error starting rental" });
  }
};

// Complete return inspection (Completed status)
const returnBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualReturnDate, returnMileage, returnFuelLevel, returnCondition, damages, damageCharge } = req.body;

    const booking = await Booking.findById(id).populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "ongoing") {
      return res.status(400).json({ message: "Booking is not active/ongoing" });
    }

    booking.actualReturnDate = new Date(actualReturnDate || Date.now());
    booking.returnMileage = Number(returnMileage) || 0;
    booking.returnFuelLevel = Number(returnFuelLevel) || 100;
    booking.returnCondition = returnCondition || "Good";
    booking.damages = damages || "";
    booking.damageCharge = Number(damageCharge) || 0;

    // Check if returned late
    const scheduledEnd = new Date(booking.endDate);
    const actualEnd = new Date(booking.actualReturnDate);

    // Calculate late days
    const diffTime = actualEnd - scheduledEnd;
    const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (lateDays > 0) {
      const dailyPrice = booking.vehicleId.pricePerDay || 0;
      // Late fee is 1.5x standard price per day
      booking.lateReturnCharge = dailyPrice * 1.5 * lateDays;
    } else {
      booking.lateReturnCharge = 0;
    }

    // Adjust total amount
    booking.totalAmount += booking.lateReturnCharge + booking.damageCharge;
    booking.status = "completed";
    booking.handoverStatus = "confirmed_return";
    booking.staffReturnConfirmed = true;

    // Update deposit status on return
    if (booking.depositAmount > 0) {
      if (booking.damageCharge > 0 || returnCondition === "Damaged") {
        booking.depositStatus = "captured";
      } else {
        booking.depositStatus = "released";
      }
    }

    await booking.save();

    // Mark vehicle as physically available again
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });

    res.json({ message: "Vehicle return finalized successfully ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error finalizing return", error: err.message });
  }
};
// Create booking + payment in one step (Customer payment-first flow)
const createBookingWithPayment = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, hasDriver, paymentMethod, amount, promoCode, pickupTime, dropoffTime } = req.body;
    const customerId = req.user.id;

    if (!vehicleId || !startDate || !endDate || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Enforce ID verification before allowing a booking
    const verificationCheck = await requireVerifiedUser(customerId);
    if (!verificationCheck.ok) {
      return res.status(verificationCheck.status).json({ message: verificationCheck.message });
    }

    // Check date overlap
    const overlap = await Booking.findOne({
      vehicleId,
      status: { $in: ["confirmed", "ongoing"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    });

    if (overlap) {
      return res.status(400).json({ message: "Vehicle is already booked for these dates." });
    }

    // Calculate charges
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const vehicle = await Vehicle.findById(vehicleId);
    const baseCharge = vehicle.pricePerDay * days;
    const driverCharge = hasDriver ? 50 * days : 0;
    const totalAmount = amount || (baseCharge + driverCharge);

    // Create booking as confirmed directly
    const booking = new Booking({
      vehicleId,
      customerId,
      startDate,
      endDate,
      hasDriver: hasDriver || false,
      pickupTime: pickupTime || "09:00",
      dropoffTime: dropoffTime || "09:00",
      status: "confirmed",
      paymentMethod,
      baseCharge,
      driverCharge,
      totalAmount,
      depositAmount: vehicle.depositAmount || 0,
      depositStatus: vehicle.depositAmount > 0 ? "held" : "released",
      cashPaymentConfirmed: paymentMethod !== "cash",
      rentalAgreementSigned: req.body.rentalAgreementSigned || false
    });
    await booking.save();

    // Save payment record
    const payment = new Payment({
      bookingId: booking._id,
      customerId,
      amount: totalAmount,
      paymentMethod,
      status: "completed"
    });
    await payment.save();

    res.status(201).json({ message: "Booking confirmed and payment completed ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Payment failed" });
  }
};

// Cancel booking and process refund (Customer)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customerId = req.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify customer owns this booking
    if (booking.customerId.toString() !== customerId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Can only cancel bookings that are not already completed or cancelled
    if (["completed", "cancelled", "rejected"].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    // Can't cancel ongoing bookings
    if (booking.status === "ongoing") {
      return res.status(400).json({ message: "Cannot cancel an ongoing rental" });
    }

    // Calculate refund based on status.
    // The 75/25 split (when applicable) is calculated ONLY from the vehicle's
    // base rental amount (baseCharge) — not driver charges or add-on fees,
    // since those services were never rendered and are refunded in full.
    let refundPercentage = 0;
    let staffRetainedPercentage = 0;

    const vehicleAmount = booking.baseCharge || 0;
    const nonVehicleAmount = Math.max((booking.totalAmount || 0) - vehicleAmount, 0);

    let refundAmount = 0;
    let staffRetainedAmount = 0;

    if (booking.status === "pending" || booking.status === "approved") {
      // Full refund for pending/approved bookings (no payment yet or not started)
      refundPercentage = 100;
      refundAmount = booking.totalAmount;
      staffRetainedAmount = 0;
    } else if (booking.status === "confirmed") {
      // Paid, but customer has NOT yet collected the vehicle from staff.
      // Customer gets 75% of the vehicle rental amount back; the remaining 25%
      // of the vehicle amount is retained by staff as a cancellation fee.
      // Driver charges / additional fees are refunded in full.
      refundPercentage = 75;
      staffRetainedPercentage = 25;

      const vehicleRefund = Math.round((vehicleAmount * refundPercentage) / 100);
      const vehicleRetained = Math.round((vehicleAmount * staffRetainedPercentage) / 100);

      refundAmount = vehicleRefund + nonVehicleAmount;
      staffRetainedAmount = vehicleRetained;
    }

    // Update booking with cancellation info
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledReason = reason || "No reason provided";
    booking.refundStatus = "processed";
    booking.refundAmount = refundAmount;
    booking.refundedAt = new Date();
    booking.staffRetainedAmount = staffRetainedAmount;

    // Release any held deposit — cancellation refund logic above already
    // accounts for the vehicle charge split, so the deposit itself (a
    // separate security hold, not a charge) should simply be freed up.
    if (booking.depositAmount > 0 && booking.depositStatus === "held") {
      booking.depositStatus = "released";
    }

    await booking.save();

    // Create refund record in Payment model
    const payment = new Payment({
      bookingId: booking._id,
      customerId,
      amount: -refundAmount, // Negative to indicate refund
      paymentMethod: booking.paymentMethod,
      status: "completed"
    });
    await payment.save();

    res.json({
      message: staffRetainedAmount > 0
        ? `Booking cancelled successfully ✅. Refund of $${refundAmount} will be processed (75% of the $${vehicleAmount} vehicle rental amount, plus any driver/other charges in full). $${staffRetainedAmount} is retained as a cancellation fee since the vehicle was not yet collected from staff.`
        : `Booking cancelled successfully ✅. Refund of $${refundAmount} (${refundPercentage}%) will be processed.`,
      booking,
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        originalAmount: booking.totalAmount,
        vehicleAmount,
        nonVehicleAmount,
        staffRetainedAmount,
        staffRetainedPercentage
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};

// Staff confirms cash payment received
const confirmCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentMethod !== "cash") {
      return res.status(400).json({ message: "This booking is not a cash payment" });
    }

    if (booking.cashPaymentConfirmed) {
      return res.status(400).json({ message: "Cash payment already confirmed" });
    }

    booking.cashPaymentConfirmed = true;
    await booking.save();

    // Log staff action to audit log
    const auditLog = new AuditLog({
      staffId: req.user.id,
      staffName: req.user.name,
      action: "Cash Payment Confirmed",
      bookingId: booking._id,
      timestamp: new Date()
    });
    await auditLog.save();

    res.json({ message: "Cash payment confirmed ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error confirming cash payment", error: err.message });
  }
};

// Staff confirms physical vehicle handover
const confirmStaffHandover = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!["confirmed", "ongoing"].includes(booking.status)) {
      return res.status(400).json({ message: "Handover can only be confirmed for confirmed or ongoing bookings" });
    }

    if (booking.staffHandoverConfirmed) {
      return res.status(400).json({ message: "Handover already confirmed by staff" });
    }

    booking.staffHandoverConfirmed = true;
    booking.handoverStatus = "rented";
    await booking.save();

    // Log staff action to audit log
    const auditLog = new AuditLog({
      staffId: req.user.id,
      staffName: req.user.name,
      action: "Handover Confirmed",
      bookingId: booking._id,
      timestamp: new Date()
    });
    await auditLog.save();

    res.json({ message: "Vehicle handover confirmed by staff ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error confirming handover", error: err.message });
  }
};

// Update handover status (Customer / Staff)
const updateHandoverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { handoverStatus, conditionPhotos } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (handoverStatus) {
      booking.handoverStatus = handoverStatus;
    }

    if (req.body.customerHandoverConfirmed === true) {
      booking.customerHandoverConfirmed = true;
    }

    if (req.body.staffHandoverConfirmed === true) {
      booking.staffHandoverConfirmed = true;
    }
    
    if (conditionPhotos && Array.isArray(conditionPhotos)) {
      booking.conditionPhotos = [...(booking.conditionPhotos || []), ...conditionPhotos];
    }

    await booking.save();
    res.json({ message: "Handover status updated ✅", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating handover status", error: err.message });
  }
};

// AFTER
module.exports = {
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
};