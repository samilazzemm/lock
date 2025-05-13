// models/Log.js
const mongoose = require("mongoose");
 
const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming you already have a User model
    required: true
  },
  doorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Door",
    required: true
  },
  action: {
    type: String,
    enum: ["opened", "closed"],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Log", logSchema);