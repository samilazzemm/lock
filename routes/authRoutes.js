const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// Register user (admin only)
router.post("/register", authenticateToken, async (req, res) => {
  const { username, password, role } = req.body;

  // Ensure that only admin can register users
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admin can register users" });
  }

  // Check if the username already exists
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username already taken" });

  // Store the password in plain text (no hashing or encryption)
  const newUser = new User({ username, password, role });
  await newUser.save();

  res.json({ message: "User registered", user: newUser });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Directly compare the plain text password
  if (password !== user.password) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Create a token for the user
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
  // Send the token back in a cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });

  res.json({ message: "Login successful", token, user: { _id: user._id, username, role: user.role } });
});

// Get all users (optional)
router.get("/", async (req, res) => {
  const users = await User.find({}, "username _id");
  res.json(users);
});

module.exports = router;
