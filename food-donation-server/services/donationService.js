const Donation = require("../models/donation");
const Donor = require("../models/donor");
const { Types } = require("mongoose");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const titleCaseSmallWords = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with"
]);

const formatWord = (word, index) => {
  if (!word) {
    return word;
  }

  if (/^[0-9]+$/.test(word)) {
    return word;
  }

  if (/^[A-Z0-9]{2,4}$/.test(word)) {
    return word;
  }

  const lowerCasedWord = word.toLowerCase();

  if (index > 0 && titleCaseSmallWords.has(lowerCasedWord)) {
    return lowerCasedWord;
  }

  return lowerCasedWord.charAt(0).toUpperCase() + lowerCasedWord.slice(1);
};

const normalizeChunk = (chunk, index) =>
  chunk
    .split("-")
    .map((piece, pieceIndex) => formatWord(piece, index + pieceIndex))
    .join("-");

const normalizeText = (value) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((chunk, index) => normalizeChunk(chunk, index))
    .join(" ");
};

const getUniqueLocationParts = (...values) => {
  const seenValues = new Set();

  return values.reduce((parts, value) => {
    const cleanedValue = value?.trim();

    if (!cleanedValue) {
      return parts;
    }

    const normalizedValue = cleanedValue.toLowerCase();

    if (seenValues.has(normalizedValue)) {
      return parts;
    }

    seenValues.add(normalizedValue);
    parts.push(cleanedValue);
    return parts;
  }, []);
};

const buildLocationLabel = ({ area, city, state, pincode }) => {
  const placeLabel = getUniqueLocationParts(area, city, state).join(", ");
  const trimmedPincode = pincode?.trim() || "";

  if (placeLabel && trimmedPincode) {
    return `${placeLabel} - ${trimmedPincode}`;
  }

  return placeLabel || trimmedPincode;
};

const syncDonationStatuses = async () => {
  const now = new Date();

  await Donation.updateMany(
    {
      $expr: {
        $lte: [{ $ifNull: ["$remainingQuantity", "$quantity"] }, 0]
      },
      status: { $ne: "completed" }
    },
    [
      {
        $set: {
          totalQuantity: { $ifNull: ["$totalQuantity", "$quantity"] },
          remainingQuantity: 0,
          quantity: 0,
          status: "completed"
        }
      }
    ]
  );

  await Donation.updateMany(
    {
      availableUntil: { $lte: now },
      status: { $ne: "completed" }
    },
    [
      {
        $set: {
          totalQuantity: { $ifNull: ["$totalQuantity", "$quantity"] },
          remainingQuantity: { $ifNull: ["$remainingQuantity", "$quantity"] },
          status: "expired"
        }
      }
    ]
  );
};

const activeDonationFilter = () => ({
  $and: [
    {
      $or: [{ status: { $exists: false } }, { status: "active" }]
    },
    {
      availableUntil: { $gt: new Date() }
    },
    {
      $expr: {
        $gt: [{ $ifNull: ["$remainingQuantity", "$quantity"] }, 0]
      }
    }
  ]
});

exports.createDonation = async (data) => {
  const normalizedQuantity = Number(data.quantity);
  const area = normalizeText(data.area);
  const city = normalizeText(data.city);
  const state = normalizeText(data.state);
  const pincode = data.pincode?.trim() || undefined;
  const locationLabel = normalizeText(
    data.location || buildLocationLabel({ area, city, state, pincode })
  );
  const normalizedDonation = {
    ...data,
    foodName: normalizeText(data.foodName),
    foodType: normalizeText(data.foodName),
    fullAddress: normalizeText(data.fullAddress),
    location: locationLabel || normalizeText(data.fullAddress),
    lat: typeof data.lat === "number" ? data.lat : undefined,
    lng: typeof data.lng === "number" ? data.lng : undefined,
    area: area || undefined,
    city: city || undefined,
    state: state || undefined,
    quantity: normalizedQuantity,
    totalQuantity: normalizedQuantity,
    remainingQuantity: normalizedQuantity,
    quantityUnit: data.quantityUnit || "plates",
    status: "active",
    pincode,
    contactNumber: data.contactNumber?.trim(),
    additionalNotes: data.additionalNotes?.trim() || undefined,
    foodImage: data.foodImage?.dataUrl ? data.foodImage : undefined
  };

  const donation = new Donation(normalizedDonation);
  const savedDonation = await donation.save();

  return {
    donation: savedDonation,
    message: "FoodMatch posted successfully!"
  };
};

exports.getAllDonations = async () => {
  await syncDonationStatuses();

  return await Donation.find(activeDonationFilter())
    .populate("donorId", "name")
    .sort({ availableUntil: 1, createdAt: -1 });
};

