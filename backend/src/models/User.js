// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  profileImage: { 
    type: String, 
    default: "" 
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", userSchema);