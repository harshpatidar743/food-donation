const Donation = require('../models/donation');

exports.createDonation = async (data) => {
  const donation = new Donation(data);
  const savedDonation = await donation.save();
  return {
    donation: savedDonation,
    message: 'Food donation posted successfully!'
  };
};

exports.getAllDonations = async () => {
  return await Donation.find().populate('donorId', 'name');
};

exports.getDonationsByLocation = async (location) => {
  if (!location?.trim()) {
    const error = new Error('Location is required');
    error.statusCode = 400;
    throw error;
  }
  return await Donation.find({
    location: { $regex: location.trim(), $options: 'i' }
  }).populate('donorId', 'name');
};

exports.getDonationsByUser = async (userId) => {
  return await Donation.find({ donorId: userId });
};

exports.deleteDonation = async (id) => {
  const deleted = await Donation.findByIdAndDelete(id);
  if (!deleted) {
    const error = new Error('Donation not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Donation deleted successfully' };
};
