import React, { useState, useContext, useRef } from "react";
import getApiUrl from "../config";
import "../stylesheets/Settings.css";
import { AuthContext } from "../context/AuthContext";
import { DarkModeContext } from "../context/DarkModeContext"; 

/// Dark mode is not functioning, didn't get time to finish working on it , please ignore it 

export default function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext); 
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const API_URL = getApiUrl();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setProfileImage(file);
  };

  const handleSave = async () => {
    if (!token) return alert("Login required");
    setLoading(true);

    try {
      let uploadedUrl = user?.profileImage;

      
      if (profileImage) {
        const fd = new FormData();
        fd.append("image", profileImage);

        const uploadRes = await fetch(`${API_URL}/api/upload/profile`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed: ${errorText}`);
        }

        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.imageUrl;
      }

      
      const res = await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImage: uploadedUrl, isPrivate }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Profile update failed: ${errorText}`);
      }

      const data = await res.json();

      
      setUser(data.user);
      alert("Profile updated successfully!");
      setProfileImage(null);
      setPreview(null);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`settings-container ${darkMode ? "dark" : "light"}`}>
      <h2 className={darkMode ? "text-light" : "text-dark"}>Settings</h2>

      {/* Profile Image */}
      <div className="profile-image-section">
        <label className={darkMode ? "text-light" : ""}>Profile Image:</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
         
        />

        {preview ? (
          <img src={preview} alt="Preview" className="profile-preview" />
        ) : user?.profileImage ? (
          <img src={`${API_URL}${user.profileImage}`} alt="Profile" className="profile-preview" />
        ) : (
          <div className="profile-placeholder">No Image</div>
        )}
      </div>

    

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`save-btn ${darkMode ? "dark-btn" : ""}`}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
