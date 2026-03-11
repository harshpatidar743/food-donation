const Donation = require("../models/donation");

exports.createDonation = async (req, res) => {
  const { donorId, foodType, quantity, location } = req.body;

  const donation = new Donation({
    donorId,
    foodType,
    quantity,
    location
  });

  const savedDonation = await donation.save();

  res.json({
    donation: savedDonation,
    message: "Food donation posted successfully!"
  });
};

exports.getAllDonations = async (req, res) => {
  const donations = await Donation.find().populate("donorId", "name");
  res.json(donations);
};

exports.getDonationsByLocation = async (req, res) => {
  try {
    const location = (req.query.location || "").trim();

    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    const donations = await Donation.find({
      location: { $regex: location, $options: "i" }
    }).populate("donorId", "name");

    res.json({ donations });

  } catch (error) {
    res.status(500).json({ error: "Error fetching donations" });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      donorId: req.params.donorId
    });

    res.json(donations);

  } catch (error) {
    res.status(500).json({ error: "Error fetching donations" });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: "Error deleting donation" });

  }
};