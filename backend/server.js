const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Global error handler (catch unexpected errors)
app.use((err, req, res, next) => {
  console.error("Global server error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Server
app.listen(5000, "0.0.0.0", () =>
  console.log("Server running on port 5000")
);
