const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validators");
const { updateProfileSchema } = require("../validators/userValidator");

router.get("/profile", authenticate, userController.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
