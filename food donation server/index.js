const env = require("./config/env");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/", authRoutes);
app.use("/", donationRoutes);

// Error handling middleware (must be after all routes)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
