const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Promo = require("../models/Promo");
const { logAudit } = require("../utils/auditLogger");

// Validate a promo code (Customer Checkout)
router.get("/validate/:code", protect, async (req, res) => {
  try {
    const promo = await Promo.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true
    });

    if (!promo) {
      return res.status(404).json({ message: "Invalid or expired promo code" });
    }

    res.json({
      success: true,
      code: promo.code,
      discountPercent: promo.discountPercent
    });
  } catch (err) {
    res.status(500).json({ message: "Error validating promo code" });
  }
});


// Admin-only: Get all promos
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching promo codes" });
  }
});

// Admin-only: Create new promo
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { code, discountPercent } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ message: "Code and discount percentage are required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Promo.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    const promo = new Promo({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      isActive: true
    });
    await promo.save();

    await logAudit({
      actor: req.user,
      action: "Promo Code Created",
      targetType: "Promo",
      targetId: promo._id,
      details: `${promo.code} (${promo.discountPercent}% off)`
    });

    res.status(201).json({ message: "Promo code created successfully ✅", promo });
  } catch (err) {
    res.status(500).json({ message: "Error creating promo code" });
  }
});

// Admin-only: Toggle promo code status
router.put("/:id/toggle", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const promo = await Promo.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    promo.isActive = !promo.isActive;
    await promo.save();

    await logAudit({
      actor: req.user,
      action: promo.isActive ? "Promo Code Activated" : "Promo Code Deactivated",
      targetType: "Promo",
      targetId: promo._id,
      details: promo.code
    });

    res.json({ message: `Promo code status toggled to ${promo.isActive} ✅`, promo });
  } catch (err) {
    res.status(500).json({ message: "Error updating promo code status" });
  }
});

module.exports = router;
