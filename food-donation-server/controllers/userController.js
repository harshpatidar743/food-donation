const Donor = require("../models/donor");

const PROFILE_FIELDS =
  "_id name email phone userType address location description profileImage operatingHours";

const formatProfileResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  userType: user.userType,
  address: user.address || "",
  location: user.location,
  description: user.description || "",
  profileImage: user.profileImage || "",
  operatingHours: user.operatingHours || ""
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await Donor.findById(req.user.id).select(PROFILE_FIELDS).lean();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.json(formatProfileResponse(user));
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      "name",
      "phone",
      "address",
      "location",
      "description",
      "profileImage",
      "operatingHours",
    ]; // User explicitly requested not to use pickupInstructions for now

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await Donor.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(PROFILE_FIELDS);

    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      message: "Profile updated successfully",
      user: formatProfileResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
