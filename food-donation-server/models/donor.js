const mongoose = require("mongoose");

const normalizeAccessRole = (value) =>
  String(value || "").trim().toLowerCase() === "admin" ? "admin" : "user";

const requiresGeoLocation = function () {
  return this.userType === "organization" || this.userType === "business/restaurant";
};

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
    trim: true,
    required: function () {
      return requiresGeoLocation.call(this);
    }
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: function () {
        return requiresGeoLocation.call(this);
      },
      validate: {
        validator: (value) =>
          !value ||
          (Array.isArray(value) &&
            value.length === 2 &&
            value.every((coordinate) => Number.isFinite(coordinate))),
        message: "Location coordinates must include valid longitude and latitude values"
      }
    }
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

donorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donor", donorSchema);
