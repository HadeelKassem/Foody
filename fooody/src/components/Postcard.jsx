import React, { useState, useRef, useContext } from "react";
import "../stylesheets/Postcard.css";
import likeSound from "../assets/sound/like.wav";
import getApiUrl from "../config";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../context/DarkModeContext";

export default function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const token = localStorage.getItem("token");
  const API_URL = getApiUrl();
  const likeSoundRef = useRef(null);
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext); 

  const user = post.user || post.owner || {};

  // ================= Like =================
  const handleLikeClick = async () => {
    if (!token) return alert("You must be logged in to like posts");
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (likeSoundRef.current) {
        likeSoundRef.current.currentTime = 0;
        likeSoundRef.current.play().catch(() => {});
      }
      await onLike(post._id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  // ================= Comment =================
  const handleAddComment = async () => {
    if (!token) return alert("Login required");
    if (!commentText.trim()) return;
    if (isCommenting) return;

    setIsCommenting(true);
    try {
      await onComment(post._id, commentText.trim());
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasUserLiked = () => {
    if (!token || !post.likes) return false;
    return post.likes.some((like) => {
      if (typeof like === "string") return like === token;
      if (like._id) return like._id === token;
      return false;
    });
  };

  const goToProfile = () => {
    if (user?._id) navigate(`/user/${user._id}`);
  };

  return (
    <div className={`post-card ${darkMode ? "dark" : "light"}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="user-info" onClick={goToProfile} style={{ cursor: "pointer" }}>
          {user.profileImage ? (
            <img
              src={`${API_URL}${user.profileImage}`}
              alt={user.username || "User"}
              className="post-owner-image"
            />
          ) : (
            <div className="post-owner-placeholder">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className={`user-details ${darkMode ? "text-light" : "text-dark"}`}>
            <strong className="username">{user.username || "Unknown User"}</strong>
            {post.createdAt && <span className="post-time">{formatDate(post.createdAt)}</span>}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.text && <div className={`post-text ${darkMode ? "text-light" : "text-dark"}`}>{post.text}</div>}
        {post.imageUrl && (
          <div className="post-image-container">
            <img
              src={`${API_URL}${post.imageUrl}`}
              alt="Post"
              className="post-image"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={`post-stats ${darkMode ? "text-light" : "text-dark"}`}>
        <span className="likes-count">
          {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
        </span>
        <span className="comments-count">
          {post.comments?.length || 0} {post.comments?.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          onClick={handleLikeClick}
          className={`like-button ${hasUserLiked() ? "liked" : ""} ${darkMode ? "dark-btn" : ""}`}
          disabled={isLiking}
        >
          {isLiking ? "Liking..." : hasUserLiked() ? "Unlike" : "Like"}
        </button>
      </div>

      <audio ref={likeSoundRef} src={likeSound} preload="auto" />

      {/* Comments */}
      <div className={`post-comments ${darkMode ? "dark-comments" : ""}`}>
        <h4 className={darkMode ? "text-light" : "text-dark"}>Comments:</h4>
        {post.comments?.length > 0 ? (
          post.comments.map((comment) => {
            const commentUser = comment.user || {};
            return (
              <div key={comment._id || comment.text} className="comment">
                {commentUser.profileImage ? (
                  <img
                    src={`${API_URL}${commentUser.profileImage}`}
                    className="comment-user-image"
                    alt={commentUser.username || "User"}
                    onClick={() => commentUser._id && navigate(`/user/${commentUser._id}`)}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <div
                    className="comment-avatar default"
                    onClick={() => commentUser._id && navigate(`/user/${commentUser._id}`)}
                  >
                    {commentUser.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className={`comment-body ${darkMode ? "text-light" : "text-dark"}`}>
                  <strong
                    className="comment-author"
                    onClick={() => commentUser._id && navigate(`/user/${commentUser._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {commentUser.username || "Unknown"}:
                  </strong>
                  <span className="comment-text">{comment.text}</span>
                  {comment.createdAt && (
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className={darkMode ? "text-light" : "text-dark"}>No comments yet.</p>
        )}
      </div>

      {/* Add Comment */}
      {token && (
        <div className="add-comment">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCommenting}
            className={darkMode ? "dark-input" : ""}
          />
          <button
            onClick={handleAddComment}
            disabled={isCommenting || !commentText.trim()}
            className={darkMode ? "dark-btn" : ""}
          >
            {isCommenting ? "Posting..." : "Comment"}
          </button>
        </div>
      )}
    </div>
  );
}
