const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getAdminDonations,
  deleteDonationAsAdmin
} = require("../controllers/donationController");
const { authenticate } = require("../middleware/auth");
const { authorizeAdmin } = require("../middleware/admin");

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/donations", getAdminDonations);
router.delete("/donations/:id", deleteDonationAsAdmin);

module.exports = router;
