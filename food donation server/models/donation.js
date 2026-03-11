const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donor"
  },
  foodType: String,
  quantity: Number,
  location: String
});

module.exports = mongoose.model("Donation", donationSchema);