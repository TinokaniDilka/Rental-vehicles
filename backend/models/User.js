// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  phone: {
    type: String,
    default: "",
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['customer', 'staff', 'admin'], 
    default: 'customer' 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePhoto: {
    type: String,
    default: ""
  },
  nicNumber: {
    type: String,
    default: ""
  },
  drivingLicenseNumber: {
    type: String,
    default: ""
  },
  idPhoto: {
    type: String,
    default: ""
  },
  licensePhoto: {
    type: String,
    default: ""
  },
  verificationStatus: {
    type: String,
    enum: ['Not Verified', 'Pending Review', 'Verified'],
    default: 'Not Verified'
  },
  resetPasswordOtp: {
    type: String,
    default: null
  },
  resetPasswordOtpExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);