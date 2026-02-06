const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

/* ================= CREATE POST ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    const owner = req.user._id;

    const post = new Post({ text, imageUrl, owner });
    await post.save();

   
    const populatedPost = await post.populate("owner", "username profileImage");
    const formattedPost = { ...populatedPost.toObject(), user: populatedPost.owner };

    res.status(201).json(formattedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

/* ================= GET ALL POSTS ================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("owner", "username profileImage")
      .populate("comments.user", "username profileImage")
      .sort({ createdAt: -1 });

    
    const formattedPosts = posts.map(p => ({ ...p.toObject(), user: p.owner }));
    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= LIKE / UNLIKE ================= */
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const index = post.likes.findIndex(id => id.toString() === userId);
    if (index === -1) post.likes.push(userId);
    else post.likes.splice(index, 1);

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("owner", "username profileImage")
      .populate("comments.user", "username profileImage");

    res.json({ ...updatedPost.toObject(), user: updatedPost.owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= COMMENT ================= */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, user: req.user._id });
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("owner", "username profileImage")
      .populate("comments.user", "username profileImage");

    res.json({ ...updatedPost.toObject(), user: updatedPost.owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET POSTS BY USER ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const userPosts = await Post.find({ owner: req.params.userId })
      .populate("owner", "username profileImage")
      .populate("comments.user", "username profileImage")
      .sort({ createdAt: -1 });

    const formattedPosts = userPosts.map(p => ({ ...p.toObject(), user: p.owner }));
    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
