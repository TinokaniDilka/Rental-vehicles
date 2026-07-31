const User = require("../models/User");
const { logAudit } = require("../utils/auditLogger");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/mailer");

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact administration." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        profilePhoto: user.profilePhoto,
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
    const filter = {};

    if (req.query.verificationStatus) {
      filter.role = "customer";
      filter.verificationStatus = req.query.verificationStatus;
    }

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const finalRole = ["staff", "admin"].includes(role) ? role : "staff";

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newStaff = new User({
      name,
      email: trimmedEmail,
      password,
      role: finalRole,
      isActive: true
    });
    await newStaff.save();

    await logAudit({
      actor: req.user,
      action: finalRole === "admin" ? "Admin Registered" : "Staff Registered",
      targetType: "User",
      targetId: newStaff._id,
      details: `${newStaff.name} (${newStaff.email})`
    });

    res.status(201).json({
      message: `${finalRole.charAt(0).toUpperCase() + finalRole.slice(1)} account created successfully ✅`,
      user: newStaff
    });
  } catch (err) {
    res.status(500).json({ message: "Error registering account", error: err.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      actor: req.user,
      action: user.isActive ? "User Activated" : "User Deactivated",
      targetType: "User",
      targetId: user._id,
      details: `${user.name} (${user.email})`
    });

    res.json({ message: `User active status toggled to ${user.isActive} ✅`, user });
  } catch (err) {
    res.status(500).json({ message: "Error toggling user status" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password, phone, nicNumber, drivingLicenseNumber, idPhoto, licensePhoto } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email.trim().toLowerCase();
    if (password) user.password = password;
    if (phone !== undefined) user.phone = phone.trim();
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
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
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

// Upload profile photo / ID / License photo documents (multipart form data)
const uploadVerificationDocs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const idPhotoFile = req.files?.idPhoto?.[0];
    const licensePhotoFile = req.files?.licensePhoto?.[0];

    if (!profilePhotoFile && !idPhotoFile && !licensePhotoFile) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    if (profilePhotoFile) {
      user.profilePhoto = `/uploads/profile/${profilePhotoFile.filename}`;
    }
    if (idPhotoFile) {
      user.idPhoto = `/uploads/verification/${idPhotoFile.filename}`;
    }
    if (licensePhotoFile) {
      user.licensePhoto = `/uploads/verification/${licensePhotoFile.filename}`;
    }

    if (idPhotoFile || licensePhotoFile) {
      user.verificationStatus = "Pending Review";
    }

    await user.save();

    res.json({
      message: "Uploaded successfully ✅",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
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

    if (verificationStatus === "Verified" || verificationStatus === "Not Verified") {
      await logAudit({
        actor: req.user,
        action: verificationStatus === "Verified" ? "ID Verification Approved" : "ID Verification Rejected",
        targetType: "User",
        targetId: user._id,
        details: `${user.name} (${user.email})`
      });
    }

    res.json({ message: `Verification status updated to ${verificationStatus} ✅`, user });
  } catch (err) {
    res.status(500).json({ message: "Error updating verification status", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "Deactivate this user before deleting them" });
    }

    const { name, email } = user;
    await User.findByIdAndDelete(id);

    await logAudit({
      actor: req.user,
      action: "User Deleted",
      targetType: "User",
      targetId: id,
      details: `${name} (${email})`
    });

    res.json({ message: "User deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    let { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ message: "Email or phone number is required" });
    emailOrPhone = emailOrPhone.trim();

    const genericResponse = { message: "If that account exists, a reset code has been sent to the registered email." };

    // Determine if the input looks like an email or a phone number
    const isEmail = emailOrPhone.includes("@");
    let user;
    if (isEmail) {
      user = await User.findOne({ email: emailOrPhone.toLowerCase() });
    } else {
      // Normalize phone: strip spaces/dashes for comparison
      const normalizedPhone = emailOrPhone.replace(/[\s\-().]/g, "");
      user = await User.findOne({
        $or: [
          { phone: normalizedPhone },
          { phone: emailOrPhone }
        ]
      });
    }

    if (!user) {
      return res.json(genericResponse);
    }

    if (!user.email) {
      return res.json(genericResponse);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }

    // Return the email (partially masked) so the UI can show confirmation
    const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);
    res.json({ ...genericResponse, maskedEmail, resolvedEmail: user.email });
  } catch (err) {
    res.status(500).json({ message: "Error processing request", error: err.message });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and code are required" });
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    if (user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Incorrect code" });
    }

    res.json({ message: "Code verified ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying code", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    if (user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Incorrect code" });
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully ✅. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

module.exports = {
  loginUser,
  getAllUsers,
  registerStaff,
  toggleUserActive,
  updateProfile,
  uploadVerificationDocs,
  updateVerificationStatus,
  deleteUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};