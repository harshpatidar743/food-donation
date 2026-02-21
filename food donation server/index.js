const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { family: 4, autoIndex: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Donation Schema
const donationSchema = new mongoose.Schema({
    donorName: String,
    foodType: String,
    quantity: Number,
    location: String
});

const Donation = mongoose.model('Donation', donationSchema);

// Routes
app.post('/donate', async (req, res) => {
    const { donorName, foodType, quantity, location } = req.body;

    const donation = new Donation({ donorName, foodType, quantity, location });
    const savedDonation=await donation.save();

    return res.json(
        
        { 
            donation:savedDonation,
            message: 'Food donation posted successfully!' });
});

app.get('/donations', async (req, res) => {
    const donations = await Donation.find();
    res.json(donations);
});

app.get('/donationsbylocation', async (req, res) => {
    try {
      const { location } = req.query; // Use req.query for GET requests
  
      // Find donations by location
      const donations = await Donation.find({ location: location });
  
      // Respond with the data
      return res.status(200).json({
        message: "Successfully sent the data",
        donations,
      });
    } catch (error) {
      // Handle the error
      return res.status(500).json({
        error: "Error while getting donations by location",
      });
    }
  });
  

// Server listening
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
});







