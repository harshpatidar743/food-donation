const express = require("express");
const router = express.Router();

const {
  createDonation,
  getAllDonations,
  getDonationsByLocation,
  getMyDonations,
  deleteDonation
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validators");
const { createDonationSchema } = require("../validators/donationValidator");

// Public routes
router.get("/donations", getAllDonations);
router.get("/donationsbylocation", getDonationsByLocation);

// Protected routes
router.post("/donate", protect, validate(createDonationSchema), createDonation);
router.get("/mydonations/:donorId", protect, getMyDonations);
router.delete("/donation/:id", protect, deleteDonation);

module.exports = router;

