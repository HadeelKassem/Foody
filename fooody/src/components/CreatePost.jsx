
import React, { useState, useRef } from "react";
import "../stylesheets/Createpost.css";
import getApiUrl from "../config";

export default function CreatePost({ onPosted }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = getApiUrl();
  const fileInputRef = useRef(null);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/api/upload/post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Login required");
    if (!text.trim() && !imageUrl) return alert("Add text or image");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: text.trim(), imageUrl })
      });

      const newPost = await res.json();
      if (!res.ok) throw new Error(newPost.message || "Failed to create post");

      
      onPosted?.(newPost);

      setText("");
      setImageUrl("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h2>Create a Post</h2>
      <textarea
        rows={4}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview-header">
            <span>Image Preview:</span>
            <button
              type="button"
              className="remove-image-btn"
              onClick={removeImage}
              disabled={loading}
            >
              ✕
            </button>
          </div>
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview" className="image-preview" />
          </div>
        </div>
      )}
      <div className="file-input-container">
        <label className="choosebutton">
          Choose Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={loading}
            style={{ display: "none" }}
          />
        </label>
        {!imagePreview && imageUrl && (
          <div className="image-preview-message">
            <p>Image uploaded ✓</p>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || (!text.trim() && !imageUrl)}
        className={loading ? "loading" : ""}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
