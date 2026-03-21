const mongoose = require("mongoose");
const { mongoUri } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      family: 4,
      autoIndex: true
    });

    console.log("MongoDB Connected");

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
