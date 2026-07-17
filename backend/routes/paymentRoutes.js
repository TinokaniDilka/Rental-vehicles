const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Create Payment Intent (mock for now, can be replaced with real Stripe)
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Mock payment intent for testing without real Stripe keys
    // When you have real Stripe keys, uncomment the Stripe code below
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;

  

    res.json({
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    });
  } catch (err) {
    console.error("Payment Intent Error:", err);
    res.status(500).json({ message: "Failed to create payment intent", error: err.message });
  }
});

module.exports = router;