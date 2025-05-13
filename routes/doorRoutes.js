const express = require("express");
const mongoose = require('mongoose');

const router = express.Router();
const Door = require("../models/Door");
const User = require("../models/User"); // Ensure User model is imported
const authenticateToken = require("../middleware/authMiddleware");
const {
  createDoor,
  addOwnerToDoor,
  logAccess,
  getDoorLogs,
  getDoorsByOwner,unlockDoor, lockDoor ,
} = require("../controllers/doorController");
//
//const { } = require('../controllers/doorController');
//const Log = require("../models/logs");

router.get('/lock/:ip/on', unlockDoor);
router.get('/lock/:ip/off', lockDoor);
router.get('/lock/on', (req, res) => unlockDoor({ ...req, params: { ip: 'default' } }, res));
router.get('/lock/off', (req, res) => lockDoor({ ...req, params: { ip: 'default' } }, res));
// ✅ Update Door Status (PUT /api/doors/update-status/:id)
// router.post("/:doorId/:action", authenticateToken, async (req, res) => {
//   const { doorId, action } = req.params; // action: opened or closed
//   const userId = req.user._id;

//   try {
//     await axios.get(`http://${ESP32_IP}/door/${action}`);

//     await Log.create({
//       user: userId,
//       doorId,
//       action,
//     });

//     res.json({ message: `Door ${action} and logged.` });
//   } catch (error) {
//     res.status(500).json({ error: "Action failed", details: error.message });
//   }
// });
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedDoor = await Door.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedDoor) return res.status(404).json({ error: "Door not found" });

    res.json(updatedDoor);
  } catch (error) {
    res.status(500).json({ error: "Failed to update door status" });
  }
});

// ✅ Add a New Door (POST /api/doors)
router.post("/", createDoor);

// ✅ Get All Doors (GET /api/doors)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user's ID
    const userRole = req.user.role; // Get user role

    let doors;
    if (userRole === "admin") {
      doors = await Door.find().populate("owners", "username _id"); // Admin sees all doors
    } else {
      doors = await Door.find({ owners: userId }).populate("owners", "username _id"); // Clients see only their doors
    }

    res.status(200).json(doors);
  } catch (error) {
    console.error("❌ Error fetching doors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/doors-by-owner", getDoorsByOwner);
router.delete('/remove-owner', async (req, res) => {
  try {
      const { doorId, userId } = req.query;  // Ensure you're using query params

      if (!doorId || !userId) {
          return res.status(400).json({ error: 'Missing doorId or userId' });
      }

      const door = await Door.findByIdAndUpdate(
          doorId,
          { $pull: { owners: userId } },
          { new: true }
      );

      if (!door) {
          return res.status(404).json({ error: 'Door not found' });
      }

      res.status(200).json({ message: 'Owner removed successfully' });
  } catch (err) {
      console.error('Error removing owner:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
// ✅ Add an Owner to a Door (POST /api/doors/add-owner)
router.post("/add-owner", async (req, res) => {
  try {
    const { doorId, userId } = req.body;

    if (!doorId || !userId) {
      return res.status(400).json({ error: "Door ID and User ID are required" });
    }

    const door = await Door.findById(doorId);
    if (!door) {
      return res.status(404).json({ error: "Door not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (door.owners.includes(userId)) {
      return res.status(400).json({ error: "User is already an owner of this door" });
    }

    door.owners.push(userId);
    await door.save();

    res.json({ message: "Owner added successfully", door });
  } catch (error) {
    console.error("❌ Error adding owner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Remove owner from door


// 🛑 Make sure other routes like "/:id" come AFTER this route
router.delete("/:id", async (req, res) => {
  try {
    const doorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doorId)) {
      return res.status(400).json({ error: "❌ Invalid Door ID" });
    }

    const door = await Door.findByIdAndDelete(doorId);
    if (!door) {
      return res.status(404).json({ error: "❌ Door not found" });
    }

    res.json({ message: "✅ Door deleted successfully" });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Owners of a Door (GET /api/doors/:id/owners)
router.get("/:id/owners", async (req, res) => {
  try {
    const door = await Door.findById(req.params.id).populate("owners", "username _id");
    if (!door) {
      return res.status(404).json({ error: "Door not found" });
    }

    res.json(door.owners);
  } catch (error) {
    console.error("❌ Error fetching owners:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Log Access Entry/Exit (POST /api/doors/log-access)
router.post("/log-access", logAccess);

// ✅ Get Logs for a Door (GET /api/doors/:doorId/logs)
router.get("/:doorId/logs", getDoorLogs);

module.exports = router;
