const Door = require("../models/Door");
const User = require("../models/User");
const Log = require("../models/logs");

// Controller to create a new door
exports.createDoor = async (req, res) => {
  const { doorName, ownerId } = req.body;

  // Ensure both doorName and ownerId are provided
  if (!doorName || !ownerId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create new door and set the default status
    const newDoor = new Door({
      name: doorName,        // Use name as per the schema
      status: "closed",      // Default status
      owners: [ownerId],     // Add the owner as the first user
    });

    // Save the new door to the database
    await newDoor.save();

    // Respond with the created door object
    res.status(201).json({
      message: "Door created successfully",
      door: newDoor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.unlockDoor = async (req, res) => {
  try {
    const { ip } = req.params;
    const targetIP = ip === 'default' ? process.env.ESP32_IP : ip;
    await axios.get(`http://${targetIP}/lock/on`);
    res.status(200).json({ message: 'Lock opened' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to open lock' });
  }
};

exports.lockDoor = async (req, res) => {
  try {
    const { ip } = req.params;
    const targetIP = ip === 'default' ? process.env.ESP32_IP : ip;
    await axios.get(`http://${targetIP}/lock/off`);
    res.status(200).json({ message: 'Lock closed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to close lock' });
  }
};
// Controller to add an owner to a door
exports.addOwnerToDoor = async (req, res) => {
  const { doorId, ownerId } = req.body;

  if (!doorId || !ownerId) {
    return res.status(400).json({ message: "Door ID and Owner ID are required" });
  }

  try {
    // Check if door exists
    const door = await Door.findById(doorId);
    if (!door) return res.status(404).json({ message: "Door not found" });

    // Check if user exists
    const user = await User.findById(ownerId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Avoid duplicate owners
    if (!door.owners.includes(ownerId)) {
      door.owners.push(ownerId);
      await door.save();
    }

    res.status(200).json({ message: "Owner added to door", door });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to log entry or exit
exports.logAccess = async (req, res) => {
  const { doorId, ownerId, action } = req.body;
  if (!doorId || !ownerId || !["enter", "exit"].includes(action)) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  try {
    const door = await Door.findById(doorId);
    if (!door) return res.status(404).json({ message: "Door not found" });

    if (!door.owners.includes(ownerId)) {
      return res.status(403).json({ message: "User does not have access to this door" });
    }

    door.logs.push({ owner: ownerId, action });
    await door.save();

    res.status(200).json({ message: "Access logged", door });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to get logs for a specific door
exports.getDoorLogs = async (req, res) => {
  const { doorId } = req.params;

  try {
    const door = await Door.findById(doorId).populate("logs.owner", "username");
    if (!door) return res.status(404).json({ message: "Door not found" });

    res.status(200).json({ logs: door.logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getDoorsByOwner = async (req, res) => {
  try {
    const userId = req.query.userId; // Get the userId from the request query

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const doors = await Door.find({ owners: userId }); // Fetch doors where the user is an owner
    res.json(doors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doors", error });
  }
};
exports.logDoorAction = async (req, res) => {
  const { doorId, action } = req.body;
  const userId = req.user._id; // coming from authentication middleware

  try {
    const newLog = await Log.create({
      user: userId,
      doorId,
      action
    });
    res.status(201).json({ message: "Log created", log: newLog });
  } catch (err) {
    console.error("Error saving log:", err);
    res.status(500).json({ error: "Could not save log" });
  }
};