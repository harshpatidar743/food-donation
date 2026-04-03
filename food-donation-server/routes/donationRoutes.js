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

const { authenticate } = require("../middleware/auth");
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
router.post("/donate", authenticate, validate(createDonationSchema), createDonation);
router.get("/mydonations/:donorId", authenticate, getMyDonations);
router.patch(
  "/donation/:id/reduce",
  authenticate,
  validate(reduceDonationQuantitySchema),
  reduceDonationQuantity
);
router.patch("/donation/:id/complete", authenticate, markDonationCompleted);
router.delete("/donation/:id", authenticate, deleteDonation);

module.exports = router;


