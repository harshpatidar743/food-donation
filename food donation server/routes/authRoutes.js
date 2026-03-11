const express = require("express");
const router = express.Router();

const { registerDonor, loginDonor } = require("../controllers/authController");

router.post("/register", registerDonor);
router.post("/login", loginDonor);

module.exports = router;