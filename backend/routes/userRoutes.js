const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const {
  loginUser,
  getAllUsers,
  registerStaff,
  toggleUserActive,
  updateProfile,
  updateVerificationStatus,
  uploadVerificationDocs,
  deleteUser
} = require("../controllers/userController");

// ===================== ID VERIFICATION FILE UPLOAD CONFIG =====================
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const verificationUploadDir = path.join(__dirname, "..", "uploads", "verification");
if (!fs.existsSync(verificationUploadDir)) {
  fs.mkdirSync(verificationUploadDir, { recursive: true });
}

const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, verificationUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const userId = req.user?.id || "unknown";
    cb(null, `${file.fieldname}-${userId}-${Date.now()}${ext}`);
  }
});

const verificationFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for ID/License photos"), false);
  }
};

const uploadVerificationFiles = multer({
  storage: verificationStorage,
  fileFilter: verificationFileFilter,
  limits: { fileSize: MAX_UPLOAD_SIZE }
});

// Public routes
router.post("/login", loginUser);

// Register user - Staff or Customer Registration
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Default role to "customer" if not specified or invalid. Allow "customer" or "staff".
    if (!role || !["customer", "staff"].includes(role)) {
      role = "customer";
    }

    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const newUser = new User({ 
      name: name || email.split("@")[0], 
      email, 
      password, 
      role,
      isActive: true
    });

    await newUser.save();

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account registered successfully ✅`,
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

// ID Verification document upload (multipart/form-data: idPhoto, licensePhoto)
router.put("/profile/upload-docs", protect, (req, res, next) => {
  const handler = uploadVerificationFiles.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "licensePhoto", maxCount: 1 }
  ]);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size exceeds the 5MB limit" });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, uploadVerificationDocs);

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});
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

router.put("/users/:id/verify", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}, updateVerificationStatus);

router.delete("/users/:id", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
}, deleteUser);

module.exports = router;