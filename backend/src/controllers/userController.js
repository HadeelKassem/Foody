
const authService = require("../services/userServices");
const User = require("../models/User");

class UserController {
  async signup(req, res) {
    const { username, email, password } = req.body;

    try {
      const result = await authService.signup(username, email, password);
      res.json(result);
    } catch (err) {
      res.json({ success: false, message: "Server error" });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select("username profileImage followers following")
        .populate("followers", "username profileImage")
        .populate("following", "username profileImage");
      
      if (!user) return res.status(404).json({ message: "User not found" });
      
    
      const userWithCounts = {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length
      };
      
      res.json(userWithCounts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user._id; 
      const user = await User.findById(userId);
      
      if (!user) return res.status(404).json({ message: "User not found" });

    
      if (req.body.profileImage !== undefined) {
        user.profileImage = req.body.profileImage;
      }
      
      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }
      
      if (req.body.username !== undefined && req.body.username !== user.username) {
        
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
          return res.status(400).json({ message: "Username already taken" });
        }
        user.username = req.body.username;
      }

      await user.save();

     
      const updatedUser = await User.findById(userId)
        .select("-password")
        .populate("followers", "username profileImage")
        .populate("following", "username profileImage");

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          followers: updatedUser.followers,
          following: updatedUser.following,
          followersCount: updatedUser.followers.length,
          followingCount: updatedUser.following.length
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
  async followUser(req, res) {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params.userId; 
  
      if (currentUserId.toString() === targetUserId.toString()) {
        return res.status(400).json({ success: false, message: "Cannot follow yourself" });
      }
  
      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);
  
      if (!currentUser || !targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const isFollowing = currentUser.following.includes(targetUserId);
  
      if (isFollowing) {
        
        currentUser.following = currentUser.following.filter(
          id => id.toString() !== targetUserId.toString()
        );
        targetUser.followers = targetUser.followers.filter(
          id => id.toString() !== currentUserId.toString()
        );
      } else {
     
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
      }
  
      await currentUser.save();
      await targetUser.save();
  
      res.json({
        success: true,
        isFollowing: !isFollowing,
        followersCount: targetUser.followers.length,
        followingCount: currentUser.following.length
      });
    } catch (err) {
      console.error("Follow controller error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  
  async getFollowData(req, res) {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId)
        .populate("followers", "username profileImage")
        .populate("following", "username profileImage");
  
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      res.json({
        success: true,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length
      });
    } catch (err) {
      console.error("Get follow data error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  
  async checkFollowing(req, res) {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params.userId;
  
      const currentUser = await User.findById(currentUserId);
      const isFollowing = currentUser.following.includes(targetUserId);
  
      res.json({
        success: true,
        isFollowing
      });
    } catch (err) {
      console.error("Check following error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  
}

module.exports = new UserController();