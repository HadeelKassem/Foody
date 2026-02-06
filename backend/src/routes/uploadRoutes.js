const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// POST /api/upload/post
router.post("/post", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    success: true,
    imageUrl: `/uploads/${req.file.filename}`
  });
});

// POST /api/upload/profile
router.post("/profile", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    success: true,
    imageUrl: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
