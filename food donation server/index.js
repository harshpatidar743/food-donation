require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/", authRoutes);
app.use("/", donationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);
});

// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Donor = require("./models/donor");

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { family: 4, autoIndex: true })
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log(err));

// // Donation Schema
// const donationSchema = new mongoose.Schema({
//     donorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Donor"
//     },
//     foodType: String,
//     quantity: Number,
//     location: String
// });

// const Donation = mongoose.model('Donation', donationSchema);

// // Routes
// app.post('/donate', async (req, res) => {
//     const { donorId, foodType, quantity, location } = req.body;

//     const donation = new Donation({ donorId, foodType, quantity, location });
//     const savedDonation=await donation.save();

//     return res.json(
        
//         { 
//             donation:savedDonation,
//             message: 'Food donation posted successfully!' });
// });

// app.get('/donations', async (req, res) => {
//     const donations = await Donation.find();
//     res.json(donations);
// });

// app.get('/donationsbylocation', async (req, res) => {
//     try {
//       const location = (req.query.location || "").trim();

//       if (!location) {
//         return res.status(400).json({ error: 'Location is required' });
//       }

//       // Find donations by location
//       const donations = await Donation.find({ 
//         location: { $regex: location, $options: 'i' }  // Case-insensitive search
//       });
  
//       res.json({ donations });

//     } catch (error) {
//       res.status(500).json({ error: 'Error fetching donations' });
//     }
//   });
  

// // Server listening
// const PORT = process.env.PORT || 5000; 
// app.listen(PORT, () => { 
//   console.log(`Server running on port ${PORT}`); 
// });

// //Register API
// const crypto = require("crypto");

// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;
//     const token = crypto.randomBytes(32).toString("hex");

//     const donor = new Donor({
//       name,
//       email,
//       password,
//       phone,
//       verificationToken: token
//     });

//     await donor.save();

//     res.json({
//       message: "Donor registered successfully",
//       verificationToken: token
//     });

//   } catch (error) {
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const donor = await Donor.findOne({ email });

//     if (!donor) {
//       return res.status(400).json({ error: "Donor not found" });
//     }

//     if (donor.password !== password) {
//       return res.status(400).json({ error: "Invalid password" });
//     }

//     if (!donor.isVerified) {
//       return res.status(400).json({ error: "Email not verified yet" });
//     }

//     res.json({
//       message: "Login successful",
//       donorId: donor._id
//     });

//   } catch (error) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });


// //My donations API
// app.get("/mydonations/:donorId", async (req, res) => {
//   try {
//     const donations = await Donation.find({
//       donorId: req.params.donorId
//     });

//     res.json(donations);
    
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching donations" });
//   }
// });




