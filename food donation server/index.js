const env = require("./config/env");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donationRoutes = require("./routes/donationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { globalLimiter, loginLimiter, contactLimiter } = require("./middleware/rateLimiter");

const app = express();

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.use("/login", loginLimiter);
app.use("/api/contact", contactLimiter);
app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/", authRoutes);
app.use("/", donationRoutes);
app.use("/admin", adminRoutes);
app.use("/api", contactRoutes);
app.use("/api", messageRoutes);

// Error handling middleware (must be after all routes)
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
