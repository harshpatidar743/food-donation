const mongoose = require("mongoose");

const donationImageSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true
    },
    contentType: {
      type: String,
      trim: true
    },
    dataUrl: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor"
    },
    foodType: {
      type: String,
      trim: true
    },
    foodName: {
      type: String,
      trim: true,
      required: true
    },
    foodCategory: {
      type: String,
      enum: ["Veg", "Non-veg"],
      required: true
    },
    quantity: {
      type: Number,
      min: 1,
      required: true
    },
    totalQuantity: {
      type: Number,
      min: 1,
      required: true
    },
    remainingQuantity: {
      type: Number,
      min: 0,
      required: true
    },
    quantityUnit: {
      type: String,
      enum: ["people", "plates"],
      default: "plates"
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active"
    },
    foodPreparedTime: {
      type: Date,
      required: true
    },
    availableUntil: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      trim: true
    },
    fullAddress: {
      type: String,
      trim: true,
      required: true
    },
    pincode: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: String,
      trim: true,
      required: true
    },
    foodImage: {
      type: donationImageSchema,
      default: undefined
    },
    additionalNotes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
