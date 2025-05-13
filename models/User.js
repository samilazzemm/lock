const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["admin", "client"], required: true },
});

module.exports = mongoose.model("User", UserSchema);
