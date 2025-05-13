const mongoose = require("mongoose");

const DoorSchema = new mongoose.Schema({
  name: String,
  location: String,
  status: { type: String, enum: ["open", "closed"], default: "closed" },
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Multiple owners
  logs: [
    {
      owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      action: { type: String, enum: ["enter", "exit"] },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Door", DoorSchema);
