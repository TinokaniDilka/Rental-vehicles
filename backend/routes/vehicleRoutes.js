const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  createVehicle, 
  updateVehicle, 
  getAllVehicles, 
  getMyVehicles, 
  deleteVehicle,
  upload 
} = require("../controllers/vehicleController");
const Vehicle = require("../models/Vehicle");

router.get("/", getAllVehicles);
router.post("/", protect, upload.single("image"), createVehicle);
router.get("/my-vehicles", protect, getMyVehicles);

// GET SINGLE VEHICLE BY ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("owner");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching vehicle" });
  }
});

router.put("/:id", protect, upload.single("image"), updateVehicle);
router.delete("/:id", protect, deleteVehicle);

module.exports = router;
