const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    req.user = await User.findById(decoded.id)
      .select("-password") 
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");
    
    if (!req.user) return res.status(401).json({ message: "Invalid user" });
    
   
    req.user = {
      ...req.user.toObject(),
      followersCount: req.user.followers.length,
      followingCount: req.user.following.length
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;