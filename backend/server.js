require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`\n=== INCOMING REQUEST [${new Date().toLocaleTimeString()}] ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`=== RESPONSE [${res.statusCode}] ===`);
    console.log('Body:', body);
    return originalSend.apply(res, arguments);
  };
  next();
});

app.use("/uploads", express.static("uploads"));
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const promoRoutes = require("./routes/promoRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  dbName: "vehicle_rental", // ✅ FORCE correct DB
})
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log(err));

// ✅ START SERVER
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on http://0.0.0.0:5000 ✅");
});