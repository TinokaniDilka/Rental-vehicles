// controllers/vehicleController.js
const Vehicle = require("../models/Vehicle");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads folder created");
}

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create Vehicle
const createVehicle = async (req, res) => {
  try {
    const renterId = req.user.id;

    const vehicleData = {
      owner: renterId,
      name: req.body.name,
      pricePerDay: req.body.pricePerDay,
      description: req.body.description,
      type: req.body.type || "car",
      location: req.body.location || "Colombo",
      isAvailable: true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      requireVerification: req.body.requireVerification === "true" || req.body.requireVerification === true,
      depositAmount: req.body.depositAmount ? Number(req.body.depositAmount) : undefined
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json({ message: "Vehicle added successfully ✅", vehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving vehicle ❌" });
  }
};

// Update Vehicle
const updateVehicle = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      pricePerDay: req.body.pricePerDay,
      description: req.body.description,
      type: req.body.type,
      location: req.body.location,
    };

    if (req.body.requireVerification !== undefined) {
      updateData.requireVerification = req.body.requireVerification === "true" || req.body.requireVerification === true;
    }

    if (req.body.depositAmount !== undefined) {
      updateData.depositAmount = Number(req.body.depositAmount);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const query = (req.user.role === "admin" || req.user.role === "staff")
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const vehicle = await Vehicle.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle updated ✅", vehicle });
  } catch (err) {
    res.status(500).json({ message: "Error updating vehicle" });
  }
};

// Get all available vehicles (for customer dashboard/public)
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("owner");
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
};

// Get vehicles belonging to the logged-in renter
// AFTER
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).populate("owner");
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching my vehicles:", err);
    res.status(500).json({ message: "Error fetching my vehicles" });
  }
};

// Delete a vehicle owned by the logged-in renter
const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const query = (req.user.role === "admin" || req.user.role === "staff")
      ? { _id: vehicleId }
      : { _id: vehicleId, owner: req.user.id };

    const deletedVehicle = await Vehicle.findOneAndDelete(query);

    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found or unauthorized to delete" });
    }

    res.json({ message: "Vehicle deleted successfully ✅" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res.status(500).json({ message: "Error deleting vehicle" });
  }
};


module.exports = {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getMyVehicles,
  deleteVehicle,
  upload // export multer middleware
};