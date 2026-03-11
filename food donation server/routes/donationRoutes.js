const express = require("express");
const router = express.Router();

const {
  createDonation,
  getAllDonations,
  getDonationsByLocation,
  getMyDonations,
  deleteDonation
} = require("../controllers/donationController");

router.post("/donate", createDonation);
router.get("/donations", getAllDonations);
router.get("/donationsbylocation", getDonationsByLocation);
router.get("/mydonations/:donorId", getMyDonations);
router.delete("/donation/:id", deleteDonation);

module.exports = router;