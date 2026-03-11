const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
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