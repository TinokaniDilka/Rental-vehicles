const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");

// Create pending booking
const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, hasDriver } = req.body;
    const customerId = req.user.id;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
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

    const booking = new Booking({
      vehicleId,
      customerId,
      startDate,
      endDate,
      hasDriver,
      status: "pending"
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
      .populate("vehicleId")
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
        .populate("vehicleId")
        .populate("customerId")
        .sort({ createdAt: -1 });
    } else {
      // Staff only sees bookings for vehicles they own
      const staffVehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = staffVehicles.map(v => v._id);

      bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
        .populate("vehicleId")
        .populate("customerId")
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

    // Update booking status
    booking.paymentMethod = paymentMethod;
    booking.status = "confirmed";
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
    const { vehicleId, startDate, endDate, hasDriver, paymentMethod, amount, promoCode } = req.body;
    const customerId = req.user.id;

    if (!vehicleId || !startDate || !endDate || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
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
      hasDriver,
      status: "confirmed",
      paymentMethod,
      baseCharge,
      driverCharge,
      totalAmount
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
// AFTER
module.exports = {
  createBooking,
  getCustomerBookings,
  getAllBookings,
  reviewBooking,
  payBooking,
  pickupBooking,
  returnBooking,
  createBookingWithPayment
};
