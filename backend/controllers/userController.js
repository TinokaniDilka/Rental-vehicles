const User = require("../models/User");

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Emails are stored trimmed + lowercased (see /register and the
    // schema's `lowercase: true`). The lookup must normalize the same
    // way, or a login with different casing/whitespace silently fails
    // to match and returns "Invalid email or password".
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check account status
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact administration." });
    }

    // Plain text comparison
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Token
    const token = require("jsonwebtoken").sign(
      { id: user._id }, 
      process.env.JWT_SECRET || "mysecretkey123456789", 
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        nicNumber: user.nicNumber,
        drivingLicenseNumber: user.drivingLicenseNumber,
        idPhoto: user.idPhoto,
        licensePhoto: user.licensePhoto,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin User Management methods
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newStaff = new User({
      name,
      email: trimmedEmail,
      password,
      role: "staff",
      isActive: true
    });
    await newStaff.save();

    res.status(201).json({ message: "Staff account created successfully ✅", user: newStaff });
  } catch (err) {
    res.status(500).json({ message: "Error registering staff", error: err.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow toggling self (prevent lockouts)
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User active status toggled to ${user.isActive} ✅`, user });
  } catch (err) {
    res.status(500).json({ message: "Error toggling user status" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password, nicNumber, drivingLicenseNumber, idPhoto, licensePhoto } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email.trim().toLowerCase();
    if (password) user.password = password;
    if (nicNumber !== undefined) user.nicNumber = nicNumber;
    if (drivingLicenseNumber !== undefined) user.drivingLicenseNumber = drivingLicenseNumber;
    if (idPhoto) user.idPhoto = idPhoto;
    if (licensePhoto) user.licensePhoto = licensePhoto;

    if ((nicNumber || drivingLicenseNumber) && user.verificationStatus === 'Not Verified') {
        user.verificationStatus = 'Pending Review';
    }

    await user.save();
    res.json({
      message: "Profile updated successfully ✅",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nicNumber: user.nicNumber,
        drivingLicenseNumber: user.drivingLicenseNumber,
        idPhoto: user.idPhoto,
        licensePhoto: user.licensePhoto,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

// Upload ID / License photo documents (multipart form data)
const uploadVerificationDocs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const idPhotoFile = req.files?.idPhoto?.[0];
    const licensePhotoFile = req.files?.licensePhoto?.[0];

    if (!idPhotoFile && !licensePhotoFile) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    if (idPhotoFile) {
      user.idPhoto = `/uploads/verification/${idPhotoFile.filename}`;
    }
    if (licensePhotoFile) {
      user.licensePhoto = `/uploads/verification/${licensePhotoFile.filename}`;
    }

    // Any new document submission requires a fresh admin review
    user.verificationStatus = "Pending Review";

    await user.save();

    res.json({
      message: "Documents uploaded successfully ✅. Your account is now Pending Review.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nicNumber: user.nicNumber,
        drivingLicenseNumber: user.drivingLicenseNumber,
        idPhoto: user.idPhoto,
        licensePhoto: user.licensePhoto,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error uploading documents", error: err.message });
  }
};

const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!["Verified", "Not Verified", "Pending Review"].includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationStatus = verificationStatus;
    await user.save();

    res.json({ message: `Verification status updated to ${verificationStatus} ✅`, user });
  } catch (err) {
    res.status(500).json({ message: "Error updating verification status", error: err.message });
  }
};

module.exports = {
  loginUser,
  getAllUsers,
  registerStaff,
  toggleUserActive,
  updateProfile,
  uploadVerificationDocs,
  updateVerificationStatus
};