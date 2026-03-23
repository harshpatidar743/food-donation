const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  city: {
    type: String,
    trim: true
  },

  organizationName: {
    type: String,
    trim: true
  },

  registrationNumber: {
    type: String,
    trim: true
  },

  organizationAddress: {
    type: String,
    trim: true
  },

  organizationCertificateName: {
    type: String,
    trim: true
  },

  businessName: {
    type: String,
    trim: true
  },

  businessType: {
    type: String,
    trim: true
  },

  ownerName: {
    type: String,
    trim: true
  },

  businessAddress: {
    type: String,
    trim: true
  },

  gstNumber: {
    type: String,
    trim: true
  },

  userType: {
    type: String
  },

  role: {
    type: String,
    enum: ["admin", "individual", "organization", "business/restaurant"],
    default: "individual"
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
