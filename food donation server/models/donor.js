const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Donor", donorSchema);