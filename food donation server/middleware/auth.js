const jwt = require("jsonwebtoken");
const Donor = require("../models/donor");
const { jwtSecret } = require("../config/env");

const normalizeAccessRole = (role) =>
  String(role || "").trim().toLowerCase() === "admin" ? "admin" : "user";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      const error = new Error("Authorization token is required");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1]?.trim();

    if (!token) {
      const error = new Error("Authorization token is required");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, jwtSecret);
    const donor = await Donor.findById(decoded.id)
      .select("_id name email role")
      .lean();

    if (!donor) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    req.user = {
      id: donor._id.toString(),
      name: donor.name,
      email: donor.email,
      role: normalizeAccessRole(donor.role)
    };

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Invalid or expired token";
    }

    next(error);
  }
};

module.exports = {
  authenticate,
  protect: authenticate
};
