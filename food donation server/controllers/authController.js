const Donor = require("../models/donor");
const crypto = require("crypto");

const ROLE_MAP = {
  admin: "admin",
  individual: "individual",
  organization: "organization",
  ngo: "organization",
  business: "business/restaurant",
  restaurant: "business/restaurant",
  "business/restaurant": "business/restaurant"
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const normalizeRole = (value) => ROLE_MAP[normalizeText(value).toLowerCase()];

const getRegistrationRole = (value) => {
  return normalizeRole(value) || "individual";
};

const getStoredRole = (donor) => normalizeRole(donor.role) || normalizeRole(donor.userType) || "individual";

exports.registerDonor = async (req, res) => {
  try {
    const { name, email, password, phone, userType, accountType, role } = req.body;
    const normalizedName = normalizeText(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizeText(phone);

    if (!normalizedName || !normalizedEmail || !password || !normalizedPhone) {
      return res.status(400).json({ error: "Name, email, password, and phone are required" });
    }

    const existingDonor = await Donor.findOne({ email: normalizedEmail });

    if (existingDonor) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const assignedRole = getRegistrationRole(accountType || role || userType);

    const donor = new Donor({
      name: normalizedName,
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      role: assignedRole,
      isVerified: true, // Auto-verify for now
      verificationToken: token
    });

    await donor.save();

    res.status(201).json({
      message: "Donor registered successfully",
      verificationToken: token,
      donor: {
        donorId: donor._id,
        name: donor.name,
        email: donor.email,
        role: donor.role
      }
    });

  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const donor = await Donor.findOne({ email: normalizedEmail });

    if (!donor) {
      return res.status(400).json({ error: "Donor not found" });
    }

    if (donor.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (!donor.isVerified) {
      return res.status(400).json({ error: "Email not verified yet" });
    }

    const role = getStoredRole(donor);

    if (donor.role !== role) {
      donor.role = role;
      await donor.save();
    }

    res.json({
      message: "Login successful",
      donorId: donor._id,
      name: donor.name,
      role
    });

  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
