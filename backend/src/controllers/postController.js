// controllers/postController.js
import * as postService from "../services/postService.js";

export const createPost = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text && !imageUrl) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    const post = await postService.createPost({
      text,
      imageUrl,
      userId: req.user._id
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