exports.getPublicDonationById = async (id) => {
  await syncDonationStatuses();

  if (!Types.ObjectId.isValid(id)) {
    const error = new Error("Donation not found");
    error.statusCode = 404;
    throw error;
  }

  const donation = await Donation.findOne({
    _id: id,
    ...activeDonationFilter()
  }).populate("donorId", "name");

  if (!donation) {
    const error = new Error("Donation not found");
    error.statusCode = 404;
    throw error;
  }

  return donation;
};

exports.getDonationsByLocation = async (location) => {
  await syncDonationStatuses();

  if (!location?.trim()) {
    const error = new Error("Location is required");
    error.statusCode = 400;
    throw error;
  }

  const searchValue = escapeRegex(location.trim());
  const searchPattern = new RegExp(searchValue, "i");

  return await Donation.find({
    $and: [
      activeDonationFilter(),
      {
        $or: [
          { fullAddress: { $regex: searchPattern } },
          { location: { $regex: searchPattern } },
          { area: { $regex: searchPattern } },
          { city: { $regex: searchPattern } },
          { state: { $regex: searchPattern } },
          { pincode: { $regex: searchPattern } }
        ]
      }
    ]
  })
    .populate("donorId", "name")
    .sort({ availableUntil: 1, createdAt: -1 });
};

exports.getDonationsByUser = async (userId) => {
  await syncDonationStatuses();

  return await Donation.find({ donorId: userId }).sort({ createdAt: -1 });
};

exports.reduceDonationQuantity = async (id, userId, takenQuantity) => {
  const quantityToReduce = Number(takenQuantity);
  const now = new Date();

  const updatedDonation = await Donation.findOneAndUpdate(
    {
      _id: id,
      donorId: userId,
      $or: [{ status: { $exists: false } }, { status: "active" }],
      $expr: {
        $and: [
          { $gt: ["$availableUntil", now] },
          {
            $gte: [{ $ifNull: ["$remainingQuantity", "$quantity"] }, quantityToReduce]
          }
        ]
      }
    },
    [
      {
        $set: {
          totalQuantity: { $ifNull: ["$totalQuantity", "$quantity"] },
          remainingQuantity: {
            $subtract: [{ $ifNull: ["$remainingQuantity", "$quantity"] }, quantityToReduce]
          }
        }
      },
      {
        $set: {
          quantity: "$remainingQuantity",
          status: {
            $cond: [{ $lte: ["$remainingQuantity", 0] }, "completed", "active"]
          }
        }
      }
    ],
    { new: true }
  );

  if (!updatedDonation) {
    const error = new Error("Unable to reduce quantity. Check remaining stock or donation status.");
    error.statusCode = 400;
    throw error;
  }

  return {
    donation: updatedDonation,
    message: "Remaining quantity updated successfully."
  };
};

exports.markDonationCompleted = async (id, userId) => {
  const updatedDonation = await Donation.findOneAndUpdate(
    {
      _id: id,
      donorId: userId
    },
    [
      {
        $set: {
          totalQuantity: { $ifNull: ["$totalQuantity", "$quantity"] },
          remainingQuantity: 0,
          quantity: 0,
          status: "completed"
        }
      }
    ],
    { new: true }
  );

  if (!updatedDonation) {
    const error = new Error("Donation not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    donation: updatedDonation,
    message: "Donation marked as completed."
  };
};

exports.deleteDonation = async (id, userId) => {
  const donation = await Donation.findById(id);

  if (!donation) {
    const error = new Error("Donation not found");
    error.statusCode = 404;
    throw error;
  }

  if (donation.donorId.toString() !== userId) {
    const error = new Error("Not authorized to delete this donation");
    error.statusCode = 403;
    throw error;
  }

  await donation.deleteOne();

  return { message: "Donation deleted successfully" };
};

exports.getAllDonationsForAdmin = async () => {
  await syncDonationStatuses();

  return await Donation.find()
    .populate("donorId", "name email role userType")
    .sort({ createdAt: -1 });
};

exports.getAdminDashboardSummary = async () => {
  await syncDonationStatuses();

  const [
    totalDonations,
    activeDonations,
    completedDonations,
    expiredDonations,
    totalUsers,
    totalAdmins
  ] = await Promise.all([
    Donation.countDocuments(),
    Donation.countDocuments({ status: "active" }),
    Donation.countDocuments({ status: "completed" }),
    Donation.countDocuments({ status: "expired" }),
    Donor.countDocuments(),
    Donor.countDocuments({ role: "admin" })
  ]);

  return {
    donations: {
      total: totalDonations,
      active: activeDonations,
      completed: completedDonations,
      expired: expiredDonations
    },
    users: {
      total: totalUsers,
      admins: totalAdmins
    }
  };
};

exports.deleteDonationAsAdmin = async (id) => {
  const donation = await Donation.findById(id);

  if (!donation) {
    const error = new Error("Donation not found");
    error.statusCode = 404;
    throw error;
  }

  await donation.deleteOne();

  return { message: "Donation deleted successfully by admin" };
};
