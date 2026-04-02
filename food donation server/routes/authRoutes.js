const express = require("express");
const router = express.Router();

const { registerDonor, loginDonor } = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validators");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/register", validate(registerSchema), registerDonor);
router.post("/login", loginLimiter, validate(loginSchema), loginDonor);

module.exports = router;
