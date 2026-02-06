import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "./Postcard.jsx";
import Navbar from "./Navbar.jsx";
import { AuthContext } from "../context/AuthContext";
import getApiUrl from "../config.js";
import "../stylesheets/ViewUserProfile.css";

export default function ViewUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const API_URL = getApiUrl();
  const token = localStorage.getItem("token");

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followData, setFollowData] = useState({
    followersCount: 0,
    followingCount: 0,
    followers: [],
    following: [],
    isFollowing: false
  });
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      
      const postsRes = await fetch(`${API_URL}/api/posts/user/${userId}`);
      const postsData = await postsRes.json();
      setPosts(postsData);

      
      const userRes = await fetch(`${API_URL}/api/users/${userId}`);
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data.user || data); 
      }

      
      await fetchFollowData();
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowData = async () => {
    try {
      
      const res = await fetch(`${API_URL}/api/users/${userId}/follower`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFollowData(prev => ({
          ...prev,
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          followers: data.followers || [],
          following: data.following || []
        }));
      }

      
      if (token) {
        const checkRes = await fetch(`${API_URL}/api/users/${userId}/follow/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          setFollowData(prev => ({
            ...prev,
            isFollowing: checkData.isFollowing || false
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching follow data:", err);
    }
  };

  const handleFollow = async () => {
    if (!token) {
      alert("You must be logged in to follow users");
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
       
        setFollowData(prev => ({
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.followersCount
        }));

       
        await fetchFollowData();
      } else {
        alert(data.message || "Failed to follow user");
      }
    } catch (err) {
      console.error("Error following user:", err);
      alert("Failed to follow user. Try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!token) {
      alert("You must be logged in to like posts");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to like post");
      const updatedPost = await res.json();
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!token) {
      alert("You must be logged in to comment");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("Failed to comment");
      const updatedPost = await res.json();
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  const openFollowersModal = () => setShowFollowersModal(true);
  const openFollowingModal = () => setShowFollowingModal(true);
  const closeModal = () => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
  };

  if (loading) {
    return (
      <div className="view-user-profile">
        <Navbar />
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-user-profile">
      <Navbar />

      <div className="profile-container">
        <button className="back-button" onClick={() => navigate(-1)}>◀ Back</button>

        {/* User Header */}
        <div className="user-header">
         
          <div className="user-info">
           
            <div className="user-stats">
              <span>{posts.length} Posts</span>
              <span className="clickable-stat" onClick={openFollowersModal} title="Followers">{followData.followersCount} Followers</span>
              <span className="clickable-stat" onClick={openFollowingModal} title="Following">{followData.followingCount} Following</span>
            </div>

            {/* Follow Button */}
            {currentUser && currentUser._id !== userId && (
              <button
                className={`follow-button ${followData.isFollowing ? "following" : ""}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? "Processing..." : followData.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="user-posts-section">
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <p>No posts yet</p>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard key={post._id} post={post} onLike={handleLike} onComment={handleComment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Followers ({followData.followersCount})</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {followData.followers.length === 0 ? (
                <p>No followers yet</p>
              ) : (
                <div className="user-list">
                  {followData.followers.map(u => (
                    <div key={u._id} className="user-list-item" onClick={() => navigate(`/user/${u._id}`)}>
                      {u.profileImage ? <img src={`${API_URL}${u.profileImage}`} alt={u.username} className="user-list-avatar" /> : <div className="user-list-avatar-placeholder">{u.username?.[0]?.toUpperCase()}</div>}
                      <span>{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Following ({followData.followingCount})</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {followData.following.length === 0 ? (
                <p>Not following anyone yet</p>
              ) : (
                <div className="user-list">
                  {followData.following.map(u => (
                    <div key={u._id} className="user-list-item" onClick={() => navigate(`/user/${u._id}`)}>
                      {u.profileImage ? <img src={`${API_URL}${u.profileImage}`} alt={u.username} className="user-list-avatar" /> : <div className="user-list-avatar-placeholder">{u.username?.[0]?.toUpperCase()}</div>}
                      <span>{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
