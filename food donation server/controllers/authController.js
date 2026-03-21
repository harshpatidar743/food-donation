const authService = require('../services/authService');

exports.registerDonor = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    throw error; // Handled by errorMiddleware
  }
};

exports.loginDonor = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    throw error;
  }
};

