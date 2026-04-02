const mongoose = require("mongoose");

const normalizeAccessRole = (value) =>
  String(value || "").trim().toLowerCase() === "admin" ? "admin" : "user";

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
    index: true,
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
    type: String,
    enum: ["individual", "organization", "business/restaurant"],
    default: "individual"
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    set: (value) => (String(value || "").trim().toLowerCase() === "admin" ? "admin" : "user")
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: {
    type: String
  }

}, { timestamps: true });

donorSchema.pre("validate", function (next) {
  this.role = normalizeAccessRole(this.role);
  next();
});

module.exports = mongoose.model("Donor", donorSchema);
