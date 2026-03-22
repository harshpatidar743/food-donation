const donationService = require('../services/donationService');

exports.createDonation = async (req, res, next) => {
  try {
    const result = await donationService.createDonation({
      ...req.body,
      donorId: req.user.id
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllDonations = async (req, res, next) => {
  try {
    const donations = await donationService.getAllDonations();
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

exports.getDonationsByLocation = async (req, res, next) => {
  try {
    const result = await donationService.getDonationsByLocation(req.query.location);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await donationService.getDonationsByUser(req.user.id);
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

exports.reduceDonationQuantity = async (req, res, next) => {
  try {
    const result = await donationService.reduceDonationQuantity(
      req.params.id,
      req.user.id,
      req.body.takenQuantity
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.markDonationCompleted = async (req, res, next) => {
  try {
    const result = await donationService.markDonationCompleted(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteDonation = async (req, res, next) => {
  try {
    const result = await donationService.deleteDonation(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

