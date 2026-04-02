const express = require("express");

const { getMessages, deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();

router.use("/messages", protect, requireAdmin);
router.get("/messages", getMessages);
router.delete("/messages/:id", deleteMessage);

module.exports = router;
