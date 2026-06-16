// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Renter who owns this vehicle

  vehicleId: { type: String, unique: true }, // ✅ optional custom ID
  
  name: { type: String, required: true },
  type: { type: String, enum: ['car', 'bike', 'van', 'scooter'], required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String }, // URL or path
  description: String,
  isAvailable: { type: Boolean, default: true },
},{ timestamps: true });
  
  

module.exports = mongoose.model("Vehicle", vehicleSchema);