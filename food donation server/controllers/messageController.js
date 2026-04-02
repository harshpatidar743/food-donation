const mongoose = require("mongoose");
const Contact = require("../models/contact");

const buildHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();

    res.set("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildHttpError("Invalid message id.", 400);
    }

    const deletedMessage = await Contact.findByIdAndDelete(id);

    if (!deletedMessage) {
      throw buildHttpError("Message not found.", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: deletedMessage._id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
};
