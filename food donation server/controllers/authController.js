const Donor = require("../models/donor");
const crypto = require("crypto");

exports.registerDonor = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    const donor = new Donor({
      name,
      email,
      password,
      phone,
      verificationToken: token
    });

    await donor.save();

    res.json({
      message: "Donor registered successfully",
      verificationToken: token
    });

  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(400).json({ error: "Donor not found" });
    }

    if (donor.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (!donor.isVerified) {
      return res.status(400).json({ error: "Email not verified yet" });
    }

    res.json({
      message: "Login successful",
      donorId: donor._id
    });

  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};