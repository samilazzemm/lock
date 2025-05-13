// const express = require('express');
// const router = express.Router();
// const Log = require('../models/logs'); // Assuming your log model is in models/logModel.js
// const User = require('../models/User'); // Assuming you have a user model for authorization

// // Middleware to verify if the user is admin or a regular user
// function verifyAdmin(req, res, next) {
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ message: 'User not authenticated' });
//   }

//   const userId = req.user.id; // Assuming you set the user ID in the request object after authentication

//   User.findById(userId).then(user => {
//     if (user && user.role === 'admin') {
//       next(); // Proceed if the user is an admin
//     } else {
//       res.status(403).json({ message: 'Permission denied. Admins only.' });
//     }
//   }).catch(err => {
//     console.error('Error verifying admin:', err);
//     res.status(500).json({ message: 'Error checking user role' });
//   });
// }

// // Get all logs (for admins)
// router.get('/', verifyAdmin, async (req, res) => {
//   try {
//     const logs = await Log.find()
//       .populate({ path: 'user', select: 'username', strictPopulate: false })
//       .populate({ path: 'doorId', select: 'name', strictPopulate: false })
//       .lean(); // optional, faster

//     res.status(200).json(logs);
//   } catch (err) {
//     console.error('Error fetching logs:', err); // 👉 Show full error in console
//     res.status(500).json({
//       message: 'Server error while fetching logs.',
//       error: err.message // 👉 Send readable error to frontend
//     });
//   }
// });

// // Get logs for a specific user's owned doors (for regular users)
// router.get('/logs/user', async (req, res) => {
//   const userId = req.user?.id; // Safely access user ID in case it's not defined
  
//   if (!userId) {
//     return res.status(401).json({ message: 'User not authenticated' });
//   }

//   try {
//     // Find the user's logs for their owned doors
//     const userLogs = await Log.find({ user: userId })
//       .populate('user', 'name email') // Include relevant user data
//       .populate('doorId', 'name'); // Include relevant door data
    
//     res.status(200).json(userLogs);
//   } catch (err) {
//     console.error('Error fetching user logs:', err); // Log errors for debugging
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Log = require('../models/logs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add the decoded user information to the request object
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to verify if the user is an admin
function verifyAdmin(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user.id;

  User.findById(userId).then(user => {
    if (user && user.role === 'admin') {
      next(); // Proceed if the user is an admin
    } else {
      res.status(403).json({ message: 'Permission denied. Admins only.' });
    }
  }).catch(err => {
    console.error('Error verifying admin:', err);
    res.status(500).json({ message: 'Error checking user role' });
  });
}

// Get all logs (for admins)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('user', 'username')
      .populate('doorId', 'name')
      .lean();

    res.status(200).json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({
      message: 'Server error while fetching logs.',
      error: err.message
    });
  }
});

// Get logs for a specific user's owned doors (for regular users)
router.get('/logs/user', verifyToken, async (req, res) => {
  const userId = req.user?.id; // Safely access user ID in case it's not defined
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Find the user's logs for their owned doors
    const userLogs = await Log.find({ user: userId })
      .populate('user', 'name email')
      .populate('doorId', 'name');
    
    res.status(200).json(userLogs);
  } catch (err) {
    console.error('Error fetching user logs:', err);
    res.status(500).json({ message: err.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { user, doorId, action } = req.body;

    if (!user || !doorId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newLog = new Log({
      user,
      doorId,
      action,
      timestamp: Date.now()
    });

    await newLog.save();
    res.status(201).json({ message: 'Log created successfully', log: newLog });
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ message: 'Server error creating log', error: err.message });
  }
});
module.exports = router;
