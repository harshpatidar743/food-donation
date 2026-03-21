const donationService = require('../services/donationService');

exports.createDonation = async (req, res) => {
  try {
    const result = await donationService.createDonation(req.body);
    res.json(result);
  } catch (error) {
    throw error;
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await donationService.getAllDonations();
    res.json(donations);
  } catch (error) {
    throw error;
  }
};

exports.getDonationsByLocation = async (req, res) => {
  try {
    const result = await donationService.getDonationsByLocation(req.query.location);
    res.json(result);
  } catch (error) {
    throw error;
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await donationService.getDonationsByUser(req.params.donorId);
    res.json(donations);
  } catch (error) {
    throw error;
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const result = await donationService.deleteDonation(req.params.id);
    res.json(result);
  } catch (error) {
    throw error;
  }
};

