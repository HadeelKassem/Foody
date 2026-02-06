
const Post = require("../models/Post");

// Create
exports.createPost = async ({ text, imageUrl, userId }) => {
  if (!userId) throw new Error("User ID is required");

  const post = await Post.create({
    text,
    imageUrl,
    user: userId
  });

  return Post.findById(post._id)
    .populate("user", "username profileImage");
};

// Get all
exports.getPosts = async () => {
  return Post.find()
    .populate("user", "username profileImage")
    .populate("comments.user", "username profileImage")
    .sort({ createdAt: -1 });
};

// Like / Unlike
exports.toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const index = post.likes.findIndex(
    id => id.toString() === userId.toString()
  );

  if (index === -1) post.likes.push(userId);
  else post.likes.splice(index, 1);

  await post.save();

  return Post.findById(post._id)
    .populate("user", "username profileImage")
    .populate("comments.user", "username profileImage");
};

// Comment
exports.addComment = async (postId, userId, text) => {
  if (!text) throw new Error("Comment text required");

  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  post.comments.push({ text, user: userId });
  await post.save();

  return Post.findById(post._id)
    .populate("user", "username profileImage")
    .populate("comments.user", "username profileImage");
};
