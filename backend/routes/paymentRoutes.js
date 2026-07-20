const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



// Create Stripe Payment Intent

router.post("/create-payment-intent", protect, async (req, res) => {

  try {

    const { amount } = req.body;



    if (!amount || amount <= 0) {

      return res.status(400).json({ message: "Invalid amount" });

    }



    // Create a PaymentIntent with the order amount and currency

    const paymentIntent = await stripe.paymentIntents.create({

      amount: Math.round(amount * 100), // Stripe expects amount in cents

      currency: "usd",

      automatic_payment_methods: {

        enabled: true,

      },

    });



    res.json({

      clientSecret: paymentIntent.client_secret,

      paymentIntentId: paymentIntent.id,

    });

  } catch (err) {

    console.error("Stripe Payment Intent Error:", err);

    res.status(500).json({ message: "Failed to create payment intent", error: err.message });

  }

});



module.exports = router;