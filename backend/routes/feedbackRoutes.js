const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

// Submit feedback or complaint (Customer)
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, type, rating, comment, category } = req.body;
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
      category: type === "complaint" ? (category || "Other") : undefined,
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

    let query = {};

    if (req.user.role === "staff") {
      // Only feedback for vehicles owned by this staff member
      const staffVehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = staffVehicles.map(v => v._id);

      const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } }).select("_id");
      const bookingIds = bookings.map(b => b._id);
      query = { bookingId: { $in: bookingIds } };
    }

    const list = await Feedback.find(query)
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

// Get all customer reviews (Public/Customer accessible)
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Feedback.find({ type: "feedback" })
      .populate("customerId", "name")
      .populate({
        path: "bookingId",
        populate: { path: "vehicleId", select: "name type" }
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving reviews", error: err.message });
  }
});

// Get all reviews for a specific vehicle (Public/Customer accessible)
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    // Find all bookings for this vehicle
    const bookings = await Booking.find({ vehicleId }).select("_id");
    const bookingIds = bookings.map(b => b._id);
    
    // Find all feedbacks for those bookings, type must be "feedback"
    const reviews = await Feedback.find({ 
      bookingId: { $in: bookingIds }, 
      type: "feedback" 
    })
    .populate("customerId", "name")
    .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching vehicle reviews", error: err.message });
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

// Escalate complaint to admin (Staff)
router.put("/:id/escalate", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (feedback.type !== "complaint") {
      return res.status(400).json({ message: "Only complaints can be escalated" });
    }

    feedback.escalated = true;
    feedback.complaintStatus = "In Progress";
    await feedback.save();

    res.json({ message: "Complaint escalated to admin ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error escalating complaint", error: err.message });
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

// Add staff reply to feedback (Staff/Admin)
router.post("/:id/staff-reply", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden - only staff can add replies" });
    }

    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (!feedback.staffReplies) {
      feedback.staffReplies = [];
    }

    feedback.staffReplies.push({
      staffId: req.user.id,
      staffName: req.user.name,
      replyText: replyText.trim()
    });

    await feedback.save();
    res.json({ message: "Reply added successfully ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error adding reply", error: err.message });
  }
});

// Update staff reply (Staff/Admin)
router.put("/:id/staff-reply/:replyId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden - only staff can update replies" });
    }

    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const reply = feedback.staffReplies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Only the staff member who created the reply can edit it (or admin)
    if (reply.staffId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this reply" });
    }

    reply.replyText = replyText.trim();
    reply.updatedAt = Date.now();

    await feedback.save();
    res.json({ message: "Reply updated successfully ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error updating reply", error: err.message });
  }
});

// Delete staff reply (Staff/Admin)
router.delete("/:id/staff-reply/:replyId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden - only staff can delete replies" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const reply = feedback.staffReplies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Only the staff member who created the reply can delete it (or admin)
    if (reply.staffId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this reply" });
    }

    feedback.staffReplies.id(req.params.replyId).deleteOne();
    await feedback.save();

    res.json({ message: "Reply deleted successfully ✅", feedback });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reply", error: err.message });
  }
});

module.exports = router;
