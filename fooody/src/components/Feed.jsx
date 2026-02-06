import React, { useEffect, useState, useContext } from "react";
import PostCard from "./Postcard";
import CreatePost from "./CreatePost";
import getApiUrl from "../config";
import { DarkModeContext } from "../context/DarkModeContext"; 
import "../stylesheets/Feed.css"; 

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");
  const API_URL = getApiUrl();
  const { darkMode } = useContext(DarkModeContext); 

  useEffect(() => {
    fetchPosts();
   
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts`);
      const data = await res.json();

     
      const formatted = (data || []).map((post) => {
        if (!post.user && post.owner) post.user = post.owner;
        return post;
      });

      setPosts(Array.isArray(formatted) ? formatted : []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  const handleNewPost = (newPost) => {
    if (!newPost || typeof newPost !== "object") return;

   
    if (!newPost.user && newPost.owner) newPost.user = newPost.owner;

    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    if (!token) return alert("Login required");
    const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    if (!updated.user && updated.owner) updated.user = updated.owner;
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  const handleComment = async (postId, text) => {
    if (!token) return alert("Login required");
    const res = await fetch(`${API_URL}/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    const updated = await res.json();
    if (!updated.user && updated.owner) updated.user = updated.owner;
    setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
  };

  return (
    <div className={`feed-container ${darkMode ? "dark" : "light"}`}>
      {token && <CreatePost onPosted={handleNewPost} />}
      <h2 className={darkMode ? "text-light" : "text-dark"}>Posts</h2>
      {posts.length === 0 ? (
        <p className={darkMode ? "text-light" : "text-dark"}>No posts yet</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            onLike={handleLike}
            onComment={handleComment}
            darkMode={darkMode} 
          />
        ))
      )}
    </div>
  );
}
