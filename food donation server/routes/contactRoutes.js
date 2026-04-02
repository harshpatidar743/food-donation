const express = require("express");

const { submitContactMessage } = require("../controllers/contactController");
const validate = require("../middleware/validators");
const { contactSchema } = require("../validators/contactValidator");

const router = express.Router();

router.post("/contact", validate(contactSchema), submitContactMessage);

module.exports = router;
