const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const {
  loginUser,
  getAllUsers,
  registerStaff,
  toggleUserActive,
  updateProfile
} = require("../controllers/userController");

// Public routes
router.post("/login", loginUser);

// Register user - Only Staff Registration (No Renters/Customers)
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Force role to "staff" - No renter or customer allowed
    role = "staff";

    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const newUser = new User({ 
      name: name || email.split("@")[0], 
      email, 
      password, 
      role: "staff",        // Fixed to staff only
      isActive: true
    });

    await newUser.save();

    res.status(201).json({
      message: "Staff account registered successfully ✅",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ 
      message: "Registration failed", 
      error: err.message 
    });
  }
});

// Protected profile route
router.put("/profile", protect, updateProfile);

// Admin-only user management routes
router.get("/users", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}, getAllUsers);

router.post("/staff", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}, registerStaff);

router.put("/users/:id/toggle-active", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}, toggleUserActive);
// ===================== TEMPORARY CLEANUP ROUTE =====================
router.delete("/cleanup-renters", async (req, res) => {
  try {
    const result = await User.deleteMany({ role: "renter" });
    res.json({ 
      success: true,
      message: "✅ All renter accounts removed successfully!",
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ message: "Cleanup failed", error: err.message });
  }
});
// =================================================================
module.exports = router;