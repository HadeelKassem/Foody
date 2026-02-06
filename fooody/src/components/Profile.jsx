import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DarkModeContext } from "../context/DarkModeContext";
import PostCard from "./Postcard.jsx";
import getApiUrl from "../config.js";
import "../stylesheets/Profile.css";

export default function Profile() {
  const { user: currentUser, logout } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const API_URL = getApiUrl();
  const token = localStorage.getItem("token");

  const [userProfile, setUserProfile] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followData, setFollowData] = useState({
    followersCount: 0,
    followingCount: 0,
    followers: [],
    following: [],
  });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  
  const fetchUsers = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const promises = ids.map((id) =>
      fetch(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => data.user || data)
        .catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  };

  const loadUserData = async () => {
    if (!currentUser?._id) return;

    setLoading(true);
    try {
      setUserProfile(currentUser);

    
      const postsRes = await fetch(`${API_URL}/api/posts/user/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await postsRes.json();
      setPosts(Array.isArray(postsData) ? postsData : postsData.posts || []);

      
      await fetchFollowData();
    } catch (err) {
      console.error("Failed to load user data:", err);
      setPosts([]);
      setFollowData({
        followersCount: 0,
        followingCount: 0,
        followers: [],
        following: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowData = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser._id}/follower`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const followersFull = await fetchUsers(data.followers || []);
        const followingFull = await fetchUsers(data.following || []);
        setFollowData({
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          followers: followersFull,
          following: followingFull,
        });
      }
    } catch (err) {
      console.error("Failed to fetch follow data:", err);
    }
  };

  // Follow/unfollow
  const handleFollow = async (targetUserId) => {
    if (!token) return alert("You must be logged in");
    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${targetUserId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchFollowData();
      } else {
        alert(data.message || "Failed to follow/unfollow");
      }
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      alert("Error following/unfollowing user");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openFollowersModal = () => setShowFollowersModal(true);
  const openFollowingModal = () => setShowFollowingModal(true);
  const closeModal = () => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadUserData();
    
  }, [currentUser]);

  if (!currentUser || loading) {
    return (
      <div className={`profile-loading ${darkMode ? "dark" : "light"}`}>
        <p>Loading profile...</p>
      </div>
    );
  }

  // ----------------------
  // Modal component inside Profile
  // ----------------------
  const Modal = ({ title, users }) => (
    <div className={`modal-overlay ${darkMode ? "dark" : ""}`} onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className={darkMode ? "text-light" : ""}>{title}</h3>
          <button className={`modal-close ${darkMode ? "dark-btn" : ""}`} onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {users.length === 0 ? (
            <p className={darkMode ? "text-light" : ""}>No users to display</p>
          ) : (
            <div className="user-list">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="user-list-item"
                  onClick={() => navigate(`/user/${user._id}`)}
                >
                  {user?.profileImage ? (
                    <img
                      src={`${API_URL}${user.profileImage}`}
                      alt={user.username}
                      className="user-list-avatar"
                    />
                  ) : (
                    <div className="user-list-avatar-placeholder">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className={darkMode ? "text-light" : ""}>{user?.username || "Unknown"}</span>
                  {user._id !== currentUser._id && (
                    <button
                      className={`user-list-follow-btn ${darkMode ? "dark-btn" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user._id);
                      }}
                    >
                      {followLoading ? "..." : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ----------------------
  // JSX Return
  // ----------------------
  return (
    <div className={`profile-page ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <div className={`profile-nav ${darkMode ? "dark-nav" : ""}`}>
        <button className="nav-button back-button" onClick={() => navigate("/main")}>
          ◀ Back to Feed
        </button>
        <h2 className={`page-title ${darkMode ? "text-light" : "text-dark"}`}>My Profile</h2>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image-section">
            {userProfile?.profileImage ? (
              <img src={`${API_URL}${userProfile.profileImage}`} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {userProfile?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button
              className={`edit-profile-button ${darkMode ? "dark-btn" : ""}`}
              onClick={() => navigate("/settings")}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-info">
            <h1 className={`profile-username ${darkMode ? "text-light" : "text-dark"}`}>
              {userProfile?.username || "Guest"}
            </h1>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item clickable" onClick={openFollowersModal} title="View Followers">
                <span className="stat-number">{followData.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item clickable" onClick={openFollowingModal} title="View Following">
                <span className="stat-number">{followData.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            <div className="profile-actions">
              <button
                className={`action-button logout-button ${darkMode ? "dark-btn" : ""}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="profile-posts-section">
          <div className="section-header">
            <h2 className={darkMode ? "text-light" : "text-dark"}>My Posts</h2>
            {posts.length > 0 && <span className="posts-count">{posts.length} posts</span>}
          </div>
          {Array.isArray(posts) && posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onLike={undefined} onComment={undefined} />
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>You haven't created any posts yet.</p>
              <button
                className={`create-first-post-button ${darkMode ? "dark-btn" : ""}`}
                onClick={() => navigate("/main")}
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && <Modal className="Modal" title={`Followers (${followData.followersCount})`} users={followData.followers} />}

      {/* Following Modal */}
      {showFollowingModal && <Modal className="Modal" title={`Following (${followData.followingCount})`} users={followData.following} />}
    </div>
  );
}
