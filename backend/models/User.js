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
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);