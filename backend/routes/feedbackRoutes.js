const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");

// Submit feedback or complaint (Customer)
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, type, rating, comment } = req.body;
    const customerId = req.user.id;

    if (!bookingId || !type || !comment) {
      return res.status(400).json({ message: "Booking ID, type, and comment are required" });
    }

    if (!["feedback", "complaint"].includes(type)) {
      return res.status(400).json({ message: "Invalid submission type" });
    }

    // Verify booking belongs to customer and is completed
    const booking = await Booking.findOne({ _id: bookingId, customerId });
    if (!booking) {
      return res.status(404).json({ message: "Associated booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only submit feedback or complaints after the rental is completed" });
    }

    const feedback = new Feedback({
      bookingId,
      customerId,
      type,
      rating: type === "feedback" ? Number(rating) || 5 : undefined,
      comment,
      complaintStatus: type === "complaint" ? "Open" : undefined
    });

    await feedback.save();
    res.status(201).json({ message: "Submitted successfully ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error submitting feedback", error: err.message });
  }
});

// Get all feedbacks/complaints (Staff/Admin)
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const list = await Feedback.find()
      .populate("customerId", "name email")
      .populate({
        path: "bookingId",
        populate: { path: "vehicleId", select: "name type" }
      })
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving feedback" });
  }
});

// Get logged-in customer's feedbacks/complaints
router.get("/customer", protect, async (req, res) => {
  try {
    const list = await Feedback.find({ customerId: req.user.id })
      .populate({
        path: "bookingId",
        populate: { path: "vehicleId", select: "name type" }
      })
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving feedback" });
  }
});

// Respond to complaint & update status (Staff/Admin)
router.put("/:id/respond", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { staffResponse, complaintStatus } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (staffResponse !== undefined) {
      feedback.staffResponse = staffResponse;
    }

    if (feedback.type === "complaint" && complaintStatus) {
      if (!["Open", "In Progress", "Resolved", "Closed"].includes(complaintStatus)) {
        return res.status(400).json({ message: "Invalid complaint status" });
      }
      feedback.complaintStatus = complaintStatus;
    }

    await feedback.save();
    res.json({ message: "Response updated successfully ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error updating response" });
  }
});
// Update feedback (Customer)
router.put("/:id", protect, async (req, res) => {
  try {
    const { type, rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Ensure only owner can edit
    if (feedback.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    feedback.type = type || feedback.type;
    feedback.comment = comment || feedback.comment;

    if (type === "feedback") {
      feedback.rating = rating;
    }

    await feedback.save();

    res.json({ message: "Feedback updated ✅", feedback });

  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});
// Delete feedback (Customer)
router.delete("/:id", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await feedback.deleteOne();

    res.json({ message: "Feedback deleted ✅" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
