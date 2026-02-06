// services/userServices.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  async signup(username, email, password) {
    const exists = await User.findOne({ email });
    if (exists) return { success: false, message: "Email already exists" };

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    return { success: true, message: "User created" };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) return { success: false, message: "User not found" };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false, message: "Wrong password" };

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Return user data along with token
    return { 
      success: true, 
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    };
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .select("-password")
        .populate("followers", "username profileImage")
        .populate("following", "username profileImage")
        .populate("userData", "username profileImage");
      
      if (!user) return { success: false, message: "User not found" };
      
      return { 
        success: true, 
        user: {
          ...user.toObject(),
          followersCount: user.followers.length,
          followingCount: user.following.length
        }
      };
    } catch (err) {
      return { success: false, message: "Server error" };
    }
  }

  async followUser(currentUserId, targetUserId) {
    try {
      if (currentUserId === targetUserId) {
        return { success: false, message: "Cannot follow yourself" };
      }

      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
        return { success: false, message: "User not found" };
      }

      // Check if already following
      const isFollowing = currentUser.following.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(
          id => id.toString() !== targetUserId.toString()
        );
        targetUser.followers = targetUser.followers.filter(
          id => id.toString() !== currentUserId.toString()
        );
      } else {
        // Follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
      }

      await currentUser.save();
      await targetUser.save();

      // Get updated counts
      const updatedCurrentUser = await User.findById(currentUserId)
        .populate("following", "username profileImage");
      const updatedTargetUser = await User.findById(targetUserId)
        .populate("followers", "username profileImage");

      return {
        success: true,
        isFollowing: !isFollowing,
        currentUser: {
          followingCount: updatedCurrentUser.following.length,
          following: updatedCurrentUser.following
        },
        targetUser: {
          followersCount: updatedTargetUser.followers.length,
          followers: updatedTargetUser.followers
        }
      };
    } catch (err) {
      console.error("Follow error:", err);
      return { success: false, message: "Server error" };
    }
  }

  async getFollowData(userId) {
    try {
      const user = await User.findById(userId)
        .populate("followers", "username profileImage")
        .populate("following", "username profileImage");

      if (!user) return { success: false, message: "User not found" };

      return {
        success: true,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length
      };
    } catch (err) {
      console.error("Get follow data error:", err);
      return { success: false, message: "Server error" };
    }
  }

  async checkIfFollowing(currentUserId, targetUserId) {
    try {
      const currentUser = await User.findById(currentUserId);
      const isFollowing = currentUser.following.includes(targetUserId);
      
      return {
        success: true,
        isFollowing
      };
    } catch (err) {
      return { success: false, message: "Server error" };
    }
  }
}

module.exports = new AuthService();