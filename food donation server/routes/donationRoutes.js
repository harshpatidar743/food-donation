const express = require("express");
const router = express.Router();

const {
  createDonation,
  getAllDonations,
  getPublicDonationById,
  getDonationsByLocation,
  getMyDonations,
  deleteDonation,
  reduceDonationQuantity,
  markDonationCompleted
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validators");
const {
  createDonationSchema,
  reduceDonationQuantitySchema
} = require("../validators/donationValidator");

// Public routes
router.get("/donations", getAllDonations);
router.get("/donation/:id", getPublicDonationById);
router.get("/donationsbylocation", getDonationsByLocation);

// Protected routes
router.post("/donate", protect, validate(createDonationSchema), createDonation);
router.get("/mydonations/:donorId", protect, getMyDonations);
router.patch(
  "/donation/:id/reduce",
  protect,
  validate(reduceDonationQuantitySchema),
  reduceDonationQuantity
);
router.patch("/donation/:id/complete", protect, markDonationCompleted);
router.delete("/donation/:id", protect, deleteDonation);

module.exports = router;

