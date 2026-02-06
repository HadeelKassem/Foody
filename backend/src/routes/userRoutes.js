const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// Protected
router.get("/auth/verify", auth, (req, res) => res.json({ success: true, user: req.user }));
router.get("/profile", auth, (req, res) => res.json({ success: true, user: req.user }));
router.put("/update", auth, userController.updateProfile);

// FOLLOW ROUTES
router.post("/:userId/follow", auth, userController.followUser);
router.get("/:userId/follower", auth, userController.getFollowData);
router.get("/:userId/follow/check", auth, userController.checkFollowing);

router.get("/:userId", userController.getUserById);

module.exports = router;
