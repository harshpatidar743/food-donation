const express = require("express");
const router = express.Router();

const { registerDonor, loginDonor } = require("../controllers/authController");
const validate = require("../middleware/validators");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/register", validate(registerSchema), registerDonor);
router.post("/login", validate(loginSchema), loginDonor);

module.exports = router;
